import threading
from typing import Union

import uvicorn
from fastapi import Depends, FastAPI, Query, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

from sec_2022_server.game import GameManager
from sec_2022_server.type_defs import ClientMessage

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[
            str, dict[str, Union[WebSocket, GameManager]]
        ] = {}  # dict[token, dict[client_id | "game_manager", websocket | GameManager]]

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

        for (id, connection) in self.active_connections.get(token).items():
            if id == "game_manager":
                continue
            await connection.send_text(message)

    async def broadcast_json(self, message: str, token: str):
        """Send a JSON message to all connections with a specific token"""
        if not self.active_connections.get(token):
            return

        for (id, connection) in self.active_connections.get(token).items():
            if id == "game_manager":
                continue
            await connection.send_json(message)

    def initialize_game(self, token: str):
        """Initialize a new game"""
        if not self.active_connections.get(token):
            return

        client_ids = [id for id in self.active_connections[token] if id != "game_manager"]
        self.active_connections[token]["game_manager"] = GameManager(client_ids)

    async def broadcast_game_state(self, token: str):
        """Broadcast the current game state to all connections with a specific token"""
        if not self.active_connections.get(token):
            return
        if not self.active_connections[token].get("game_manager"):
            return

        game_state = self.active_connections[token]["game_manager"].get_game_state()
        await self.broadcast_json(game_state, token)

    def update_game(self, token: str, client_id: str, move: dict[str, str]):
        """Update the game state for a specific client"""
        if not self.active_connections.get(token):
            return
        if not self.active_connections[token].get("game_manager"):
            return

        self.active_connections[token]["game_manager"].move(client_id, move)

    def ai_move(self, token: str, client_id: str):
        """Make an AI move for a specific client"""
        if not self.active_connections.get(token):
            return
        if not self.active_connections[token].get("game_manager"):
            return

        self.active_connections[token]["game_manager"].ai_move(client_id)


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
            manager.ai_move(token, client_id)

            # TODO: Handle any other game updates here

            # set timer for player
            # if timer runs out, make AI move

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
