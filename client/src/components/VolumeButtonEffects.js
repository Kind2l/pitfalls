import { useSound } from "@Components/SoundContext";
import React from "react";

const VolumeButtonEffects = () => {
  const { effectVolume, setEffectVolume } = useSound();

  const handleEffectVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setEffectVolume(newVolume);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <label htmlFor="effect-volume-slider" style={{ fontWeight: "bold" }}>
        Volume Effets
      </label>
      <input
        id="effect-volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={effectVolume}
        onChange={handleEffectVolumeChange}
        style={{
          width: "200px",
          cursor: "pointer",
        }}
      />
      <span>{Math.round(effectVolume * 100)}%</span>
    </div>
  );
};

export default VolumeButtonEffects;
