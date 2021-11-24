import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";

import { getUserNameFromID, joinChatHandler, updateChat, updateUser } from "./src/socketUtils";

const PORT = 8000;
const ALLOWED_ORIGINS = ["http://localhost:3000"];
const DB_URI = "mongodb://localhost:27017";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("Server: A user connected");

  await connect(`${DB_URI}/chatApp2`);

  socket.on("chat-id", joinChatHandler(socket, io));

  socket.on("update-user", updateUser(io));

  socket.on("update-chat", updateChat(io));

  socket.on("request-username", getUserNameFromID(socket));

  socket.on("disconnect", () => {
    console.log("Server: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
