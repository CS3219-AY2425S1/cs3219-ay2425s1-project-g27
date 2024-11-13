import AttemptModel from "../model/attempt-model";

// Create an attempts 
export async function saveAttempt(attemptData: any) {
  return await AttemptModel.create(attemptData);
}

// Fetch all attempts by UserId
export async function getAttemptsByUserId(userId: string) {
  return await AttemptModel.find({ userId }).populate("questionId");
}

// Retrieve Attempts based on Attempt Id
export async function getAttemptByIdFromRepo(attemptId: string) {
  return await AttemptModel.findById(attemptId).populate("questionId");
}

// Remove an Attempt
export async function removeLatestAttempt(userId: string, questionId: string, peerUserName: string) {
    console.log(`Attempt to delete for User ID: ${userId}, Question ID: ${questionId}, and Peer Username: ${peerUserName}`);
  
    const deletionResult = await AttemptModel.findOneAndDelete(
      { userId, questionId, peerUserName },
      { sort: { timestamp: -1 } } // Sort by timestamp descending to delete the latest attempt
    );
  
    if (!deletionResult) {
      console.error(`Attempt not found for User ID: ${userId}, Question ID: ${questionId}, and Peer Username: ${peerUserName}`);
      return null;
    }
  
    console.log(`Attempt deleted successfully:`, deletionResult);
    return deletionResult;
  }

// Delete Attempts for a Specific User and Question
export async function deleteAttemptsForUserAndQuestion(userId: string, questionId: string) {
    console.info(`Deleting all attempts for User ID: '${userId}' and Question ID: '${questionId}'`);
  
    const deletionResult = await AttemptModel.deleteMany({
      userId,
      questionId
    });
  
    console.info(`Deleted ${deletionResult.deletedCount} attempt(s) for User ID: '${userId}' and Question ID: '${questionId}'.`);
  
    return deletionResult;
  }

