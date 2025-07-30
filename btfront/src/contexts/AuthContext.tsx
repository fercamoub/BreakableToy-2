import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  accessToken: string | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setUserId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setAccessToken = (token: string) => {
    setAccessTokenState(token);
    setIsAuthenticated(true);
  };

  const setUserId = (id: string) => {
    setUserIdState(id);
  };

  const login = async () => {
    try {
      setError(null);
      const response = await axios.get("/auth/spotify/login");
      window.location.href = response.data.auth_url;
    } catch (error) {
      setError("Failed to initiate login");
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await axios.delete("/auth/spotify/logout", {
        params: { userId: userId || "default" },
      });
      setIsAuthenticated(false);
      setUserIdState(null);
      setAccessTokenState(null);
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_user_id");
      localStorage.removeItem("spotify_expires_at");
    } catch (error) {
      setError("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    // Check for existing tokens on load
    const token = localStorage.getItem("spotify_access_token");
    const userId = localStorage.getItem("spotify_user_id");
    const expiresAt = localStorage.getItem("spotify_expires_at");

    if (token && userId && expiresAt && Date.now() < Number(expiresAt)) {
      setAccessToken(token);
      setUserIdState(userId);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        accessToken,
        error,
        login,
        logout,
        setAccessToken,
        setUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
