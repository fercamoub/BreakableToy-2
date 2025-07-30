import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import type { Album } from "../types/spotify";

interface AlbumCardProps {
  album: Album;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      {album.images && album.images.length > 0 && (
        <CardMedia
          component="img"
          height="140"
          image={album.images[0].url}
          alt={album.name}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {album.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {album.artists.map((artist) => artist.name).join(", ")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {album.release_date} • {album.total_tracks} tracks
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/album/${album.id}`}>
          View Album
        </Button>
      </CardActions>
    </Card>
  );
};

export default AlbumCard;
