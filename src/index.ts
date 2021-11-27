import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";

import {
  joinChatHandler,
  requestUsernameHandler,
  updateChatHandler,
  updateUserHandler,
} from "./socketUtils";
import { ALLOWED_HEADERS, ALLOWED_ORIGINS, DB_URI, PORT } from "./constants";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    allowedHeaders: ALLOWED_HEADERS,
    credentials: true
  },
});

io.on("connection", async (socket) => {
  console.log("Server: A user connected");

  await connect(`${DB_URI}/chatApp2`);

  socket.on("join-chat", joinChatHandler(socket, io));

  socket.on("update-user", updateUserHandler(io));

  socket.on("update-chat", updateChatHandler(io));

  socket.on("request-username", requestUsernameHandler(socket));

  socket.on("disconnect", () => {
    console.log("Server: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
