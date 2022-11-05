from chess import QUEEN, Board, Move


class GameManager:
    def __init__(self, client_ids: list[int]):
        self.active_games: dict[int, Board] = {}  # dict[client_id, game]
        for client_id in client_ids:
            self.create_game(client_id)

    def create_game(self, client_id: int):
        self.active_games[client_id] = Board()

    def move(self, client_id: int, move: dict[str, str]):
        # Check for input validity
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return
        if not move.get("from") or not move.get("to"):
            print(f"Invalid move: {move}")
            return

        # Update game
        # Always promotes to queen for simplicity
        self.active_games[client_id].push(Move.from_uci(f"{move['from']}{move['to']}q"))

    def get_game_state(self):
        return {id: game.fen() for id, game in self.active_games.items()}
