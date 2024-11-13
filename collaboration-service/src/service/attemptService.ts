import axios from 'axios';
import { AttemptData } from '../models/models';

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:3002';

export async function sendAttemptData(attemptData: AttemptData, token: string): Promise<void> {
  try {
    console.log(`Sending attempt data to question-service:`, attemptData);
    await axios.post(`${QUESTION_SERVICE_URL}/api/attempts`, attemptData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Attempt data sent successfully.`);
  } catch (error: any) {
    console.error(`Error sending attempt data to question-service:`, error.message);
    throw error;
  }
}