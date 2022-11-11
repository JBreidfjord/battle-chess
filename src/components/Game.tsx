import { ClientState, StateUpdate } from "../types";

import Board from "./Board";
import { stringToInt } from "../utils";
import { useState } from "react";
import useWebSocket from "react-use-websocket";

interface GameProps {
  clientId: string;
  token: string;
}

const defaultClientState: ClientState = {
  id: "",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  ready: false,
  moveTime: 0.0,
  queue: [],
};

export default function Game({ clientId, token }: GameProps) {
  const [clientStates, setClientStates] = useState([
    { ...defaultClientState, id: clientId },
    defaultClientState,
    defaultClientState,
    defaultClientState,
  ]);
  const [hasStarted, setHasStarted] = useState(false);
  const [turnTime, setTurnTime] = useState(7.5);
  const socketUrl = `ws://${window.location.hostname}:8000/ws/${clientId}?token=${token}`;

  const onMessage = (event: MessageEvent) => {
    // TODO: Add types for messages
    const message = JSON.parse(event.data);
    // console.log("message", message);

    if (message["started"]) {
      setHasStarted(true);
    }

    if (message["turnTime"] && message["turnTime"] !== turnTime) {
      setTurnTime(message["turnTime"]);
    }

    const newStates = [];
    for (const [id, state] of Object.entries<StateUpdate>(message["clients"])) {
      const newState = { ...state, id };
      // Check for ID match so our client is at the start of the array
      id === clientId ? newStates.unshift(newState) : newStates.push(newState);
    }
    setClientStates(newStates);
  };

  const { sendMessage, sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log("opened"),
    onMessage: onMessage,
    // Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const onStartClick = () => {
    sendMessage("start");
  };

  const onReadyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendMessage(e.target.checked ? "ready" : "unready");
  };

  return (
    <div className="Game">
      <div className="board-container">
        {clientStates.map((client, index) => (
          <div className="board-with-toggle" key={client.id || index}>
            <Board
              key={client.id || index}
              clientId={stringToInt(client.id) || -1}
              sendJsonMessage={sendJsonMessage as any}
              isInteractive={hasStarted && client.id === clientId}
              state={client}
              maxTurnTime={turnTime}
            />
            {!hasStarted && (
              <div className={`ready-toggle ${client.ready ? "checked" : ""}`}>
                <label className={client.id === clientId ? "interactive" : ""}>
                  {client.ready ? "Ready" : "Not Ready"}
                  {client.id === clientId ? (
                    <input type="checkbox" checked={client.ready} onChange={onReadyToggle} />
                  ) : (
                    <input type="checkbox" disabled checked={client.ready} />
                  )}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      {!hasStarted && (
        <button
          onClick={onStartClick}
          disabled={clientStates.some((c) => !c.ready)}
          className="start-button"
        >
          Start
        </button>
      )}
    </div>
  );
}
