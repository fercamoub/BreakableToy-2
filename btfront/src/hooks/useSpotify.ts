import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const useSpotify = () => {
  const { accessToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = async <T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, {
        params: { userId: userId || "default", ...params },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? `Error ${err.response?.status}: ${
            err.response?.data?.message || err.message
          }`
        : "An unknown error occurred";
      setError(errorMessage);
      console.error("API Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { get, loading, error };
};

export default useSpotify;
