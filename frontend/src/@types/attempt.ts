
export interface Question {
    _id: string;
    title: string;
    description: string;
    category: string[];
    complexity: DifficultyLevel; // Changed from string to DifficultyLevel
  }

export interface Attempt {
  _id: string;
  questionId: Question;
  peerUserName?: string;
  status?: "Attempted" | "Completed"; // Added for clarity based on the schema
  timestamp?: Date; // Added the timestamp property here
  timeTaken?: number; // Store time taken
}

export interface AttemptTestCases {
  questionId: {
    title: string;
    description: string;
    category: string[];
    complexity: string;
  };
  peerUserName?: string;
  timestamp?: string;
  timeTaken?: number;
  codeContent?: string;
  language?: string;
  codeRuns?: CodeRun[];
}

export interface FetchAttemptsResponse {
  attempts: Attempt[];
}

export interface CreateAttemptResponse {
  success: boolean;
  message: string;
}

export interface Counts {
  Easy: number;
  Medium: number;
  Hard: number;
}


export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  userStdOut: string;
}

export interface CodeRun {
  code: string;
  language: string;
  output: string;
  testCaseResults: TestCaseResult[];
  timestamp: number;
  status: string;
}
