import { Server } from "socket.io";
import http from "http";

const lines = [];

export class SocketService {
  private io: Server;

  constructor(
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
  ) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }

  public initializeListeners() {
    this.io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("draw", (data) => {
        console.log("Message received:", data);

        lines.push(data);
        socket.broadcast.emit("draw", data);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
  }

  public send(data: any) {
    this.io.emit("message", data);
  }
}
