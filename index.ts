import express from "express";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const PORT = 8000;

app.get("/", (req, res) => {
  res.send("<h1>Hello world 5!</h1>");
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
