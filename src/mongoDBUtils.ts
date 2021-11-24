// import { MongoClient } from "mongodb";
// import { chatMessage } from "./types";

// export const updateMessageThread = async (
//   client: MongoClient,
//   chatId: string,
//   newMessage: chatMessage
// ) => {
//   const chatRoomsCollection = client.db("chatApp").collection("chatRooms");
//   let initialChatRoom = await chatRoomsCollection.findOne({ chatId: chatId });

//   if (!initialChatRoom) {
//     await chatRoomsCollection.insertOne({ chatId: chatId, messageThread: [] });
//   }
//   await chatRoomsCollection.updateOne({ chatId: chatId }, { $push: { messageThread: newMessage } });
// };

// export const getMessageThread = async (client: MongoClient, chatId: string) => {
//   const chatRoomsCollection = client.db("chatApp").collection("chatRooms");
//   const userNamesCollection = client.db("chatApp").collection("userNames");

//   const messageThread = await chatRoomsCollection.findOne(
//     { chatId: chatId },
//     { projection: { messageThread: 1 } }
//   );
//   const senderIds = await chatRoomsCollection.distinct("messageThread.senderId", {
//     chatId: chatId,
//   });
//   const userNamesInChatRoom = await userNamesCollection
//     .find({ userId: { $in: senderIds } })
//     .toArray();
//   let userNamesObj = new Map();
//   for (const user of userNamesInChatRoom) {
//     if (user && typeof user.userId === "string") {
//       userNamesObj.set(user.userId, user.userName);
//     }
//   }
//   const messageThreadWithUpdatedUsernames = messageThread?.messageThread.map(
//     (message: chatMessage) => ({
//       ...message,
//       userName: userNamesObj.get(message.senderId),
//     })
//   );
//   return messageThreadWithUpdatedUsernames;
// };

// export const updateChatName = async (client: MongoClient, chatId: string, newChatName: string) => {
//   const chatRoomsCollection = await client.db("chatApp").collection("chatRooms");
//   await chatRoomsCollection.updateOne(
//     { chatId: chatId },
//     { $set: { chatId: chatId, chatName: newChatName } },
//     { upsert: true }
//   );
// };

// export const updateUserName = async (client: MongoClient, userId: string, newUserName: string) => {
//   const userNamesCollection = await client.db("chatApp").collection("userNames");
//   await userNamesCollection.updateOne(
//     { userId: userId },
//     { $set: { userId: userId, userName: newUserName } },
//     { upsert: true }
//   );
// };

// export const getUserName = async (client: MongoClient, userId: string) => {
//   const userNamesCollection = await client.db("chatApp").collection("userNames");
//   const userName = await userNamesCollection.findOne(
//     { userId: userId },
//     { projection: { userName: 1 } }
//   );
//   return userName?.userName;
// };
