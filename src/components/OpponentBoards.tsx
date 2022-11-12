import Board from "./Board";
import { ClientState } from "../types";
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
  return (
    <div className="opponent-boards">
      {clientStates.map((state, i) => (
        <div className="board-with-toggle" key={i}>
          <Board
            boardWidth={200}
            clientId={stringToInt(state.id)}
            state={state}
            maxTurnTime={maxTurnTime}
          />
          {!hasStarted && (
            <div className={`ready-toggle ${state.ready ? "checked" : ""}`}>
              <label>
                {state.ready ? "Ready" : "Not Ready"}
                <input type="checkbox" disabled checked={state.ready} />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
