import { ClientMessage, ClientState, Move } from "../types";
import { Pieces, Square } from "react-chessboard";
import { useEffect, useState } from "react";

import Board from "./Board";
import { Chess } from "chess.js";

interface PlayerBoardProps {
  clientId: number;
  sendJsonMessage: (jsonMessage: ClientMessage) => void;
  sendMessage: (message: string) => void;
  hasStarted: boolean;
  state: ClientState;
  maxTurnTime: number;
}

export default function PlayerBoard({
  clientId,
  sendJsonMessage,
  sendMessage,
  hasStarted,
  state,
  maxTurnTime,
}: PlayerBoardProps) {
  const [game, setGame] = useState(new Chess(state.fen));

  const makeMove = (move: Move) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      sendJsonMessage({ move });
    }
    return result; // null if illegal move, otherwise the move object
  };

  const onDrop = (src: Square, dest: Square, piece: Pieces) => {
    // Promote if piece is a pawn and is on the last rank
    const isPromotion = piece[1] === "P" && dest[1] === "8";

    const move = makeMove({
      from: src,
      to: dest,
      promotion: isPromotion ? "q" : undefined, // always promote to a queen for simplicity
    });

    // illegal move
    if (move === null) return false;

    return true;
  };

  const onReadyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendMessage(e.target.checked ? "ready" : "unready");
  };

  useEffect(() => {
    setGame(new Chess(state.fen));
  }, [state.fen]);

  return (
    <div className="board-with-toggle">
      <Board
        boardWidth={window.innerWidth / 3}
        clientId={clientId}
        onDrop={onDrop}
        isInteractive={hasStarted}
        state={state}
        maxTurnTime={maxTurnTime}
      />
      {!hasStarted && (
        <div className={`ready-toggle ${state.ready ? "checked" : ""}`}>
          <label className="interactive">
            {state.ready ? "Ready" : "Not Ready"}
            <input type="checkbox" checked={state.ready} onChange={onReadyToggle} />
          </label>
        </div>
      )}
    </div>
  );
}
