import { Server } from "socket.io";
import { MatchRequest } from "../types/match-types";
import { connectRabbitMQ, getChannel } from "../queue/rabbitmq";
import Redis from "ioredis";

const redis = new Redis();

// Function to add a match request to the queue
export async function addMatchRequest(matchRequest: MatchRequest): Promise<void> {
  await connectRabbitMQ();
  const channel = getChannel();
  channel.sendToQueue("match_requests", Buffer.from(JSON.stringify(matchRequest)));
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
    console.log(`Match found between ${request.userName} and ${match.userName}`);

    io.to(request.userName).emit("match_found", {
      success: true,
      matchUserName: match.userName,
    });
    io.to(match.userName).emit("match_found", {
      success: true,
      matchUserName: request.userName,
    });
  } else {
    console.log(`No immediate match for ${request.userName}, waiting for 30 seconds.`);

    const timerId = setTimeout(async () => {
      const isStillWaiting = await redis.get(requestKey);

      const isCancelled = await redis.get(`cancelled:${request.userName}`);
      if (isCancelled) {
        console.log(`Match request for ${request.userName} was cancelled, stopping the timer.`);
        return;
      }

      if (isStillWaiting) {
        console.log(`No match found for ${request.userName} after 30 seconds.`);
        io.to(request.userName).emit("immediate_match_not_found", { success: false });
        redis.del(requestKey);
      }
    }, 30000);

    redis.set(`timer:${request.userName}`, timerId.toString(), "EX", 31);
  }
}


// Function to cancel a match request if the user cancels
export async function cancelMatchRequest(userName: string, io: Server): Promise<void> {
  const timerKey = `timer:${userName}`;
  const timerId = await redis.get(timerKey);

  if (timerId) {
    clearTimeout(Number(timerId));
    redis.del(`match_request:${userName}`);
    redis.del(timerKey);

    console.log(`Match request for ${userName} was cancelled.`);
    io.to(userName).emit("match_cancelled", { success: true });
  }
}

// Function to find a match for a given request
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

