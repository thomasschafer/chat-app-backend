export const PORT = 8080;
export const ALLOWED_ORIGINS = process.env.CHAT_APP_DEBUG
  ? ["http://localhost:3000"]
  : ["https://kobble.io", "https://www.kobble.io"];
export const DB_URI = "mongodb://mongo:27017";
