import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { connectRabbitMQ } from "./queue/rabbitmq";
import { handleCodeUpdates, joinCollaborationRoom } from "./service/collaboration-service";

const PORT = process.env.PORT || 3003;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

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

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server and connect RabbitMQ
server.listen(PORT, async () => {
  try {
    await connectRabbitMQ(io); // pass io to handle messaging between services
    console.log(`Collaboration service is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
});
