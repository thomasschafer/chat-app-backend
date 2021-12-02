import { Socket, Server } from "socket.io";

import { ChatRoomModel, UserModel } from "./mongoSchema";

// TODO: CHECK that DB calls have been successful

const newMessageHandler =
  (chatId: string, io: Server) =>
  async (msg: { senderUserId: string; body: string; userName?: string }) => {
    console.log(`New message from sender ${msg.senderUserId}`);

    await ChatRoomModel.updateOne(
      { chatId: chatId },
      { $push: { messageThread: { senderUserId: msg.senderUserId, body: msg.body } } },
      { upsert: true }
    );

    msg.userName = await getUsernameFromID(msg.senderUserId);
    io.sockets.in(chatId).emit("message-received", msg);
    console.log("Successfully updated message thread:", chatId);
  };

export const joinChatHandler = (socket: Socket, io: Server) => async (chatId: string) => {
  socket.join(chatId);

  const chat = await ChatRoomModel.findOne({ chatId: chatId });
  console.log("chat", chat, chatId);
  const msgThread = chat?.messageThread;

  const userNames = new Map();
  if (msgThread) {
    for (let msg of msgThread) {
      console.log("msgStart", msg);
      let userName = userNames.get(msg.senderUserId);
      if (!userName) {
        const user = await UserModel.findOne({ userId: msg.senderUserId });
        userName = user?.userName;
        userNames.set(msg.senderUserId, userName);
      }
      if (userName) {
        msg.userName = userName;
      }
      console.log("msgEnd", msg, "userName", userName);
    }
  }

  console.log("updatedMsgThread", msgThread);
  io.sockets.in(chatId).emit("message-thread", msgThread);

  const chatName = chat?.chatName;
  io.sockets.in(chatId).emit("chat-name", { chatName });

  socket.on("new-message", newMessageHandler(chatId, io));
};

export const updateChatHandler =
  (io: Server) => async (chatUpdates: { chatId: string; chatName: string }) => {
    console.log(`Updating chat with chatUpdates: ${JSON.stringify(chatUpdates)}`);

    await ChatRoomModel.updateOne(
      { chatId: chatUpdates.chatId },
      { chatName: chatUpdates.chatName },
      { upsert: true }
    );

    io.sockets.in(chatUpdates.chatId).emit("chat-name", { chatName: chatUpdates.chatName });
  };

export const updateUserHandler =
  (io: Server) =>
  async (userUpdates: { chatId: string; senderUserId: string; userName: string }) => {
    console.log(`Updating user with userUpdates: ${JSON.stringify(userUpdates)}`);
    await UserModel.updateOne(
      { userId: userUpdates.senderUserId },
      { userName: userUpdates.userName },
      { upsert: true }
    );
    // TODO: Implement alternative solution that doesn't involve users sending senderUserId through websocket (security risk)
    io.sockets.in(userUpdates.chatId).emit("user-was-updated", userUpdates);
  };

const getUsernameFromID = async (userId: string) => {
  const user = await UserModel.findOne({ userId: userId });
  return user?.userName;
};

export const requestUsernameHandler =
  (socket: Socket) =>
  async ({ userId }: { userId: string }) => {
    const userName = await getUsernameFromID(userId);
    socket.emit("username", { userName });
  };
