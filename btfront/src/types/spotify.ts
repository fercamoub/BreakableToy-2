export interface Image {
  url: string;
  height?: number;
  width?: number;
}

export interface Artist {
  id: string;
  name: string;
  images?: Image[];
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
}

export interface Album {
  id: string;
  name: string;
  artists: Artist[];
  images: Image[];
  release_date: string;
  total_tracks: number;
  album_type: "album" | "single" | "compilation";
}

export interface SearchResults {
  artists?: {
    items: Artist[];
  };
  albums?: {
    items: Album[];
  };
  tracks?: {
    items: Track[];
  };
}

export interface Artist {
  id: string;
  name: string;
  images?: { url: string }[];
  genres?: string[];
  followers?: { total: number };
  popularity?: number;
}

export interface Track {
  id: string;
  name: string;
  duration_ms: number;
  album?: Album;
  artists: Artist[];
  preview_url?: string;
  track_number: number;
  popularity?: number;
}

export interface ArtistResponse {
  artist: Artist;
  topTracks: Track[];
  albums: Album[];
  relatedArtists: Artist[];
}
