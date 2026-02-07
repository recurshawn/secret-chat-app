import { Server, Socket } from "socket.io";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on("send-message", (data: { room: string; message: any; sender: string }) => {
      console.log(`Message from ${socket.id} to room ${data.room}`);
      io.to(data.room).emit("receive-message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
