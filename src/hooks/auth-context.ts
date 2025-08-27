import { createContext, useContext } from "react";
import { apiClient, User } from "@/lib/api";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthContextType {
  user: User | null;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => void;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
  canChangePassword: () => Promise<boolean>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
