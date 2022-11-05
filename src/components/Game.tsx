import { useEffect, useState } from "react";

import Board from "./Board";
import { stringToInt } from "../utils";
import useWebSocket from "react-use-websocket";

interface GameProps {
  clientId: string;
  token: string;
}

export default function Game({ clientId, token }: GameProps) {
  const [clientIds, setClientIds] = useState<string[]>([clientId, "", "", ""]);
  const socketUrl = `ws://localhost:8000/ws/${clientId}?token=${token}`;

  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl, {
      onOpen: () => console.log("opened"),
      // Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
    });

  useEffect(() => {
    if (lastJsonMessage) {
      console.log("lastJsonMessage", lastJsonMessage);
      // Update clientIds from server
      const newClientIds = [clientId];
      for (const id of Object.keys(lastJsonMessage)) {
        if (id == clientId) continue; // Don't update our own id, we know it
        newClientIds.push(id);
      }
      setClientIds(newClientIds);
    }
  }, [lastJsonMessage]);

  return (
    <div className="Game">
      {clientIds.map((id, index) => (
        <Board
          key={id || index}
          clientId={stringToInt(id) || -1}
          sendJsonMessage={sendJsonMessage as any}
          isInteractive={id === clientId}
          serverFen={lastJsonMessage ? (lastJsonMessage as any)[id] : undefined}
        />
      ))}
    </div>
  );
}
