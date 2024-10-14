import { useContext, useEffect } from "react";
import { AuthContext } from "../contextProviders/AuthContext";
import { AuthContextType } from "../@types/auth";
import { verifyToken } from "../api/userApi";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && !context.isAuthenticated) {
      verifyToken(token);
    }
  }, [context]);

  return context;
};
