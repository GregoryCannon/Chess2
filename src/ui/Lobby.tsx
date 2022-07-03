import React, { useState } from "react";
import { IS_PRODUCTION } from "../data/config";
import "./Lobby.css";
const { io } = require("socket.io-client");

const socket = io(
  IS_PRODUCTION ? "https://chesstwo.herokuapp.com" : "http://localhost:4000"
);

socket.on("connect", () => {
  console.log("Lobby - Connected to server!", socket.id);
  socket.emit("send-message", "My ID is " + socket.id, "");
});

export function Lobby(props: {}) {
  const [lobbies, setLobbies] = useState({});

  socket.on("lobby-list", (newLobbies: any) => {
    setLobbies(newLobbies);
  });

  socket.on("create-success", (lobbyId) => {
    window.location.replace(`/play/lobby/${lobbyId}`);
  });

  function createLobby() {
    const name = prompt("Enter a name for  your lobby:");
    if (name) {
      socket.emit("create-lobby", name);
    }
  }

  return (
    <div className="Lobby-Container">
      <h3>Choose a lobby to play in:</h3>
      <div>
        {Array.from(Object.values(lobbies)).map((lobbyData: any) => (
          <div className="Lobby-Row" key={lobbyData.id}>
            <span>
              {lobbyData.name}:{" "}
              {(lobbyData.whitePlayerId ? 1 : 0) +
                (lobbyData.blackPlayerId ? 1 : 0)}
              /2 players
            </span>
            <a href={`/play/lobby/${lobbyData.id}`}>Join</a>
          </div>
        ))}
        <button onClick={createLobby}>Create Lobby</button>
        <a href={`play/local`}>Play locally</a>
      </div>
    </div>
  );
}
