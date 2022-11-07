import chess.engine
from chess import (
    BISHOP,
    BLACK,
    KING,
    KNIGHT,
    PAWN,
    QUEEN,
    ROOK,
    WHITE,
    Board,
    Move,
    Piece,
    PieceType,
    parse_square,
)


class GameManager:
    queue_pieces: dict[PieceType, PieceType] = {
        QUEEN: ROOK,
        ROOK: BISHOP,
        BISHOP: KNIGHT,
        KNIGHT: PAWN,
    }

    def __init__(self, client_ids: list[str]):
        self.turn_count: dict[str, int] = {}
        self.piece_queue: dict[str, list[PieceType]] = {}
        self.active_games: dict[str, Board] = {}  # dict[client_id, game]
        for client_id in client_ids:
            self.create_game(client_id)

    def create_game(self, client_id: int):
        self.turn_count[client_id] = 3
        self.active_games[client_id] = Board()
        self.piece_queue[client_id] = []

    def move(self, client_id: str, move: dict[str, str]):
        # Check for input validity
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return
        if not move.get("from") or not move.get("to"):
            print(f"Invalid move: {move}")
            return

        # TODO: Handle check for promotion
        moveObj = Move.from_uci(f"{move['from']}{move['to']}")
        possible_moves = self.active_games[client_id].legal_moves

        if moveObj != Move.null() and moveObj not in possible_moves:
            return

        if self.active_games[client_id].is_capture(moveObj):
            removed_piece = self.active_games[client_id].piece_at(parse_square(move["to"]))
            if removed_piece.piece_type != PAWN and removed_piece.piece_type != KING:
                for id in self.piece_queue.keys():
                    if id == client_id:
                        continue  # Don't add to own queue
                    self.piece_queue[client_id].append(self.queue_pieces[removed_piece.piece_type])

        self.active_games[client_id].push(moveObj)

        # Check for checkmate
        if self.active_games[client_id].is_checkmate():
            for id in self.piece_queue.keys():
                if id == client_id:
                    continue  # Don't add to own queue
                self.piece_queue[client_id].append(QUEEN)

            self.active_games[client_id].reset_board()

    async def ai_move(self, client_id: str):
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return

        if self.active_games[client_id].turn == WHITE:
            print("WARN: AI tried moving on White turn")
            self.active_games[client_id].turn = BLACK

        _, engine = await chess.engine.popen_uci("/opt/homebrew/bin/stockfish")

        result = await engine.play(
            self.active_games[client_id], chess.engine.Limit(time=0.05, depth=9)
        )

        await engine.quit()

        if result.move is None:
            print("WARN: AI returned None move")

        self.active_games[client_id].push(result.move)

        if self.active_games[client_id].is_checkmate():
            # TODO: Handle player loss
            ...

        self.turn_count[client_id] -= 1

        if self.turn_count[client_id] == 0:
            self.spawn_piece(client_id)
            self.turn_count[client_id] = 3

    def spawn_piece(self, client_id: str):
        if not self.piece_queue.get(client_id):
            return

        # Search for first empty square to spawn piece
        for i in range(63, -1, -1):
            if not self.active_games[client_id].piece_at(i):
                self.active_games[client_id].set_piece_at(
                    i, Piece(self.piece_queue[client_id].pop(), BLACK)
                )
                break

    def get_game_state(self):
        return {id: game.fen() for id, game in self.active_games.items()}
