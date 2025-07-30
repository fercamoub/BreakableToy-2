import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // This page should never actually render for long
    // The AuthProvider will handle the redirect
    navigate("/", { replace: true });
  }, [navigate]);

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

export default CallbackPage;
