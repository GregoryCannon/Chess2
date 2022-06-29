import React from "react";
import "./App.css";
import GameManager from "./GameManager";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Welcome to Chess2!</h1>
        <p>
          Game design by Oats Jenkins. <br />
          Site developed by Greg Cannon
        </p>
      </header>

      <GameManager />
    </div>
  );
}

export default App;
