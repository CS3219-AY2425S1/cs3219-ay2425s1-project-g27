import { Server as SocketIOServer } from 'socket.io';

declare global {
    namespace Express {
      interface Request {
        io?: SocketIOServer;
      }
    }
  }

export interface MatchRequest {
  userName: string;
  topic: string;
  difficulty: string;
}

export interface QuestionResponse {
  title: string;
  description: string;
  category: [string];
  complexity: string;
}
