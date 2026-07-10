import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  kyc_tier: number;
  payout_bank_name?: string | null;
  payout_account_number?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and fetch user
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        api.setToken(token);
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token invalid, clear it
          api.clearToken();
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login({ username: email, password });
    localStorage.setItem("auth_token", result.access_token);
    // Set user from API response
    if (result.user) {
      setUser(result.user);
    }
  };

  const register = async (data: any) => {
    const result = await api.register(data);
    // Auto login after registration
    await login(data.email, data.password);
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
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
