import axios from "axios";
import { LoginData, SignUpData } from "../@types/auth";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export const verifyToken = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

export const login = async (data: LoginData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    toast.error("Invalid email/password");
    throw error;
  }
};

export const updateUserProfile = async (
  token: string,
  userId: number,
  data: { username?: string; email?: string; password?: string }
) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new Error("Username or email already exists.");
    }
    console.error("Error updating profile:", error);
    throw new Error("An error occurred while updating the profile.");
  }
};

export const signUpService = async (data: SignUpData) => {
  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
  };
  try {
    const response = await axios.post(`${API_URL}/users`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        throw new Error("Account already exists.");
      }
    }
    console.error("Error during sign up:", error);
    throw new Error("An error occurred during sign up");
  }
};
