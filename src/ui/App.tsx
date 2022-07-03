import React from "react";
import "./App.css";
import { WrappedGameManager } from "./GameManager";
import { Lobby } from "./Lobby";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Welcome to Chess2!</h1>
        <p>
          Game design by Oats Jenkins. <br />
          Site developed by Greg Cannon
        </p>
        <BrowserRouter>
          <Routes>
            <Route
              path="/play/lobby/:lobbyId"
              element={<WrappedGameManager online={true} />}
            ></Route>
            <Route
              path="/play/local"
              element={<WrappedGameManager online={false} />}
            ></Route>
            <Route path="/" element={<Lobby />}></Route>
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
