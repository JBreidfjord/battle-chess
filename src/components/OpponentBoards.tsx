import Board from "./Board";
import { ClientState } from "../types";
import ReadyToggle from "./ReadyToggle";
import { stringToInt } from "../utils";

interface OpponentBoardsProps {
  clientStates: ClientState[];
  hasStarted: boolean;
  maxTurnTime: number;
}

export default function OpponentBoards({
  clientStates,
  hasStarted,
  maxTurnTime,
}: OpponentBoardsProps) {
  if (clientStates.length === 0) {
    return null;
  }

  return (
    <div className="opponent-boards">
      {clientStates.map((state, i) => (
        <Board
          key={i}
          clientId={stringToInt(state.id)}
          hasStarted={hasStarted}
          state={state}
          maxTurnTime={maxTurnTime}
          tightLayout
        />
      ))}
    </div>
  );
}
