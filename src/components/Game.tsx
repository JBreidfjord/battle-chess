import Board from "./Board";
import { stringToInt } from "../utils";
import { useState } from "react";
import useWebSocket from "react-use-websocket";

interface GameProps {
  clientId: string;
  token: string;
}

const defaultClient = {
  id: "",
  fen: "",
};

export default function Game({ clientId, token }: GameProps) {
  const [clients, setClients] = useState([
    { id: clientId, fen: "" },
    defaultClient,
    defaultClient,
    defaultClient,
  ]);
  const [hasStarted, setHasStarted] = useState(false);
  const socketUrl = `ws://${window.location.hostname}:8000/ws/${clientId}?token=${token}`;

  const onMessage = (event: MessageEvent) => {
    // TODO: Add types for messages
    const message = JSON.parse(event.data);
    console.log("message", message);

    if (message["started"]) {
      setHasStarted(true);
    }

    const newClients = [];
    for (const [id, client] of Object.entries(message["clients"])) {
      // Check for ID match so our client is at the start of the array
      if (id === clientId) {
        // Insert at start of array
        newClients.unshift({ id, fen: (client as any)["fen"] });
      } else {
        // Insert at end of array
        newClients.push({ id, fen: (client as any)["fen"] });
      }
    }
    setClients(newClients);
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

  return (
    <div className="Game">
      <div className="board-container">
        {clients.map((client, index) => (
          <Board
            key={client.id || index}
            clientId={stringToInt(client.id) || -1}
            sendJsonMessage={sendJsonMessage as any}
            isInteractive={hasStarted && client.id === clientId}
            serverFen={client.fen || undefined}
          />
        ))}
      </div>
      {!hasStarted && <button onClick={onStartClick}>Start</button>}
    </div>
  );
}
