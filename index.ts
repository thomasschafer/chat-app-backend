import express from "express";
import * as http from "http";
import { Server } from "socket.io";

import { MongoClient } from "mongodb";
import { DB_URI, getMessageThread, updateMessageThread } from "./src/mongoDBUtils";

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

const newMessageHandler = async (msg: { senderId: string; body: string; chatId: string }) => {
  console.log("New message from client: " + msg);
  await client.connect();

  const chatRoomsCollection = client.db("chatApp").collection("chatRooms");

  await updateMessageThread(chatRoomsCollection, msg.chatId, msg);

  const msgThread = await getMessageThread(chatRoomsCollection, msg.chatId);

  console.log("Updated:", msgThread);

  io.sockets.in(msg.chatId).emit("message-received", msg);
};

io.on("connection", async (socket) => {
  console.log("Server: A user connected");

  socket.on("chat-id", (chatId) => {
    socket.join(chatId);
    io.sockets.in(chatId).emit("message-thread", "test");

    socket.on("new-message", newMessageHandler);
  });

  socket.on("disconnect", () => {
    console.log("Server: A user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
