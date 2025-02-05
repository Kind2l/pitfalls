import ImageLoader from "@Components/ImageLoader";
import { useSound } from "@Context/SoundContext";
import "@Styles/Board/ShortMenu.scss";
import React, { useState } from "react";

const ShortMenu = ({ isOpen }) => {
  const { changeEffectVolume, effectVolume, changeMusicVolume, musicVolume } =
    useSound();

  // États pour stocker le volume par défaut avant mute
  const [savedMusicVolume, setSavedMusicVolume] = useState(musicVolume || 1);
  const [savedEffectVolume, setSavedEffectVolume] = useState(effectVolume || 1);

  // Fonction pour basculer le volume musique
  const toggleMusic = () => {
    if (musicVolume > 0) {
      setSavedMusicVolume(musicVolume); // Sauvegarde du volume actuel
      changeMusicVolume(0); // Mute
    } else {
      changeMusicVolume(savedMusicVolume > 0 ? savedMusicVolume : 0.5); // Restaure le volume
    }
  };

  // Fonction pour basculer le volume des effets sonores
  const toggleEffect = () => {
    if (effectVolume > 0) {
      setSavedEffectVolume(effectVolume); // Sauvegarde du volume actuel
      changeEffectVolume(0); // Mute
    } else {
      changeEffectVolume(savedEffectVolume > 0 ? savedEffectVolume : 0.5); // Restaure le volume
    }
  };

  return (
    <div className={`short-menu ${isOpen && "show"}`}>
      <button onClick={toggleMusic}>
        <ImageLoader
          name={musicVolume > 0 ? "img_musicOn" : "img_musicOff"}
          alt="Musique"
        />
      </button>
      <button onClick={toggleEffect}>
        <ImageLoader
          name={effectVolume > 0 ? "img_soundOn" : "img_soundOff"}
          alt="Effets sonores"
        />
      </button>
    </div>
  );
};

export default ShortMenu;
