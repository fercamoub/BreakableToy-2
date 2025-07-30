import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import type { Artist } from "../types/spotify";

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard = ({ artist }: ArtistCardProps) => {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      {artist.images && artist.images.length > 0 && (
        <CardMedia
          component="img"
          height="140"
          image={artist.images[0].url}
          alt={artist.name}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {artist.name}
        </Typography>
        {artist.genres && artist.genres.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {artist.genres.join(", ")}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/artist/${artist.id}`}>
          View Artist
        </Button>
      </CardActions>
    </Card>
  );
};

export default ArtistCard;
