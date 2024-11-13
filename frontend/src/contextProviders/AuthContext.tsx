import React, { createContext, useState, useEffect } from "react";
import {
  AuthContextType,
  AuthProviderProps,
  LoginData,
  User,
} from "../@types/auth";
import { verifyToken, login as loginService } from "../api/userApi";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(
    localStorage.getItem("authToken") || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      handleVerifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleVerifyToken = async (token: string) => {
    try {
      const response = await verifyToken(token);
      if (response) {
        setUser({
          id: response.data.id,
          name: response.data.username,
          email: response.data.email,
          isAdmin: response.data.isAdmin,
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        logOut(() => {});
      }
    } catch (error) {
      setIsAuthenticated(false);
      logOut(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (
    data: LoginData,
    navigate: (path: string) => void
  ) => {
    try {
      const res = await loginService(data);

      if (res.data && res.data.accessToken) {
        setUser({
          id: res.data.id,
          name: res.data.username,
          email: res.data.email,
          isAdmin: res.data.isAdmin,
        });
        setToken(res.data.accessToken);
        localStorage.setItem("authToken", res.data.accessToken);
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        throw new Error(res.message || "Login failed: Access token not found");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const logOut = (navigate: (path: string) => void) => {
    setUser(null);
    setToken("");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login: handleLogin,
        logOut,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
