import "./Board.css";

import { Chessboard, Pieces, Square } from "react-chessboard";
import { useLayoutEffect, useRef, useState } from "react";

import { ClientState } from "../types";
import MoveTimer from "./MoveTimer";
import PieceQueue from "./PieceQueue";
import PieceQueueCountdown from "./PieceQueueCountdown";
import { customPieces } from "../utils";

interface BoardProps {
  clientId: number;
  onDrop?: (src: Square, dest: Square, piece: Pieces) => boolean;
  isInteractive?: boolean;
  state: ClientState;
  maxTurnTime: number;
  tightLayout?: boolean;
  numBoards?: number;
}

export default function Board({
  clientId,
  onDrop,
  isInteractive,
  state,
  maxTurnTime,
  tightLayout,
  numBoards,
}: BoardProps) {
  const [boardWidth, setBoardWidth] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.clientWidth);
    }
  }, [boardRef.current?.clientWidth]);

  return (
    <div className="Board">
      <PieceQueue queue={state.queue} size={boardWidth / 8} />
      <PieceQueueCountdown count={state.queueCountdown} tightLayout={tightLayout} />
      <MoveTimer time={state.moveTime} maxTime={maxTurnTime} />
      <div className="Board__chessboard" ref={boardRef}>
        <Chessboard
          id={clientId}
          position={state.fen}
          arePiecesDraggable={!!isInteractive}
          onPieceDrop={onDrop}
          showBoardNotation={false}
          customDarkSquareStyle={{ backgroundColor: "#464D5E" }}
          customLightSquareStyle={{ backgroundColor: "#E6EAD7" }}
          customPieces={customPieces()}
          boardWidth={boardWidth}
        />
      </div>
    </div>
  );
}
