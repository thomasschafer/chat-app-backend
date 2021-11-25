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

export const ChatRoomModel = model<ChatRoom>("chatRoom", chatRoomSchema);

interface User {
  userId: string;
  userName?: string;
}

const userSchema = new Schema<User>({
  userId: { type: String, required: true },
  userName: String,
});

export const UserModel = model<User>("user", userSchema);
