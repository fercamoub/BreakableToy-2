import { TableCell, TableRow, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface TrackItemProps {
  track: any;
  index: number;
  showAlbum?: boolean;
}

const TrackItem = ({ track, index, showAlbum = true }: TrackItemProps) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Typography variant="body1" fontWeight="bold">
          {track.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {track.artists.map((artist: any) => artist.name).join(", ")}
        </Typography>
      </TableCell>
      {showAlbum && track.album && (
        <TableCell>
          <Link to={`/album/${track.album.id}`}>{track.album.name}</Link>
        </TableCell>
      )}
      <TableCell>{formatDuration(track.duration_ms)}</TableCell>
      <TableCell>
        <div
          style={{
            width: "100%",
            height: 4,
            backgroundColor: "#e0e0e0",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              width: `${track.popularity}%`,
              height: "100%",
              backgroundColor: "#1db954",
              borderRadius: 2,
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TrackItem;
