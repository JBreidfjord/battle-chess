from typing import Union

from fastapi import Query, WebSocket, status


async def get_token(websocket: WebSocket, token: Union[str, None] = Query(default=None)):
    if token:
        return token
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
