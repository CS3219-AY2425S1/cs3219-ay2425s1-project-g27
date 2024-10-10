import axios from "axios";
import { CreateQuestionFormData } from "../@types/question";

const API_URL = import.meta.env.VITE_QUESTION_API_URL;

export const getAllQuestions = async (
  {
    page,
    limit,
    sort,
    order,
    search,
  }: {
    page: number;
    limit: number;
    sort: string;
    order: string;
    search?: string;
  },
  signal: AbortSignal
) => {
  try {
    let url = `${API_URL}/api/questions?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axios.get(url, { signal });
    console.log(response);
    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log("Request canceled:", error.message);
    } else {
      console.error("Error fetching questions:", error);
      throw error;
    }
  }
};

export const fetchQuestionById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/questions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const createQuestion = async (
  data: CreateQuestionFormData,
  token: string
) => {
  const payload = {
    title: data.title,
    description: data.description,
    complexity: data.complexity,
    category: data.categories,
  };
  try {
    const response = await axios.post(`${API_URL}/api/questions`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const deleteQuestionById = async (id: string, token: string) => {
  try {
    await axios.delete(`${API_URL}/api/questions/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

export const updateQuestion = async (
  id: string,
  data: CreateQuestionFormData,
  token: string
) => {
  const payload = {
    title: data.title,
    description: data.description,
    complexity: data.complexity,
    category: data.categories,
  };
  try {
    const response = await axios.put(
      `${API_URL}/api/questions/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};
