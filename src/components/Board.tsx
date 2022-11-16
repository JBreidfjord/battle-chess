import "./Board.css";

import { Chessboard, Pieces, Square } from "react-chessboard";
import { useLayoutEffect, useRef, useState } from "react";

import { ClientState } from "../types";
import MoveTimer from "./MoveTimer";
import PieceQueue from "./PieceQueue";
import PieceQueueCountdown from "./PieceQueueCountdown";
import ReadyToggle from "./ReadyToggle";
import { customPieces } from "../utils";

interface BoardProps {
  clientId: number;
  onDrop?: (src: Square, dest: Square, piece: Pieces) => boolean;
  sendMessage?: (message: string) => void;
  isInteractive?: boolean;
  hasStarted: boolean;
  state: ClientState;
  maxTurnTime: number;
  tightLayout?: boolean;
}

export default function Board({
  clientId,
  onDrop,
  sendMessage,
  isInteractive,
  hasStarted,
  state,
  maxTurnTime,
  tightLayout,
}: BoardProps) {
  const [boardWidth, setBoardWidth] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.clientWidth);
    }
  }, [boardRef.current?.clientWidth]);

  return (
    <div className="board-with-footer">
      <div className="Board">
        <PieceQueue queue={state.queue} size={boardWidth / 8} />
        <PieceQueueCountdown count={state.queueCountdown} tightLayout={tightLayout} />
        <MoveTimer time={state.moveTime} maxTime={maxTurnTime} />
        <div className="Board__chessboard" ref={boardRef}>
          <Chessboard
            id={clientId}
            position={state.fen}
            arePiecesDraggable={!!isInteractive && hasStarted}
            onPieceDrop={onDrop}
            showBoardNotation={false}
            customDarkSquareStyle={{ backgroundColor: "#464D5E" }}
            customLightSquareStyle={{ backgroundColor: "#E6EAD7" }}
            customPieces={customPieces()}
            boardWidth={boardWidth}
          />
        </div>
        <div className="client-name">{state.id}</div>
      </div>
      <div className="board-footer">
        <ReadyToggle
          hasStarted={hasStarted}
          ready={state.ready}
          sendMessage={sendMessage}
          isInteractive={!!isInteractive}
        />
      </div>
    </div>
  );
}
