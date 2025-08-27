import { useEffect, useState, ReactNode } from "react";
import { apiClient, User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/hooks/auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await apiClient.getCurrentUser();
        setUser(user);
      } catch (error) {
        // User is not authenticated or token is invalid
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { user } = await apiClient.signUp(email, password, username);
      setUser(user);

      toast({
        title: "Account created successfully",
        description: "Welcome to Melody Map!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await apiClient.signIn(email, password);
      setUser(user);

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
      setUser(null);

      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
