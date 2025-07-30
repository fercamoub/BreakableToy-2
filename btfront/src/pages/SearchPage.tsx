import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSpotifyService } from "../services/spotifyService";
import { Grid, Typography, Box, Alert, CircularProgress } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ArtistCard from "../components/ArtistCard";
import AlbumCard from "../components/AlbumCard";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const { searchArtistsAndAlbums, getTopArtists } = useSpotifyService();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    artists?: any[];
    albums?: any[];
  }>({});
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    search: false,
    topArtists: false,
  });
  const [error, setError] = useState({
    search: "",
    topArtists: "",
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q.trim()) {
      setQuery(q);
      performSearch(q);
    } else {
      setQuery("");
      setSearchResults({});
    }
    fetchTopArtists();
  }, [searchParams]);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setSearchResults({});
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, search: true }));
      setError((prev) => ({ ...prev, search: "" }));
      const data = await searchArtistsAndAlbums(q);
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError((prev) => ({
        ...prev,
        search: "Failed to load search results",
      }));
      setSearchResults({ artists: [], albums: [] });
    } finally {
      setLoading((prev) => ({ ...prev, search: false }));
    }
  };

  const fetchTopArtists = async () => {
    try {
      setLoading((prev) => ({ ...prev, topArtists: true }));
      setError((prev) => ({ ...prev, topArtists: "" }));
      const artists = await getTopArtists();
      setTopArtists(artists.items || []);
    } catch (err) {
      console.error("Error fetching top artists:", err);
      setError((prev) => ({
        ...prev,
        topArtists: "Failed to load top artists",
      }));
      setTopArtists([]);
    } finally {
      setLoading((prev) => ({ ...prev, topArtists: false }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <SearchBar initialQuery={query} />

      {/* Search Results */}
      {query && (
        <>
          <Typography variant="h4" sx={{ mb: 3, mt: 4 }}>
            Search Results for "{query}"
          </Typography>

          {loading.search && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error.search && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.search}
            </Alert>
          )}

          {!loading.search && !error.search && (
            <>
              {searchResults.artists && searchResults.artists.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Artists
                  </Typography>
                  <Grid container spacing={3}>
                    {searchResults.artists.map((artist) => (
                      <Grid item key={artist.id} xs={12} sm={6} md={4} lg={3}>
                        <ArtistCard artist={artist} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {searchResults.albums && searchResults.albums.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ mb: 2 }}>
                    Albums
                  </Typography>
                  <Grid container spacing={3}>
                    {searchResults.albums.map((album) => (
                      <Grid item key={album.id} xs={12} sm={6} md={4} lg={3}>
                        <AlbumCard album={album} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {searchResults.artists?.length === 0 &&
                searchResults.albums?.length === 0 && (
                  <Typography
                    variant="body1"
                    sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
                  >
                    No results found for "{query}"
                  </Typography>
                )}
            </>
          )}
        </>
      )}

      {/* Top Artists Section - Only show when not searching or no query */}
      {!query && (
        <>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Your Top Artists
          </Typography>

          {loading.topArtists && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error.topArtists ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.topArtists}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {topArtists.map((artist) => (
                <Grid item key={artist.id} xs={12} sm={6} md={4} lg={3}>
                  <ArtistCard artist={artist} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchPage;
