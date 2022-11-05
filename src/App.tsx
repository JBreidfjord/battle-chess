import "./App.css";

import { useEffect, useState } from "react";

import Board from "./components/Board";
import useWebSocket from "react-use-websocket";

const clientId = parseInt(Date.now().toFixed(0));
// TODO: Handle token input
const token = "test-token";

function App() {
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
    }
  }, [lastJsonMessage]);

  return (
    <div className="App">
      <Board clientId={clientId} sendJsonMessage={sendJsonMessage as any} />
    </div>
  );
}

export default App;
