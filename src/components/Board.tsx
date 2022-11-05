import { ClientMessage, Move } from "../types";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState } from "react";

interface BoardProps {
  clientId: number;
  sendJsonMessage: (jsonMessage: ClientMessage) => void;
}

export default function Board({ clientId, sendJsonMessage }: BoardProps) {
  const [game, setGame] = useState(new Chess()); // TODO: Handle updates to game state

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

  // TODO: Handle fen from server
  return <Chessboard id={clientId} position={game.fen()} onPieceDrop={onDrop} />;
}
