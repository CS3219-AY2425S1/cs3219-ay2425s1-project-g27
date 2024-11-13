import { 
  saveAttempt, 
  getAttemptsByUserId, 
  removeLatestAttempt, 
  deleteAttemptsForUserAndQuestion, 
  getAttemptByIdFromRepo } from "../repo/attempt-repo";
import { getQuestionById } from "../repo/question-repo";

// Create an Attempt
export async function createAttempt(attemptData: any) {
  const { userId, questionId, peerUserName } = attemptData;

  // Ensure the question exists
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Error(`Question with ID: ${questionId} not found`);
  }

  // Create the attempt
  return await saveAttempt(attemptData);
}

// Fetch Attempts by UserId
export async function fetchAttemptsByUserId(userId: string) {
  const attempts = await getAttemptsByUserId(userId);
  if (!attempts) {
    throw new Error(`No attempts found for user ID: ${userId}`);
  }
  return attempts;
}

// Fetch Attempts by AttemptId
export async function getAttemptById(attemptId: string) {
  return await getAttemptByIdFromRepo(attemptId);
}

// Function to Delete the latest Attempt
export async function deleteLatestAttempt(deletionData: { userId: string; questionId: string; peerUserName: string }) {
    const { userId, questionId, peerUserName } = deletionData;

    const deletionResult = await removeLatestAttempt(userId, questionId, peerUserName);
    if (!deletionResult) {
      throw new Error(`Attempt with User ID: ${userId}, Question ID: ${questionId}, and Peer Username: ${peerUserName} not found`);
    }
  
    return deletionResult;
  }

// Function to Delete Attempts for a Specific User and Question
export async function cleanupAttemptsForUserAndQuestion(userId: string, questionId: string): Promise<number> {
    const deletionResult = await deleteAttemptsForUserAndQuestion(userId, questionId);
    return deletionResult.deletedCount || 0;
  }
  
