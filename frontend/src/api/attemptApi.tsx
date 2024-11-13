import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Function to create an attempt
export const createAttempt = async (attemptData: any, token: string) => {
  console.log("createAttempt called with data:", attemptData);
  console.log("Token:", token);

  try {
    const response = await axios.post(`${API_URL}/attempts`, attemptData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("createAttempt response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error in createAttempt:", error.response?.data || error.message);
    throw error;
  }
};

// Function to fetch user attempts
export const fetchUserAttempts = async (token: string, signal?: AbortSignal) => {
  console.log("fetchUserAttempts called with token:", token);

  try {
    const response = await axios.get(`${API_URL}/attempts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    console.log("fetchUserAttempts response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error in fetchUserAttempts:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchAttemptById = async (attemptId: string, token: string) => {
  try {
    const response = await axios.get(`${API_URL}/attempts/${attemptId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attempt by ID:", error);
    throw error;
  }
};