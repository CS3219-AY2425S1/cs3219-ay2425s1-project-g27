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
