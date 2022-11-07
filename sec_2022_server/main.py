from typing import Union

import uvicorn
from fastapi import Depends, FastAPI, Query, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

from sec_2022_server.game import GameManager
from sec_2022_server.type_defs import ClientMessage

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        # dict[token, dict[client_id, websocket]]
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

        self.game_managers: dict[str, GameManager] = {}  # dict[token, GameManager]

    async def connect(self, websocket: WebSocket, token: str, client_id: str):
        """Connect to a room with a specific token"""
        await websocket.accept()
        if self.active_connections.get(token):
            # Token already exists, add new connection
            self.active_connections[token][client_id] = websocket
            return

        # Otherwise, create new token and add connection
        self.active_connections[token] = {client_id: websocket}

    def disconnect(self, token: str, client_id: str):
        """Disconnect a specific connection"""
        if self.active_connections.get(token):
            del self.active_connections[token][client_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific connection"""
        await websocket.send_text(message)

    async def broadcast(self, message: str, token: str):
        """Send a message to all connections with a specific token"""
        if not self.active_connections.get(token):
            return

        for (id, connection) in self.active_connections[token].items():
            if id == "game_manager":
                continue
            try:
                await connection.send_text(message)
            except RuntimeError:
                print("WARN: Tried to send text to closed connection")

    async def broadcast_json(self, message: Union[str, dict], token: str):
        """Send a JSON message to all connections with a specific token"""
        if not self.active_connections.get(token):
            return

        for (id, connection) in self.active_connections[token].items():
            if id == "game_manager":
                continue
            try:
                await connection.send_json(message)
            except RuntimeError:
                print("WARN: Tried to send JSON to closed connection")

    def initialize_game(self, token: str):
        """Initialize a new game"""
        if not self.active_connections.get(token):
            return

        client_ids = [id for id in self.active_connections[token]]
        self.game_managers[token] = GameManager(client_ids)

    async def broadcast_game_state(self, token: str):
        """Broadcast the current game state to all connections with a specific token"""
        if not self.active_connections.get(token) or not self.game_managers.get(token):
            return

        game_state = self.game_managers[token].get_game_state()
        await self.broadcast_json(game_state, token)

    def update_game(self, token: str, client_id: str, move: dict[str, str]):
        """Update the game state for a specific client"""
        if not self.active_connections.get(token) or not self.game_managers.get(token):
            return

        self.game_managers[token].move(client_id, move)

    async def ai_move(self, token: str, client_id: str):
        """Make an AI move for a specific client"""
        if not self.active_connections.get(token) or not self.game_managers.get(token):
            return

        await self.game_managers[token].ai_move(client_id)


manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse("<h1>TODO: Serve Client!</h1>")


async def get_token(websocket: WebSocket, token: Union[str, None] = Query(default=None)):
    if token:
        return token
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: str = Depends(get_token)):
    await manager.connect(websocket, token, client_id)
    try:
        # TODO: Handle ready and start messages before initializing game
        manager.initialize_game(token)

        await manager.broadcast_game_state(token)

        while True:
            data: ClientMessage = await websocket.receive_json()

            manager.update_game(token, client_id, data["move"])

            # Make AI move
            await manager.ai_move(token, client_id)

            # TODO: Handle any other game updates here

            await manager.broadcast_game_state(token)

            # To handle messaging / chat, we can use:
            # For specific user:
            # await manager.send_personal_message(f"Your message here", websocket)
            # Where websocket is the connection to send to
            # For all users (in lobby):
            # await manager.broadcast(f"Your message here", token)

    except WebSocketDisconnect:
        manager.disconnect(token, client_id)
        await manager.broadcast(f"Client #{client_id} left the chat", token)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
