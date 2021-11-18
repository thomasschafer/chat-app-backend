import e from "cors";
import { Collection } from "mongodb";
import { chatMessage } from "./types";

export const DB_URI = "mongodb://localhost:27017";

export const updateMessageThread = async (
  collection: Collection,
  chatId: string,
  newMessage: chatMessage
) => {
  let initialChatRoom = await collection.findOne({ chatId: chatId });

  if (!initialChatRoom) {
    await collection.insertOne({ chatId: chatId, messageThread: [] });
  }
  await collection.updateOne({ chatId: chatId }, { $push: { messageThread: newMessage } });
};

export const getMessageThread = async (collection: Collection, chatId: string) => {
  const chatRoom = await collection.findOne({ chatId: chatId });
  return chatRoom?.messageThread;
};
