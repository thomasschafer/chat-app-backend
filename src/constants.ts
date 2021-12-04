export const PORT = 8080;
export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://kobble.io",
  "https://www.kobble.io",
  "https://kobble-api.com",
  "https://www.kobble-api.com",
];
export const DB_URI = `mongodb://${process.env.CHAT_APP_DEV ? "localhost" : "mongodb"}:27017`;
