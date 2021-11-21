import { MongoClient } from "mongodb";
import { Socket, Server } from "socket.io";

import { getMessageThread, getUserName, updateMessageThread, updateUserName } from "./mongoDBUtils";

const newMessageHandler =
  (client: MongoClient, chatId: string, io: Server) =>
  async (msg: { senderId: string; body: string; userName?: string }) => {
    console.log(`New message from sender ${msg.senderId}`);
    await updateMessageThread(client, chatId, msg);
    msg.userName = await getUserName(client, msg.senderId);
    io.sockets.in(chatId).emit("message-received", msg);
    console.log("Successfully updated message thread:", chatId);
  };

export const joinChatHandler =
  (client: MongoClient, socket: Socket, io: Server) => async (chatId: string) => {
    // TODO: FIX ANY TYPE
    socket.join(chatId);

    const msgThread = await getMessageThread(client, chatId);
    io.sockets.in(chatId).emit("message-thread", msgThread);

    socket.on("new-message", newMessageHandler(client, chatId, io));
  };

export const updateUser =
  (client: MongoClient, io: Server) =>
  (userUpdates: { chatId: string; senderId: string; userName: string }) => {
    console.log(`Updating user with userUpdates: ${JSON.stringify(userUpdates)}`);
    updateUserName(client, userUpdates.senderId, userUpdates.userName);
    // TODO: Implement alternative solution that doesn't involve users sending senderId through websocket (security risk)
    // TODO: Don't emit update to all chats
    io.sockets.in(userUpdates.chatId).emit("user-was-updated", userUpdates);
  };

export const getUserNameFromID =
  (client: MongoClient, socket: Socket) =>
  async ({ userId }: { userId: string }) => {
    const userName = await getUserName(client, userId);
    socket.emit("username", { userName });
  };
