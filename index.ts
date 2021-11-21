import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

import { DB_URI } from "./src/mongoDBUtils";
import { joinChatHandler, updateUser } from "./src/socketUtils";

const client = new MongoClient(DB_URI);

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

io.on("connection", async (socket) => {
  console.log("Server: A user connected");
  await client.connect();

  socket.on("chat-id", joinChatHandler(client, socket, io));

  socket.on("update-user", updateUser(client, io));

  socket.on("disconnect", () => {
    console.log("Server: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
