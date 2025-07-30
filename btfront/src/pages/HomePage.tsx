import { Container, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h3" gutterBottom>
        Breaktify
      </Typography>
      {!isAuthenticated && (
        <Button
          variant="contained"
          size="large"
          onClick={login}
          sx={{ px: 4, py: 2 }}
        >
          Login with Spotify
        </Button>
      )}
      {isAuthenticated && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            You're logged in!
          </Typography>
          <Typography variant="body1">
            Use the navigation bar to explore your music.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default HomePage;
