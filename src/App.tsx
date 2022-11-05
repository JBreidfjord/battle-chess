import "./App.css";

import Game from "./components/Game";
import { useState } from "react";

function App() {
  const [token, setToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [showGame, setShowGame] = useState(false);

  const joinGame = () => {
    if (clientId && token) {
      setShowGame(true);
    }
  };

  // TODO: Add rules page

  return (
    <div className="App">
      {showGame ? (
        <Game clientId={clientId} token={token} />
      ) : (
        <>
          <h1>Battle Chess</h1>
          <div className="room-form">
            <label>
              Room Code: <input value={token} onChange={(e) => setToken(e.target.value)} />
            </label>
            <label>
              User ID: <input value={clientId} onChange={(e) => setClientId(e.target.value)} />
            </label>
            <button onClick={joinGame}>Join Game</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
