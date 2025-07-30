import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSpotifyService } from "../services/spotifyService";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";
import Image from "../components/Image";

const ArtistPage = () => {
  const { id } = useParams();
  const { getArtist, getArtistTopTracks, getArtistAlbums, getRelatedArtists } =
    useSpotifyService();
  const [artistData, setArtistData] = useState<{
    artist: any;
    topTracks: any[];
    albums: any[];
    relatedArtists: any[];
  } | null>(null);
  const [loading, setLoading] = useState({
    artist: false,
    tracks: false,
    albums: false,
    related: false,
  });
  const [error, setError] = useState({
    artist: "",
    tracks: "",
    albums: "",
    related: "",
  });

  useEffect(() => {
    if (id) {
      fetchArtistData(id);
    }
  }, [id]);

  const fetchArtistData = async (artistId: string) => {
    try {
      setLoading({
        artist: true,
        tracks: true,
        albums: true,
        related: true,
      });
      setError({ artist: "", tracks: "", albums: "", related: "" });

      // Fetch artist info first
      const artist = await getArtist(artistId);
      setArtistData((prev) => ({ ...prev, artist }));
      setLoading((prev) => ({ ...prev, artist: false }));

      // Fetch other data in parallel
      try {
        const topTracks = await getArtistTopTracks(artistId);
        setArtistData((prev) => ({
          ...prev,
          topTracks: topTracks.tracks || [],
          artist: prev?.artist || artist,
        }));
        setLoading((prev) => ({ ...prev, tracks: false }));
      } catch (err) {
        console.error("Failed to fetch top tracks:", err);
        setError((prev) => ({ ...prev, tracks: "Failed to load top tracks" }));
        setLoading((prev) => ({ ...prev, tracks: false }));
      }

      try {
        const albums = await getArtistAlbums(artistId);
        setArtistData((prev) => ({
          ...prev,
          albums: albums.items || [],
          artist: prev?.artist || artist,
          topTracks: prev?.topTracks || [],
        }));
        setLoading((prev) => ({ ...prev, albums: false }));
      } catch (err) {
        console.error("Failed to fetch albums:", err);
        setError((prev) => ({ ...prev, albums: "Failed to load albums" }));
        setLoading((prev) => ({ ...prev, albums: false }));
      }

      try {
        const relatedArtists = await getRelatedArtists(artistId);
        setArtistData((prev) => ({
          ...prev,
          relatedArtists: relatedArtists.artists || [],
          artist: prev?.artist || artist,
          topTracks: prev?.topTracks || [],
          albums: prev?.albums || [],
        }));
        setLoading((prev) => ({ ...prev, related: false }));
      } catch (err) {
        console.error("Failed to fetch related artists:", err);
        setError((prev) => ({
          ...prev,
          related: "Failed to load related artists",
        }));
        setLoading((prev) => ({ ...prev, related: false }));
      }
    } catch (err) {
      console.error("Failed to fetch artist data:", err);
      setError({
        artist: "Failed to load artist information",
        tracks: "",
        albums: "",
        related: "",
      });
      setLoading({
        artist: false,
        tracks: false,
        albums: false,
        related: false,
      });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  if (loading.artist && !artistData?.artist) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error.artist) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error.artist}</Alert>
      </Box>
    );
  }

  if (!artistData?.artist) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Artist Header Section */}
      <Grid container spacing={4} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Image
            src={artistData.artist.images?.[0]?.url}
            alt={artistData.artist.name}
            style={{ borderRadius: "50%", width: "100%", maxWidth: 300 }}
          />
        </Grid>
        <Grid item xs={12} md={9}>
          <Typography variant="h2" gutterBottom>
            {artistData.artist.name}
          </Typography>

          {artistData.artist.genres?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {artistData.artist.genres.map((genre: string) => (
                <Chip key={genre} label={genre} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          )}

          {artistData.artist.followers && (
            <Typography variant="body1" sx={{ mb: 1 }}>
              {artistData.artist.followers.total?.toLocaleString()} followers
            </Typography>
          )}

          {artistData.artist.popularity && (
            <Typography variant="body1">
              Popularity: {artistData.artist.popularity}/100
            </Typography>
          )}
        </Grid>
      </Grid>

      {/* Popular Tracks Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Popular Songs
        </Typography>

        {loading.tracks ? (
          <CircularProgress />
        ) : error.tracks ? (
          <Alert severity="error">{error.tracks}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Album</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Popularity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {artistData.topTracks?.map((track: any, index: number) => (
                  <TableRow key={track.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {track.album?.images?.[0]?.url && (
                          <Image
                            src={track.album.images[0].url}
                            alt={track.name}
                            style={{ width: 40, height: 40, borderRadius: 4 }}
                          />
                        )}
                        <Box>
                          <Typography>{track.name}</Typography>
                          {track.explicit && (
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              E
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {track.album?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDuration(track.duration_ms)}</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 4,
                            bgcolor: "grey.300",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              width: `${track.popularity}%`,
                              height: "100%",
                              bgcolor: "primary.main",
                            }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {track.popularity}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Discography Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Discography
        </Typography>

        {loading.albums ? (
          <CircularProgress />
        ) : error.albums ? (
          <Alert severity="error">{error.albums}</Alert>
        ) : (
          <Grid container spacing={3}>
            {artistData.albums?.map((album: any) => (
              <Grid item key={album.id} xs={12} sm={6} md={4} lg={3}>
                <AlbumCard album={album} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Related Artists Section 
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Related Artists
        </Typography>

        {loading.related ? (
          <CircularProgress />
        ) : error.related ? (
          <Alert severity="error">{error.related}</Alert>
        ) : (
          <Grid container spacing={3}>
            {artistData.relatedArtists?.map((artist: any) => (
              <Grid item key={artist.id} xs={12} sm={6} md={4} lg={3}>
                <ArtistCard artist={artist} />
              </Grid>
            ))}
          </Grid>
        )} 
      </Box>*/}
    </Box>
  );
};

export default ArtistPage;
