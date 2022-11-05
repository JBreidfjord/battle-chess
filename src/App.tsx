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
          <p>This is battle chess. Rules:</p>
          <ul>
            <li>Normal chess rules apply</li>
            <li>Each player has a limited amount of time to make each move</li>
            <li>
              When a piece is captured, AI pieces will be sent to every player you're up against
            </li>
            <li>The pieces sent to enemy players depends on what was captured</li>
            <li>
              The piece sent will have a rank one less than the piece captured, for example a queen
              captured sends a rook
            </li>
            <li>
              If someone beats their opposing AI a queen will be sent to the enemy players and their
              board will be reset
            </li>
            <li>Last person standing wins</li>
          </ul>
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
