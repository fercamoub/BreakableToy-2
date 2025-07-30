import { useState, useEffect, useRef } from "react";
import { Slider, IconButton, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

interface AudioPlayerProps {
  previewUrl: string;
}

const AudioPlayer = ({ previewUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", () => setIsPlaying(false));
      audio.pause();
      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && previewUrl) {
      audioRef.current.src = previewUrl;
      audioRef.current.load();
      setIsPlaying(true);
      setProgress(0);
    }
  }, [previewUrl]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (_event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const newProgress = Array.isArray(newValue) ? newValue[0] : newValue;
      audioRef.current.currentTime =
        (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    setVolume(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 2 }}>
      <IconButton onClick={togglePlay}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>
      <Slider
        value={progress}
        onChange={handleProgressChange}
        sx={{ flexGrow: 1 }}
      />
      <VolumeUpIcon />
      <Slider
        value={volume}
        onChange={handleVolumeChange}
        sx={{ width: 100 }}
      />
    </Box>
  );
};

export default AudioPlayer;
