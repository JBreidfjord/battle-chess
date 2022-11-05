import { ClientMessage, Move } from "../types";
import { useEffect, useState } from "react";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface BoardProps {
  clientId: number;
  sendJsonMessage: (jsonMessage: ClientMessage) => void;
  isInteractive: boolean;
  serverFen?: string;
}

export default function Board({ clientId, sendJsonMessage, isInteractive, serverFen }: BoardProps) {
  const [game, setGame] = useState(new Chess(serverFen)); // TODO: Handle updates to game state

  const makeMove = (move: Move) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      sendJsonMessage({ move });
    }
    return result; // null if illegal move, otherwise the move object
  };

  const onDrop = (src: string, dest: string) => {
    const move = makeMove({
      from: src,
      to: dest,
      // promotion: "q", // always promote to a queen for simplicity
    });

    // illegal move
    if (move === null) return false;

    return true;
  };

  useEffect(() => {
    setGame(new Chess(serverFen));
  }, [serverFen]);

  return (
    <div className="Board">
      <Chessboard
        id={clientId}
        position={game.fen()}
        arePiecesDraggable={isInteractive}
        onPieceDrop={onDrop}
      />
    </div>
  );
}
