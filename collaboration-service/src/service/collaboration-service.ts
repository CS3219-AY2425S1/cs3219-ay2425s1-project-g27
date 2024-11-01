import { Socket } from "socket.io";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);

export async function joinCollaborationRoom(socket: Socket, { roomId, userName }: { roomId: string; userName: string }, callback: (response: { success: boolean }) => void) {
  socket.join(roomId);
  console.log(`User ${userName} joined room ${roomId}`);

  const existingCode = await redis.get(`collab:${roomId}:code`);
  if (existingCode) {
    socket.emit("code_update", { code: existingCode });
  }

  callback({ success: true });
}

export async function handleCodeUpdates(socket: Socket, { roomId, code }: { roomId: string; code: string }) {
  await redis.set(`collab:${roomId}:code`, code, "EX", 3600);
  socket.to(roomId).emit("code_update", { code });
}

export async function handleLeaveRoom(socket: Socket, { roomId, userName }: { roomId: string; userName: string }) {
  socket.leave(roomId);
  console.log(`User ${userName} left room ${roomId}`);

  socket.to(roomId).emit("leave_collab_notify", { userName });
}
