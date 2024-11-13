export interface Question {
  _id: string;
  title: string;
  description: string;
  category: string[];
  complexity: string;
}

export interface CreateQuestionFormData {
  title: string;
  description: string;
  complexity: string;
  categories: string[];
  categoryInput: string;
}

export interface QuestionMetadata {
  questionId: string;
  templateCode: {
    python: string;
    java: string;
    javascript: string;
    c: string;
    cpp: string;
  };
  testCases: Array<{
    input: any;
    output: any;
  }>;
}
