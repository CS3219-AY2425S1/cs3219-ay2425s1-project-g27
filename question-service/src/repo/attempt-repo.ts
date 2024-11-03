import AttemptModel from "../model/attempt-model";

export async function saveAttempt(attemptData: any) {
  console.log("Saving attempt:", attemptData);
  return await AttemptModel.create(attemptData);
}

export async function getAttemptsByUserId(userId: string) {
  return await AttemptModel.find({ userId }).populate("questionId");
}

// New Repository Function to Remove an Attempt
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