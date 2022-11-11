import "./Board.css";

import { Chess, Square } from "chess.js";
import { Chessboard, CustomPieces } from "react-chessboard";
import { ClientMessage, ClientState, Move } from "../types";
import { useEffect, useState } from "react";

import MoveTimer from "./MoveTimer";
import PieceQueue from "./PieceQueue";
import PieceQueueCountdown from "./PieceQueueCountdown";
import bB from "../assets/pieces/black_bishop.png";
import bK from "../assets/pieces/black_king.png";
import bN from "../assets/pieces/black_knight.png";
import bP from "../assets/pieces/black_pawn.png";
import bQ from "../assets/pieces/black_queen.png";
import bR from "../assets/pieces/black_rook.png";
import wB from "../assets/pieces/white_bishop.png";
import wK from "../assets/pieces/white_king.png";
import wN from "../assets/pieces/white_knight.png";
import wP from "../assets/pieces/white_pawn.png";
import wQ from "../assets/pieces/white_queen.png";
import wR from "../assets/pieces/white_rook.png";

const pieces = [
  ["wN", wN],
  ["wB", wB],
  ["wR", wR],
  ["wQ", wQ],
  ["wK", wK],
  ["wP", wP],
  ["bN", bN],
  ["bB", bB],
  ["bR", bR],
  ["bQ", bQ],
  ["bK", bK],
  ["bP", bP],
];

interface BoardProps {
  clientId: number;
  sendJsonMessage: (jsonMessage: ClientMessage) => void;
  isInteractive: boolean;
  state: ClientState;
  maxTurnTime: number;
}

export default function Board({
  clientId,
  sendJsonMessage,
  isInteractive,
  state,
  maxTurnTime,
}: BoardProps) {
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

  const onDrop = (src: string, dest: string) => {
    // Promote if piece is a pawn and is on the last rank
    const isPromotion = game.get(src as Square)?.type === "p" && dest[1] === "8";

    const move = makeMove({
      from: src,
      to: dest,
      promotion: isPromotion ? "q" : undefined, // always promote to a queen for simplicity
    });

    // illegal move
    if (move === null) return false;

    return true;
  };

  useEffect(() => {
    setGame(new Chess(state.fen));
  }, [state.fen]);

  const customPieces = () => {
    const pieceImages: CustomPieces = {};
    pieces.forEach((piece) => {
      const [name, image] = piece;
      (pieceImages as any)[name] = ({ squareWidth }: { squareWidth: number }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(${image})`,
            backgroundSize: "90%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      );
    });
    return pieceImages;
  };

  return (
    <div className="Board">
      <PieceQueue queue={state.queue} />
      <PieceQueueCountdown />
      <MoveTimer time={state.moveTime} maxTime={maxTurnTime} />
      <div className="Board__chessboard">
        <Chessboard
          id={clientId}
          position={game.fen()}
          arePiecesDraggable={isInteractive}
          onPieceDrop={onDrop}
          showBoardNotation={false}
          customDarkSquareStyle={{ backgroundColor: "#464D5E" }}
          customLightSquareStyle={{ backgroundColor: "#E6EAD7" }}
          customPieces={customPieces()}
        />
      </div>
    </div>
  );
}
