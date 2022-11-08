from typing import Union

from fastapi import WebSocket

from sec_2022_server.game import GameManager


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
