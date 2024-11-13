import amqp, { Connection, Channel } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export async function connectRabbitMQ(): Promise<void> {
  if (connection) return; // Already connected
  console.log('Connecting to RabbitMQ server:', RABBITMQ_URL);
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('match_requests');
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized.');
  }
  return channel;
}