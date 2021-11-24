import { Socket, Server } from "socket.io";
import { Schema, model } from "mongoose";

interface ChatMessage {
  senderUserId: string;
  body: string;
  userName?: string;
}

interface ChatRoom {
  chatId: string;
  chatName?: string;
  messageThread: Array<ChatMessage>;
}

const chatRoomSchema = new Schema<ChatRoom>({
  chatId: { type: String, required: true },
  chatName: String,
  messageThread: [{ senderUserId: String, body: String, userName: String }],
});

const ChatRoomModel = model<ChatRoom>("chatRoom", chatRoomSchema);

interface User {
  userId: string;
  userName?: string;
}

const userSchema = new Schema<User>({
  userId: { type: String, required: true },
  userName: String,
});

const UserModel = model<User>("user", userSchema);

const newMessageHandler =
  (chatId: string, io: Server) =>
  async (msg: { senderUserId: string; body: string; userName?: string }) => {
    console.log(`New message from sender ${msg.senderUserId}`);

    await ChatRoomModel.updateOne(
      { chatId: chatId },
      { $push: { messageThread: { senderUserId: msg.senderUserId, body: msg.body } } },
      { upsert: true }
    );

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
      console.log("msg", msg);
      let userName = userNames.get(msg.senderUserId);
      if (!userName) {
        const user = await UserModel.findOne({ userId: msg.senderUserId });
        userName = user?.userName;
        userNames.set(msg.senderUserId, userName);
      }
      console.log("setting", msg);
      msg.userName = userName;
    }
  }

  console.log("updatedMsgThread", msgThread);
  io.sockets.in(chatId).emit("message-thread", msgThread);

  socket.on("new-message", newMessageHandler(chatId, io));
};

export const updateChat =
  (io: Server) => async (chatUpdates: { chatId: string; chatName: string }) => {
    console.log(`Updating chat with chatUpdates: ${JSON.stringify(chatUpdates)}`);
    await ChatRoomModel.updateOne(
      { chatId: chatUpdates.chatId },
      { chatName: chatUpdates.chatName }
    );

    io.sockets.in(chatUpdates.chatId).emit("chat-was-updated", chatUpdates);
  };

export const updateUser =
  (io: Server) =>
  async (userUpdates: { chatId: string; senderUserId: string; userName: string }) => {
    console.log(`Updating user with userUpdates: ${JSON.stringify(userUpdates)}`);
    await UserModel.updateOne(
      { userId: userUpdates.senderUserId },
      { userName: userUpdates.userName }
    );
    // TODO: CHECK that this has been successful
    // TODO: Implement alternative solution that doesn't involve users sending senderUserId through websocket (security risk)
    io.sockets.in(userUpdates.chatId).emit("user-was-updated", userUpdates);
  };

export const getUserNameFromID =
  (socket: Socket) =>
  async ({ userId }: { userId: string }) => {
    const user = await UserModel.findOne({ userId: userId });
    const userName = user?.userName;
    socket.emit("username", { userName });
  };
