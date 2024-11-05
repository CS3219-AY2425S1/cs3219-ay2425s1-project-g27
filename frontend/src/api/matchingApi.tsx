import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const findMatch = async (
  userName: string,
  topic: string,
  difficulty: string
) => {
  const payload = {
    userName: userName,
    topic: topic,
    difficulty: difficulty,
  };
  try {
    const response = await axios.post(`${API_URL}/matching/match`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error finding match:", error);
    throw error;
  }
};

// Function to cancel a match request
export const cancelMatch = async (userName: string) => {
  const payload = {
    userName: userName,
  };
  try {
    const response = await axios.post(`${API_URL}/matching/cancel`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling match:", error);
    throw error;
  }
};
