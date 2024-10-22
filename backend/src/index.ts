import express from "express";
import http from "http";
import { SocketService } from "./services/SocketService";

const app = express();

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new SocketService(server);
io.initializeListeners();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (_, res) => {
  res.send("Socket.io Server Running");
});
