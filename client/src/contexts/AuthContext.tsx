import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

export type UserType = "student" | "admin";

export interface User {
  id: string;
  name: string;
  cpf?: string;
  type: UserType;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Data
const MOCK_STUDENTS = [
  { id: "1", name: "João Silva", cpf: "123.456.789-00", type: "student" as const },
  { id: "2", name: "Maria Oliveira", cpf: "987.654.321-00", type: "student" as const },
];

const MOCK_ADMIN = { id: "admin", name: "Secretaria Acadêmica", type: "admin" as const };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (identifier: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Admin Login (simulated with specific code for demo purposes)
    if (identifier === "admin") {
      const adminUser = MOCK_ADMIN;
      setUser(adminUser);
      localStorage.setItem("auth_user", JSON.stringify(adminUser));
      setLocation("/admin/dashboard");
      return true;
    }

    // Student Login (CPF)
    const student = MOCK_STUDENTS.find(s => s.cpf === identifier);
    if (student) {
      setUser(student);
      localStorage.setItem("auth_user", JSON.stringify(student));
      setLocation("/student/dashboard");
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
