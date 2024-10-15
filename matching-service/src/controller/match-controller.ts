import { Request, Response } from 'express';
import { MatchRequest } from '../types/match-types';
import { addMatchRequest, cancelMatchRequest } from '../service/match-service';

export async function requestMatch(req: Request, res: Response): Promise<void> {
  const { userName, topic, difficulty } = req.body;

  if (!userName || !topic || !difficulty) {
    res
      .status(400)
      .json({ success: false, message: "Missing required fields." });
    return;
  }

  const matchRequest: MatchRequest = {
    userName,
    topic,
    difficulty,
  };

  try {
    await addMatchRequest(matchRequest);
    res
      .status(200)
      .json({ success: true, message: "Match request submitted." });
  } catch (error) {
    console.error("Error submitting match request:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function cancelMatch(req: Request, res: Response): Promise<void> {
  const { userName } = req.body;
  const io = req.io; // Get Socket.io instance from the request

  if (!userName) {
    res.status(400).json({ success: false, message: 'Missing required fields.' });
    return;
  }

  if (!io) {
    res.status(500).json({ success: false, message: 'Socket.io instance not found.' });
    return;
  }

  try {
    await cancelMatchRequest(userName, io); // Pass the `io` instance here
    res.status(200).json({ success: true, message: 'Match request cancelled.' });
  } catch (error) {
    console.error('Error cancelling match request:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
