import amqp, { Connection, Channel } from 'amqplib';

let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<void> {
  if (connection) return; // Already connected
  connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  await channel.assertQueue('match_requests');
}

export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized.');
  }
  return channel;
}
