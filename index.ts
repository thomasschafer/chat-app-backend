import express from "express";
import * as http from "http";
import { Server } from "socket.io";

const PORT = 8000;
const ALLOWED_ORIGINS = ["http://localhost:3000"];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Server: A user connected");

  socket.on("chat-id", (chatId) => {
    socket.join(chatId);
  });

  socket.on("new-message", (msg: { sender: string; body: string; chatId: string }) => {
    console.log("New message from client: " + msg);

    io.sockets.in(msg.chatId).emit("message received", msg);
  });

  socket.on("disconnect", () => {
    console.log("Server: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
