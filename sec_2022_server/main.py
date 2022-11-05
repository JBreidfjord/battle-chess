import uvicorn
from fastapi import Depends, FastAPI, Query, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, token: str):
        """Connect to a room with a specific token"""
        await websocket.accept()
        if self.active_connections.get(token):
            # Token already exists, add new connection
            self.active_connections[token].append(websocket)
            return

        # Otherwise, create new token and add connection
        self.active_connections[token] = [websocket]

    def disconnect(self, websocket: WebSocket, token: str):
        """Disconnect a specific connection"""
        self.active_connections.get(token).remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific connection"""
        await websocket.send_text(message)

    async def broadcast(self, message: str, token: str):
        """Send a message to all connections with a specific token"""
        for connection in self.active_connections.get(token):
            await connection.send_text(message)

    async def broadcast_json(self, message: str, token: str):
        """Send a JSON message to all connections with a specific token"""
        for connection in self.active_connections.get(token):
            await connection.send_json(message)


manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse("<h1>TODO: Serve Client!</h1>")


async def get_token(websocket: WebSocket, token: str | None = Query(default=None)):
    if token:
        return token
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: str = Depends(get_token)):
    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_json()
            # TODO: Handle any game updates here
            await manager.broadcast_json(data, token)

            # To handle messaging / chat, we can use:
            # For specific user:
            # await manager.send_personal_message(f"Your message here", websocket)
            # Where websocket is the connection to send to
            # For all users (in lobby):
            # await manager.broadcast(f"Your message here", token)

    except WebSocketDisconnect:
        manager.disconnect(websocket, token)
        await manager.broadcast(f"Client #{client_id} left the chat", token)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
