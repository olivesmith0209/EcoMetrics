import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { supabase, SupabaseUser } from "@/lib/supabase";

// Updated auth types for Supabase integration
type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: SelectUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterCredentials>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  // Load the current session when the app starts
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }
      
      if (data?.session) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setSupabaseUser(userData.user as SupabaseUser);
        }
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user as SupabaseUser);
          // Sync with server-side user data if needed
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        } else {
          setSupabaseUser(null);
          queryClient.setQueryData(["/api/user"], null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from server (extended profile)
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!supabaseUser, // Only run when we have a logged-in Supabase user
  });

  // Login with Supabase
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register with Supabase
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterCredentials) => {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully! Please check your email for verification.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sign out from Supabase
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Supabase's onAuthStateChange will handle clearing the user state
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        supabaseUser,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
