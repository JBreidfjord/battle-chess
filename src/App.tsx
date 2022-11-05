import "./App.css";

import { useEffect, useState } from "react";

import Board from "./components/Board";
import reactLogo from "./assets/react.svg";
import useWebSocket from "react-use-websocket";

const clientId = Date.now().toString(36);
const token = "test-token";

function App() {
  const socketUrl = `ws://localhost:8000/ws/${clientId}?token=${token}`;
  const [count, setCount] = useState(0);

  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(socketUrl, {
      onOpen: () => console.log("opened"),
      // Will attempt to reconnect on all close events, such as server shutting down
      shouldReconnect: (closeEvent) => true,
    });

  useEffect(() => {
    if (lastJsonMessage) {
      console.log("lastJsonMessage", lastJsonMessage);
      if ((lastJsonMessage as any).count) {
        setCount((lastJsonMessage as any).count);
      }
    }
  }, [lastJsonMessage]);

  const onClick = () => {
    console.log("sendMessage", count);
    setCount((count) => count + 1);
    sendJsonMessage({ count: count + 1 });
  };

  return (
    <div className="App">
      <Board sendJsonMessage={sendJsonMessage as any} />
    </div>
  );
}

export default App;
