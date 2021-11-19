import { MongoClient } from "mongodb";
import { Socket, Server } from "socket.io";

import { getMessageThread, updateMessageThread } from "./mongoDBUtils";

const newMessageHandler =
  (client: MongoClient, chatId: string, io: Server) =>
  async (msg: { senderId: string; body: string }) => {
    console.log("New message from client: " + msg);
    const chatRoomsCollection = client.db("chatApp").collection("chatRooms");
    await updateMessageThread(chatRoomsCollection, chatId, msg);
    io.sockets.in(chatId).emit("message-received", msg);

    const msgThread = await getMessageThread(chatRoomsCollection, chatId);
    console.log("Successfully updated message thread:", chatId, "now:", msgThread);
  };

export const joinChatHandler =
  (client: MongoClient, socket: Socket, io: Server) => async (chatId: string) => {
    // TODO: FIX ANY TYPE
    socket.join(chatId);

    const chatRoomsCollection = client.db("chatApp").collection("chatRooms");

    const msgThread = await getMessageThread(chatRoomsCollection, chatId);
    io.sockets.in(chatId).emit("message-thread", msgThread);

    socket.on("new-message", newMessageHandler(client, chatId, io));
  };
