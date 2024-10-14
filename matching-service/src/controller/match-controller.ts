import { Request, Response } from "express";
import { MatchRequest } from "../types/match-types";
import { addMatchRequest } from "../service/match-service";

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
