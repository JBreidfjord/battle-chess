from typing import TypedDict


class ClientMessage(TypedDict):
    move: dict[str, str]
