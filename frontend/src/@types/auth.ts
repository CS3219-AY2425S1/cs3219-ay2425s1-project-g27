export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (data: LoginData, navigate: (path: string) => void) => Promise<void>;
  logOut: (navigate: (path: string) => void) => void;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
