import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setUserId } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const expiresIn = searchParams.get("expires_in");
    const userId = searchParams.get("user_id");

    if (accessToken && expiresIn && userId) {
      // Store tokens
      setAccessToken(accessToken);
      setUserId(userId);
      localStorage.setItem("spotify_access_token", accessToken);
      localStorage.setItem("spotify_user_id", userId);

      // Calculate expiration
      const expiresAt = Date.now() + Number(expiresIn) * 1000;
      localStorage.setItem("spotify_expires_at", expiresAt.toString());

      // Clean URL and redirect
      window.history.replaceState({}, "", "/");
      navigate("/");
    } else {
      // Handle error
      const error = searchParams.get("error");
      navigate(`/?error=${error || "authentication_failed"}`);
    }
  }, [searchParams, navigate, setAccessToken, setUserId]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
    </Box>
  );
};

export default AuthCallbackPage;
