import "./App.css";

import { useEffect, useState } from "react";

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
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={onClick}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
