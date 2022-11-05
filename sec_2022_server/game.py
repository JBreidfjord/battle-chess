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
    engine,
    parse_square,
)
from chess.engine import SimpleEngine


class GameManager:

    queue_pieces: dict[PieceType, PieceType] = {
        KING: QUEEN,
        QUEEN: ROOK,
        ROOK: BISHOP,
        BISHOP: KNIGHT,
        KNIGHT: PAWN,
    }

    def __init__(self, client_ids: list[str]):
        self.turn_count: dict[str, int] = {}
        self.piece_queue: dict[str, list[PieceType]] = {}
        self.active_games: dict[str, Board] = {}  # dict[client_id, game]
        self.engines: dict[str, SimpleEngine] = {}
        for client_id in client_ids:
            self.create_game(client_id)

    def create_game(self, client_id: int):
        self.turn_count[client_id] = 3
        self.active_games[client_id] = Board()
        self.piece_queue[client_id] = []
        self.engines[client_id] = engine.SimpleEngine.popen_uci("/opt/homebrew/bin/stockfish")

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

        if moveObj not in possible_moves:
            return

        if self.active_games[client_id].is_capture(moveObj):
            removed_piece = self.active_games[client_id].piece_at(parse_square(move["to"]))
            if removed_piece.piece_type != PAWN:
                for id in self.piece_queue.keys():
                    if id == client_id:
                        continue  # dont put in queue

                    self.piece_queue[client_id].append(self.queue_pieces[removed_piece.piece_type])
            if removed_piece.piece_type == KING:
                # TODO: handle reset board
                ...

        print(self.piece_queue.values())
        self.active_games[client_id].push(moveObj)

    def ai_move(self, client_id: str):
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return

        if self.active_games[client_id].turn == WHITE:
            self.active_games[client_id].turn = BLACK

        result = self.engines[client_id].play(self.active_games[client_id], engine.Limit(time=0.1))
        self.active_games[client_id].push(result.move)
        self.turn_count[client_id] -= 1

        if self.turn_count[client_id] == 0:
            self.spawn_piece(client_id)
            self.turn_count[client_id] = 3

        print("ai move", result.move)

    def spawn_piece(self, client_id: str):
        if not self.piece_queue.get(client_id):
            return

        board_dict = self.active_games[client_id].piece_map()
        for i in range(63, -1, -1):
            if board_dict.get(i) is None:
                self.active_games[client_id].set_piece_at(
                    i, Piece(self.piece_queue[client_id].pop(), BLACK)
                )
                break

    def get_game_state(self):
        return {id: game.fen() for id, game in self.active_games.items()}
