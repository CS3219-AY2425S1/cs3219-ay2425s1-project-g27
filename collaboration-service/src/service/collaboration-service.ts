import { Socket } from "socket.io";
import Redis from "ioredis";
import { throttle } from "lodash"; // Install lodash for throttling

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);

// Define the update frequency in milliseconds (adjust as needed)
const UPDATE_INTERVAL = 200;

export async function joinCollaborationRoom(
  socket: Socket,
  { roomId, userName }: { roomId: string; userName: string },
  callback: (response: { success: boolean }) => void
) {
  socket.join(roomId);
  console.log(`User ${userName} joined room ${roomId}`);

  const existingCode = await redis.get(`collab:${roomId}:code`);
  if (existingCode) {
    socket.emit("code_update", { code: existingCode });
  }

  callback({ success: true });
}

// Throttled function to handle code updates
const throttledHandleCodeUpdates = throttle(async (socket: Socket, { roomId, code }: { roomId: string; code: string }) => {
  await redis.set(`collab:${roomId}:code`, code, "EX", 3600);
  socket.broadcast.to(roomId).emit("code_update", { code });
}, UPDATE_INTERVAL);

export async function handleCodeUpdates(socket: Socket, data: { roomId: string; code: string }) {
  throttledHandleCodeUpdates(socket, data);
}

export async function handleLeaveRoom(socket: Socket, { roomId, userName }: { roomId: string; userName: string }) {
  socket.leave(roomId);
  console.log(`User ${userName} left room ${roomId}`);
  socket.broadcast.to(roomId).emit("leave_collab_notify", { userName });
}
