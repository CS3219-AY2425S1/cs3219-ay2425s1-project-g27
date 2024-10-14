import { Server } from "socket.io";
import { MatchRequest } from "../types/match-types";
import { connectRabbitMQ, getChannel } from "../queue/rabbitmq";
import Redis from "ioredis";

let matchQueue: MatchRequest[] = [];

const redis = new Redis();

// Function to add a match request to the queue
export async function addMatchRequest(
  matchRequest: MatchRequest
): Promise<void> {
  await connectRabbitMQ();
  const channel = getChannel();
  channel.sendToQueue(
    "match_requests",
    Buffer.from(JSON.stringify(matchRequest))
  );
}
// Function to consume match requests from the queue
export async function consumeMatchRequests(io: Server): Promise<void> {
  await connectRabbitMQ();
  const channel = getChannel();

  channel.consume("match_requests", (msg) => {
    if (msg !== null) {
      const matchRequest: MatchRequest = JSON.parse(msg.content.toString());
      processMatchRequest(matchRequest, io);
      channel.ack(msg);
    }
  });
}

// Function to process a match request
async function processMatchRequest(request: MatchRequest, io: Server) {
  const requestKey = `match_request:${request.userName}`;
  const requestData = JSON.stringify(request);
  redis.set(requestKey, requestData, "EX", 31);
  // Attempt to find a match
  const match = await findMatch(request);

  if (match) {
    redis.del(requestKey);
    redis.del(`match_request:${match.userName}`);
    console.log(
      `Match found between ${request.userName} and ${match.userName}`
    );

    io.to(request.userName).emit("match_found", {
      success: true,
      matchUserName: match.userName,
    });
    io.to(match.userName).emit("match_found", {
      success: true,
      matchUserName: request.userName,
    });
  } else {
    console.log(
      `No immediate match for ${request.userName}, waiting for 30 seconds.`
    );
    setTimeout(async () => {
      const isStillWaiting = await redis.exists(requestKey);
      if (isStillWaiting) {
        await redis.del(requestKey);
        console.log(
          `No match found for ${request.userName} within the time limit.`
        );
        io.to(request.userName).emit("match_timeout", {
          success: false,
          message: "No match found within time limit.",
        });
      }
    }, 30000);
  }
}

async function findMatch(request: MatchRequest): Promise<MatchRequest | null> {
  const { userName, topic, difficulty } = request;
  const exactMatchKey = `match_queue:topic:${topic}:difficulty:${difficulty}`;
  await redis.srem(exactMatchKey, userName);

  let matchUserName = await redis.spop(exactMatchKey);

  while (matchUserName) {
    if (matchUserName !== userName) {
      const matchData = await redis.get(`match_request:${matchUserName}`);
      if (matchData) {
        const matchRequest: MatchRequest = JSON.parse(matchData);
        return matchRequest;
      }
    }
    matchUserName = await redis.spop(exactMatchKey);
  }

  await redis.sadd(exactMatchKey, userName);
  await redis.expire(exactMatchKey, 31);

  return null;
}
