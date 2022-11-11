import asyncio

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
        self.started = False
        self.turn_time = 7.5  # Seconds

        self._loop = asyncio.get_event_loop()

        self.turn_count: dict[str, int] = {}
        self.piece_queue: dict[str, list[PieceType]] = {}
        self.move_timer_handles: dict[str, asyncio.TimerHandle] = {}
        self.active_games: dict[str, Board] = {}  # dict[client_id, game]
        self.ready_states: dict[str, bool] = {}  # dict[client_id, ready_state]
        for client_id in client_ids:
            self.create_game(client_id)

    def create_game(self, client_id: str):
        self.turn_count[client_id] = 3
        self.active_games[client_id] = Board()
        self.piece_queue[client_id] = []
        self.ready_states[client_id] = False

    async def start(self):
        # Skip if already started
        if self.started:
            return

        self.started = True
        # Start timers for each client
        for client_id in self.active_games.keys():
            await self.set_move_timer(client_id)

    def move(self, client_id: str, move: dict[str, str]):
        # Check for input validity
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return
        if not move.get("from") or not move.get("to"):
            print(f"Invalid move: {move} for client_id: {client_id}")
            return

        # TODO: Handle check for promotion
        moveObj = Move.from_uci(f"{move['from']}{move['to']}")

        possible_moves = self.active_games[client_id].legal_moves
        if moveObj not in possible_moves:
            print(f"WARN: Invalid move {moveObj} for client_id: {client_id}")
            return

        self.move_timer_handles[client_id].cancel()

        # Check if move is a capture and therefore removes a piece
        removed_piece = self.active_games[client_id].piece_at(parse_square(move["to"]))
        if removed_piece is not None:
            # Add piece to other player's queue
            if removed_piece.piece_type != PAWN and removed_piece.piece_type != KING:
                for other_id in self.piece_queue.keys():
                    if other_id == client_id:
                        continue  # Don't add to own queue
                    self.piece_queue[other_id].append(self.queue_pieces[removed_piece.piece_type])

        self.active_games[client_id].push(moveObj)

        # Check for checkmate
        if self.active_games[client_id].is_checkmate():
            for other_id in self.piece_queue.keys():
                if other_id == client_id:
                    continue  # Don't add to own queue
                self.piece_queue[other_id].append(QUEEN)

            self.active_games[client_id].reset_board()

    async def ai_move(self, client_id: str):
        if not self.active_games.get(client_id):
            print(f"No game found for client_id: {client_id}")
            return

        if self.active_games[client_id].turn == WHITE:
            print("WARN: AI tried moving on White turn")
            self.active_games[client_id].turn = BLACK
            # Clear move stack to prevent engine errors
            self.active_games[client_id].clear_stack()

        _, engine = await chess.engine.popen_uci("/opt/homebrew/bin/stockfish")

        # TODO: Better handling of engine errors
        try:
            result = await engine.play(
                self.active_games[client_id], chess.engine.Limit(time=0.05, depth=9)
            )
        except chess.engine.EngineTerminatedError:
            print("WARN: Engine terminated")
            return
        except chess.engine.EngineError as e:
            print(f"ERROR: Engine error: {e}")
            return

        await engine.quit()

        if result.move is None:
            print("WARN: AI returned None move")
            return

        self.active_games[client_id].push(result.move)

        if self.active_games[client_id].is_checkmate():
            # TODO: Handle player loss
            print(f"Checkmate against {client_id}")
            ...

        self.turn_count[client_id] -= 1

        if self.turn_count[client_id] == 0:
            self.spawn_piece(client_id)
            self.turn_count[client_id] = 3

        await self.set_move_timer(client_id)

    async def set_move_timer(self, client_id: str):
        self.move_timer_handles[client_id] = self._loop.call_later(
            self.turn_time, self._loop.create_task, self.ai_move(client_id)
        )

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

    def ready(self, client_id: str, ready: bool = True):
        self.ready_states[client_id] = ready

    def get_game_state(self):
        state = {
            "started": self.started,
            "clients": {
                id: {
                    # Extra attributes can be added here
                    "fen": game.fen(),
                    "ready": self.ready_states[id],
                    "moveTime": self.move_timer_handles[id].when() - self._loop.time(),
                }
                for id, game in self.active_games.items()
            },
        }

        return state
