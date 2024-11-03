import { Request, Response } from "express";
import {
  createAttempt,
  fetchAttemptsByUserId,
  deleteLatestAttempt,
  cleanupAttemptsForUserAndQuestion,
} from "../service/attempt-service";


export async function createAttemptController(req: any, res: Response) {
  try {
    const userId = req.user.id;
    const userName = req.user.username; 
    const { peerUserName, questionId, timeTaken, codeContent } = req.body;

    
    // Ensure peerUserName is not the same as the authenticated user's name
    if (peerUserName === userName) {
      console.error("Validation Error: peerUserName cannot be the same as your own username.");
      return res.status(400).json({ error: "peerUserName cannot be the same as your own username." });
    }
    // Ensure required fields are provided
    if (!peerUserName || !questionId || timeTaken === undefined) {
      console.error("Validation Error: Missing required fields.");
      return res.status(400).json({
        error: "Missing required fields: 'peerUserName', 'questionId', and 'timeTaken' are required.",
      });
    }

    const attemptData = { questionId, peerUserName, userId, timeTaken, codeContent};
    console.log("Attempt data received:", attemptData);

    const attempt = await createAttempt(attemptData);
    console.log("Attempt created successfully:", attempt);
    res.status(201).json(attempt);
  } catch (error: any) {
    console.error("Error creating attempt:", error.message);
    res.status(400).json({ error: error.message });
  }
}

export async function getAttemptsByUserController(req: any, res: Response) {
  try {
    const userId = req.user.id;

    const attempts = await fetchAttemptsByUserId(userId);
    res.status(200).json(attempts);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// New Controller to Delete a latest Attempt
export async function deleteLatestAttemptController(req: any, res: Response) {
    try {
      const { userId, questionId, peerUserName } = req.body;
  
      // Check if required fields are present
      if (!userId || !questionId || !peerUserName) {
        console.error("Validation Error: Missing required fields.");
        return res.status(400).json({ error: "Missing required fields: 'userId', 'questionId', and 'peerUserName' are required." });
      }
  
      const deletionData = { userId, questionId, peerUserName };
      console.log("Deletion data received:", deletionData);
  
      // **Delete Attempt**
      const deletionResult = await deleteLatestAttempt(deletionData);
      if (!deletionResult) {
        console.error("Deletion Error: Attempt not found.");
        return res.status(404).json({ error: "Attempt not found." });
      }
  
      console.log("Attempt deleted successfully:", deletionResult);
  
      res.status(200).json({ success: true, message: "Attempt deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting attempt:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

// Cleanup Invalid Attempts for a Specific User
export async function cleanupInvalidAttemptsForUserController(req: any, res: Response) {
    try {
        const { userId, questionId } = req.body;
  
      // Check if 'userId' and 'questionId' is present
      if (!userId || !questionId) {
        console.error("Validation Error: Missing 'userId' or 'questionId'.");
        return res.status(400).json({ error: "Missing required fields: 'userId' and 'questionId' are required." });
    }


    console.info(`Initiating cleanup for attempts with User ID: '${userId}' and Question ID: '${questionId}'`);

    const deletedCount = await cleanupAttemptsForUserAndQuestion(userId, questionId);

    console.info(`Cleanup completed. Deleted ${deletedCount} attempt(s) for User ID: '${userId}' and Question ID: '${questionId}'.`);

    res.status(200).json({
      success: true,
      message: `${deletedCount} attempt(s) deleted successfully for User ID: '${userId}' and Question ID: '${questionId}'.`,
    });
  } catch (error: any) {
    console.error("Error during cleanup of attempts:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
}