import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
}

const USERS_KEY = "aijobgetter_users";
const SESSION_KEY = "aijobgetter_session";

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  function signup(name: string, email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();

    if (users.some((u) => u.email === normalizedEmail)) {
      return { success: false, error: "An account with this email already exists. Try logging in instead." };
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password,
    };
    writeUsers([...users, newUser]);

    const { password: _password, ...publicUser } = newUser;
    setUser(publicUser);
    return { success: true };
  }

  function login(email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readUsers();
    const match = users.find((u) => u.email === normalizedEmail);

    if (!match) {
      return { success: false, error: "No account found with that email. Try signing up instead." };
    }
    if (match.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const { password: _password, ...publicUser } = match;
    setUser(publicUser);
    return { success: true };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
