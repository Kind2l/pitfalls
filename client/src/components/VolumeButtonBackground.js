import React from "react";
import { useSound } from "./SoundContext";

const BackgroundMusicButton = () => {
  const { bgVolume, setBackgroundMusicVolume } = useSound();

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setBackgroundMusicVolume(newVolume);
  };

  return (
    <div>
      <input
        id="bg-volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={bgVolume}
        onChange={handleVolumeChange}
      />
      <span>{Math.round(bgVolume * 100)}%</span>
    </div>
  );
};

export default BackgroundMusicButton;
