import "./Board.css";

import { Chessboard, Pieces, Square } from "react-chessboard";

import { ClientState } from "../types";
import MoveTimer from "./MoveTimer";
import PieceQueue from "./PieceQueue";
import PieceQueueCountdown from "./PieceQueueCountdown";
import { customPieces } from "../utils";

interface BoardProps {
  clientId: number;
  boardWidth: number;
  onDrop?: (src: Square, dest: Square, piece: Pieces) => boolean;
  isInteractive?: boolean;
  state: ClientState;
  maxTurnTime: number;
}

export default function Board({
  clientId,
  boardWidth,
  onDrop,
  isInteractive,
  state,
  maxTurnTime,
}: BoardProps) {
  return (
    <div className="Board">
      <PieceQueue queue={state.queue} />
      <PieceQueueCountdown count={state.queueCountdown} />
      <MoveTimer time={state.moveTime} maxTime={maxTurnTime} />
      <div className="Board__chessboard">
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
