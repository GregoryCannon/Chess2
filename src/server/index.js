const http = require("http");
const cors = require("cors");
const express = require("express");
const path = require("path");
const app = express();
const server = http.createServer(app);

const MAIN_PORT = process.env.PORT || 4000;

/**
 * SERVE THE UI
 */
app.use(express.static(path.join(__dirname, "/../../build")));

app.get("*", (req, res) => {
  console.log("Serving", path.join(__dirname + "/../../build/index.html"));
  res.sendFile(path.join(__dirname + "/../../build/index.html"));
});

server.listen(MAIN_PORT, (error) => {
  if (error) console.log(error);
  console.log(`Server started on port ${MAIN_PORT}`);
});

/**
 * HANDLE SOCKET BACKEND
 */
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const lobbies = {
  47292: {
    name: "Greg's Lobby",
    whitePlayerId: "",
    blackPlayerId: "",
    id: 47292,
    hasHeartbeat: new Set(),
  },
  47294: {
    name: "Dan's Lobby",
    whitePlayerId: "",
    blackPlayerId: "",
    id: 47294,
    hasHeartbeat: new Set(),
  },
};

io.on("connection", (socket) => {
  console.log("User joined, with id", socket.id);
  socket.emit("lobby-list", lobbies);

  socket.on("send-message", (msg, lobbyId) => {
    console.log("Got message:", msg, "for room:", lobbyId);

    if (!lobbyId) {
      socket.broadcast.emit("receive-message", msg);
    } else {
      io.to(lobbyId).emit("lobby-message", socket.id + ": " + msg);
    }
  });

  socket.on("send-move", (move, lobbyId) => {
    console.log("Got move:", move, "for room:", lobbyId);
    if (lobbyId) {
      io.to(lobbyId).emit("lobby-move", move, socket.id);
    }
  });

  socket.on("create-lobby", (lobbyName) => {
    console.log("Got create lobby request");
    let lobbyId = Math.round(Math.random() * 1000000);
    // Re-roll if needed
    while (lobbies.hasOwnProperty(lobbyId)) {
      lobbyId = Math.round(Math.random() * 1000000);
    }

    // Create the new lobby data
    const newLobby = {
      name: lobbyName,
      id: lobbyId,
      hasHeartbeat: new Set(),
    };
    lobbies[lobbyId] = newLobby;

    // Emit the updated list
    io.emit("lobby-list", lobbies);
    socket.emit("create-success", lobbyId);
  });

  socket.on("join-lobby", (lobbyId) => {
    console.log("ATTEMPTED JOIN", lobbyId);
    socket.join(lobbyId);
    let playerColor;
    // Update the lobby list
    if (lobbies.hasOwnProperty(lobbyId)) {
      const lobby = lobbies[lobbyId];
      playerColor = "spectator";
      if (!lobby.whitePlayerId && !lobby.blackPlayerId) {
        playerColor = Math.random() > 0.5 ? "white" : "black";
      } else if (!lobby.whitePlayerId) {
        playerColor = "white";
      } else if (!lobby.blackPlayerId) {
        playerColor = "black";
      }

      if (playerColor === "white") {
        lobby.whitePlayerId = socket.id;
      } else if (playerColor === "black") {
        lobby.blackPlayerId = socket.id;
      }
    }
    // Emit the updated list
    io.emit("lobby-list", lobbies);
    socket.emit("join-success", playerColor);
  });

  socket.on("heartbeat", (lobbyId) => {
    if (lobbies[lobbyId]) {
      if (!lobbies[lobbyId].hasHeartbeat) {
        lobbies[lobbyId].hasHeartbeat = new Set();
      }
      lobbies[lobbyId].hasHeartbeat.add(socket.id);
    }
  });
});

function cleanupEmptyLobbies() {
  for (const [key, value] of Object.entries(lobbies)) {
    console.log("key", key, "value", value);
    if (value.hasHeartbeat.size === 0) {
      delete lobbies[key];
    }
  }
  io.emit("lobby-list", lobbies);
  setTimeout(cleanupEmptyLobbies, 30000);
}

cleanupEmptyLobbies();
