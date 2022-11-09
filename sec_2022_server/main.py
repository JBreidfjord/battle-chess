import uvicorn
from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

from sec_2022_server.connection_manager import ConnectionManager
from sec_2022_server.dependencies import get_token
from sec_2022_server.type_defs import ClientMessage

app = FastAPI()
manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse("<h1>TODO: Serve Client!</h1>")


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: str = Depends(get_token)):
    await manager.connect(websocket, token, client_id)
    try:
        # TODO: Handle ready and start messages before initializing game
        manager.initialize_game(token)

        await manager.broadcast_game_state(token)

        # Lobby / Pre-game loop
        while not manager.game_managers[token].started:
            message = await websocket.receive_text()

            if message in ["ready", "unready"]:
                manager.game_managers[token].ready(client_id, ready=message == "ready")
                await manager.broadcast_game_state(token)
                continue

            if message == "start":
                await manager.game_managers[token].start()
                await manager.broadcast_game_state(token)
                break

            print(f"WARN: Unknown message '{message}' in lobby for client_id '{client_id}'")

        # Game loop
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
    uvicorn.run("main:app", host="0.0.0.0", reload=True)
