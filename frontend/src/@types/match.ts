import { Question, QuestionMetadata } from "./question";

export interface MatchDataResponse {
  success: string;
  matchUserName: string;
  roomId: string;
  question: Question;
  questionMetadata: QuestionMetadata
}
