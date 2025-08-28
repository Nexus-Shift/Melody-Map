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
      } catch (error: any) {
        // User is not authenticated or token is invalid - this is normal
        // Don't show error toast for 401 as it's expected behavior
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
      // Check if this is a Google auth user trying to use password
      if (error.useGoogleAuth) {
        return { error };
      }

      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = `${
      import.meta.env.VITE_API_URL || "http://localhost:3001/api"
    }/auth/google`;
  };

  const canChangePassword = async (): Promise<boolean> => {
    try {
      const result = await apiClient.canChangePassword();
      return result.canChangePassword;
    } catch (error) {
      return false;
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
        signInWithGoogle,
        signOut,
        loading,
        canChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
