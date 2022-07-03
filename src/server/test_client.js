import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to server!");
  socket.emit(
    "send-message",
    "My number is " + Math.round(Math.random() * 100),
    ""
  );
});

socket.on("receive-message", (msg) => {
  console.log("Got message:", msg);
});
