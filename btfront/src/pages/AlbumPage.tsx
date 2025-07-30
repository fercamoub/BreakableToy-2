import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSpotifyService } from "../services/spotifyService";
import {
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import Image from "../components/Image";

const AlbumPage = () => {
  const { id } = useParams();
  const spotifyService = useSpotifyService(); // Avoid destructuring here
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        setError("");
        const albumData = await spotifyService.getAlbum(id); // Use method from stable object
        setAlbum(albumData);
      } catch (error) {
        console.error("Error fetching album data:", error);
        setError("Failed to load album data");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
  }, [id]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const getTotalDuration = () => {
    if (!album?.tracks?.items) return "0:00";
    const totalMs = album.tracks.items.reduce(
      (total: number, track: any) => total + track.duration_ms,
      0
    );
    return formatDuration(totalMs);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!album) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Grid container spacing={4}>
        {/* Album Info Section */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "sticky",
              top: 20,
            }}
          >
            <Image
              src={album.images?.[0]?.url}
              alt={album.name}
              style={{
                width: "100%",
                maxWidth: 300,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            />
            <Typography
              variant="h4"
              sx={{ mt: 3, textAlign: "center", fontWeight: "bold" }}
            >
              {album.name}
            </Typography>
            <Typography
              variant="h6"
              sx={{ textAlign: "center", color: "text.secondary", mt: 1 }}
            >
              {album.artists?.map((artist: any) => artist.name).join(", ")}
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {album.release_date} • {album.total_tracks} songs •{" "}
                {getTotalDuration()}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Track List Section */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
              Track List
            </Typography>
            <TableContainer sx={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "background.paper",
                      }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "background.paper",
                      }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "background.paper",
                        textAlign: "right",
                      }}
                    >
                      Duration
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {album.tracks?.items?.map((track: any, index: number) => (
                    <TableRow
                      key={track.id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                          cursor: "pointer",
                        },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell
                        sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: "medium" }}>
                            {track.name}
                          </Typography>
                          {track.explicit && (
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                color: "text.secondary",
                                backgroundColor: "action.selected",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.7rem",
                              }}
                            >
                              EXPLICIT
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "right",
                          color: "text.secondary",
                          fontSize: "0.9rem",
                        }}
                      >
                        {formatDuration(track.duration_ms)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlbumPage;
