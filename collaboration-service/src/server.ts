import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { handleCodeUpdates, joinCollaborationRoom, handleLeaveRoom, handleSendMessage, handleRunCode, changeLanguage } from "./service/collaboration-service";

const PORT = process.env.PORT || 3003;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// Attach Socket.IO event listeners
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join the collaboration room
  socket.on("join_collab", (data, callback) => {
    joinCollaborationRoom(socket, data, callback);
  });

  // Handle code updates
  socket.on("code_change", (data) => {
    handleCodeUpdates(socket, data);
  });

  socket.on("send_message", (data) => {
    handleSendMessage(socket, data); 
  });

  socket.on("leave_collab", (data) => {
    handleLeaveRoom(socket, data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on("run_code", (data) => {
    handleRunCode(socket, data);
  });

  socket.on("change_language", (data) => {
    changeLanguage(socket, data);
  })
});

// Start the server and connect RabbitMQ
server.listen(PORT, async () => {
  console.log(`Collaboration service is running on port ${PORT}`);
});
