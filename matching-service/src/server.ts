import express from "express";
import { Server } from "socket.io";
import http from "http";
import matchRoutes from "./routes/match-routes";
import { consumeMatchRequests } from "./service/match-service";
import { connectRabbitMQ } from "./queue/rabbitmq";
import cors from "cors";

const PORT = process.env.PORT || 3000;

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

app.use("/api", matchRoutes);

server.listen(PORT, async () => {
  try {
    await connectRabbitMQ();
    consumeMatchRequests(io);
    console.log(`Matching service is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", ({ userName }) => {
    socket.join(userName);
    console.log(`User ${userName} joined their room for match updates.`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
