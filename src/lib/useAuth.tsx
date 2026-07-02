import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  kyc_tier: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.setToken(token);
      // In real app, we'd fetch the current user here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login({ username: email, password });
    localStorage.setItem("auth_token", result.access_token);
    // Set user from API response
    if (result.user) {
      setUser(result.user);
    } else {
      setUser({
        id: "1",
        email,
        phone: "+234 801 234 5678",
        full_name: "Demo User",
        role: "buyer",
        kyc_tier: 1,
      });
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
