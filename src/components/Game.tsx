import { useEffect, useState } from "react";

import Board from "./Board";
import { stringToInt } from "../utils";
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
  const socketUrl = `ws://localhost:8000/ws/${clientId}?token=${token}`;

  const handleMessage = (event: MessageEvent) => {
    // TODO: Add types for messages
    const message = JSON.parse(event.data);
    console.log("message", message);
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

  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl, {
      onOpen: () => console.log("opened"),
      onMessage: handleMessage,
      // Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
    });

  return (
    <div className="Game">
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
  );
}
