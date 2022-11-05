import uvicorn
from fastapi import Depends, FastAPI, Query, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <label>Token: <input type="text" id="token" autocomplete="off" value="some-key-token"/></label>
            <button onclick="connect(event)">Connect</button>
            <hr>
            <label>Message: <input type="text" id="messageText" autocomplete="off"/></label>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var client_id = Date.now()
            var token = document.getElementById("token")
            document.querySelector("#ws-id").textContent = client_id;
            var ws = new WebSocket(`ws://localhost:8000/ws/${client_id}?token=${token.value}`);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


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
        print(self.active_connections)
        for connection in self.active_connections.get(token):
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse(html)


async def get_token(websocket: WebSocket, token: str | None = Query(default=None)):
    if token:
        return token
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int, token: str = Depends(get_token)):
    await manager.connect(websocket, token)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}", token)
    except WebSocketDisconnect:
        manager.disconnect(websocket, token)
        await manager.broadcast(f"Client #{client_id} left the chat", token)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
