import useSpotify from "../hooks/useSpotify";

export const useSpotifyService = () => {
  const { get, loading, error } = useSpotify();

  const getCurrentUserProfile = async () => {
    return get("/api/me");
  };

  const getTopArtists = async (timeRange = "medium_term", limit = 10) => {
    return get("/api/me/top/artists", { timeRange, limit });
  };

  const getArtist = async (id: string) => {
    return get(`/api/artists/${id}`);
  };

  const getArtistAlbums = async (
    id: string,
    includeGroups = "album,single",
    market = "US",
    limit = 10,
    offset = 0
  ) => {
    return get(`/api/artists/${id}/albums`, {
      includeGroups,
      market,
      limit,
      offset,
    });
  };

  const getArtistTopTracks = async (id: string, market = "US") => {
    return get(`/api/artists/${id}/top-tracks`, { market });
  };

  const getAlbum = async (id: string) => {
    return get(`/api/albums/${id}`);
  };

  const search = async (
    query: string,
    type = "artist,album,track",
    limit = 10,
    offset = 0
  ) => {
    return get("/api/search", { q: query, type, limit, offset });
  };

  const getRelatedArtists = async (id: string) => {
    return get(`/api/artists/${id}/related-artists`);
  };

  const searchArtistsAndAlbums = async (query: string, limit = 10) => {
    const data = await get("/api/search", {
      q: query,
      type: "artist,album",
      limit,
    });

    return {
      artists: data.artists?.items || [],
      albums: data.albums?.items || [],
    };
  };

  return {
    getCurrentUserProfile,
    getTopArtists,
    getArtist,
    getArtistAlbums,
    getArtistTopTracks,
    getAlbum,
    search,
    getRelatedArtists,
    searchArtistsAndAlbums,
    loading,
    error,
  };
};
