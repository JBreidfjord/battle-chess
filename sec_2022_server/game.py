from chess import Board, Move, PieceType, PAWN, BISHOP, ROOK, KNIGHT, QUEEN, KING


class GameManager:
    queue_piece: dict[PieceType, PieceType] = {
        KING: QUEEN,
        QUEEN: ROOK,
        ROOK: BISHOP,
        BISHOP: KNIGHT,
        KNIGHT: PAWN
    }
    
    def __init__(self, client_ids: list[str]):
        self.active_games: dict[str, Board] = {}  # dict[client_id, game]
        for client_id in client_ids:
            self.create_game(client_id)
        self.piece_queue: dict[str, list[PieceType]] = {}

        

    def create_game(self, client_id: int):
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
        if self.active_games[client_id].is_capture(moveObj):
            removed_piece = self.active_games[client_id].piece_at(move["to"])
            if removed_piece.piece_type != PAWN:
                for id in self.piece_queue.keys():
                    if id == client_id:
                        continue  # dont put in queue

                    self.piece_queue[client_id].append(self.queue_piece[removed_piece.piece_type])
            if removed_piece.piece_type == KING:
                # TODO: add reset board
                ...

        # print(self.piece_queue.values())
        self.active_games[client_id].push(moveObj)

    def AImove(self, client_id: str, move: dict[str, str]):
        ...
   

    def get_game_state(self):
        return {id: game.fen() for id, game in self.active_games.items()}
