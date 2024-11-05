import { Socket } from "socket.io";
import Redis from "ioredis";
import { executeCode } from "./code-execution-service";
import axios from 'axios';

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || "http://localhost:3002";
const redis = new Redis(REDIS_URL);

// Map to track users in each collaboration room
const roomUsers: { [roomId: string]: string[] } = {};

// Map to store socket IDs to user information
const socketUserInfo: { [socketId: string]: { userName: string; userId: string; questionId: string; token: string } } = {};

// Map to track all users who have ever been in each collaboration room
const roomUserHistory: { [roomId: string]: Set<string> } = {};
const sessionStartTime: { [socketId: string]: number } = {}; // Stores the start time in milliseconds
export async function joinCollaborationRoom(socket: Socket, {
    roomId,
    userName,
    userId,
    questionId,
    token,
  }: {
    roomId: string;
    userName: string;
    userId: string;
    questionId: string;
    token: string;
  },
  callback: (response: { success: boolean }) => void
) {
  socket.join(roomId);
  console.log(`User ${userName} joined room ${roomId}`);

  // Record the start time of the session
  sessionStartTime[socket.id] = Date.now();

  // Map socket ID to user info
  socketUserInfo[socket.id] = { userName, userId, questionId, token };

  // Add user to room
  if (!roomUsers[roomId]) {
    roomUsers[roomId] = [];
  }
  roomUsers[roomId].push(userName);

  // Add user to room history
  if (!roomUserHistory[roomId]) {
    roomUserHistory[roomId] = new Set();
  }
  roomUserHistory[roomId].add(userName);

  console.log(`Current users in room ${roomId}:`, roomUsers[roomId]);

  const existingCode = await redis.get(`collab:${roomId}:code`) || "";

  const existingOutput = await redis.get(`collab:${roomId}:output`);

  const existingLanguage = await redis.get(`collab:${roomId}:language`);

  socket.emit("code_update", { code: existingCode });

  if (existingOutput) {
    socket.emit("code_result", { output: existingOutput });
  }

  if (existingLanguage) {
    socket.emit("change_language", { newLanguage: existingLanguage });
  }

  callback({ success: true });
}


export async function handleCodeUpdates(socket: Socket, { roomId, code }: { roomId: string; code: string }) {
  await redis.set(`collab:${roomId}:code`, code, "EX", 3600);
  socket.to(roomId).emit("code_update", { code });
}
export async function handleSendMessage(socket: Socket, { roomId, userName, message }: {roomId: string; userName: string; message: string}) {
  const chatMessage = { userName, message, timestamp: Date.now() };
  console.log(`User ${userName} sent a message in room ${roomId}`);
  await redis.rpush(`chat:${roomId}`, JSON.stringify(chatMessage));
  socket.to(roomId).emit("receive_message", chatMessage);  
}

export async function handleLeaveRoom(socket: Socket, { roomId, codeContent }: { roomId: string, codeContent: string }) {
  socket.leave(roomId);

  const userInfo = socketUserInfo[socket.id];
  if (!userInfo) {
    console.log(`No user info found for socket ID: ${socket.id}`);
    return;
  }
  const { userName, userId, questionId, token } = userInfo;
  console.log(`User ${userName} left room ${roomId} with final code content:`, codeContent);

  // Calculate time taken in seconds
  const endTime = Date.now();
  const startTime = sessionStartTime[socket.id];
  const timeTaken = Math.floor((endTime - startTime) / 1000); // time in seconds

  // Clean up the start time from the map
  delete sessionStartTime[socket.id];

  // Get the peer usernames from roomUserHistory[roomId], excluding the current user
  const peerUserNames = Array.from(roomUserHistory[roomId] || []).filter(
    (name) => name !== userName
  );

  // Remove the mapping
  delete socketUserInfo[socket.id];

  console.log(`Current users in room before removal:`, roomUsers[roomId]);

  // Remove the user who is leaving
  roomUsers[roomId] = roomUsers[roomId]?.filter((user) => user !== userName);

  // Now, roomUsers[roomId] should contain the remaining users
  console.log(`Current users in room after removal:`, roomUsers[roomId]);

  // Fetch the current code content from Redis
  const currentCode = await redis.get(`collab:${roomId}:code`);

  // Fetch the current language from Redis
  const currentLanguage = await redis.get(`collab:${roomId}:language`);

  let peerUserName: string | undefined;

  if (peerUserNames.length > 0) {
    peerUserName = peerUserNames[0]; 
  } else {
    peerUserName = undefined;
  }

  console.log(`Peer userName is: ${peerUserName}`);

  // Send attempt data to question-service
  try {
    const attemptData = {
      userId,
      questionId,
      peerUserName,
      timeTaken,
      codeContent: currentCode,
      language: currentLanguage,
    };
    console.log(`Sending attempt data to question-service:`, attemptData);

    await axios.post(`${QUESTION_SERVICE_URL}/api/attempts`, attemptData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Attempt data sent successfully.`);
    // Emit "attempt_saved" event to the room to notify clients
    socket.to(roomId).emit("attempt_saved");
  } catch (error: any) {
    console.error(
      `Error sending attempt data to question-service:`,
      error.message
    );
    
  }

  // Notify the remaining user
  if (peerUserName) {
    socket.to(roomId).emit("peer_left", { userName });
  }

  socket.to(roomId).emit("leave_collab_notify", { userName });

  if (!roomUsers[roomId] || roomUsers[roomId].length === 0) {
    delete roomUsers[roomId];
    delete roomUserHistory[roomId];
  }
}

export async function handleRunCode(socket: Socket, { roomId, code, language }: { roomId: string; code: string; language: string }) {
  socket.to(roomId).emit("code_execution_started");
  socket.emit("code_execution_started");

  try {
    const output = await executeCode(code, language);

    await redis.set(`collab:${roomId}:output`, output, "EX", 3600);

    socket.to(roomId).emit("code_result", { output });
    socket.emit("code_result", { output });
  } catch (error) {
    console.error("Error executing code:", error);
    const errorMessage = "Error executing code.";
    socket.to(roomId).emit("code_result", { output: errorMessage });
    socket.emit("code_result", { output: errorMessage });
  } finally {
    socket.to(roomId).emit("code_execution_finished");
    socket.emit("code_execution_finished");
  }
}

export async function changeLanguage(socket: Socket, { roomId, newLanguage }: { roomId: string; newLanguage: string }) {
  await redis.set(`collab:${roomId}:language`, newLanguage, "EX", 3600);
  socket.to(roomId).emit("change_language", { newLanguage });
}