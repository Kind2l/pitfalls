import { Howl } from "howler";
import React, { createContext, useContext, useState } from "react";
import Background1 from "../audio/background1.mp3";
import Background2 from "../audio/background2.mp3";
import effectClose from "../audio/close.mp3";
import effectOpen from "../audio/open.mp3";

// Créer un contexte pour gérer les sons
const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [backgroundTrack, setBackgroundTrack] = useState(null);

  const [bgVolume, setBgVolume] = useState(() => {
    const savedVolume = localStorage.getItem("bgVolume");
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const [effectVolume, setEffectVolume] = useState(() => {
    const savedEffectVolume = localStorage.getItem("effectVolume");
    return savedEffectVolume ? parseFloat(savedEffectVolume) : 0.5;
  });

  // Liste des musiques de fond
  const backgroundTracks = [Background1, Background2];

  // Liste des effets sonores
  const soundEffects = {
    open: effectOpen,
    close: effectClose,
  };

  // Fonction pour jouer une musique de fond
  const playBackgroundMusic = (trackIndex) => {
    if (trackIndex === backgroundTrack) {
      console.log(
        `La musique ${backgroundTracks[trackIndex]} est déjà en cours.`
      );
      return;
    }

    if (backgroundMusic) {
      backgroundMusic.stop();
    }

    if (!backgroundTracks[trackIndex]) {
      console.error(`Musique introuvable pour l'index : ${trackIndex}`);
      return;
    }

    console.log(`Démarrage de la musique : ${backgroundTracks[trackIndex]}`);

    const music = new Howl({
      src: [backgroundTracks[trackIndex]],
      loop: true,
      volume: 1,
    });

    music.play();
    setBackgroundMusic(music);
    setBackgroundTrack(trackIndex);
  };
  // Fonction pour arrêter la musique de fond
  const stopBackgroundMusic = (trackIndex) => {
    if (backgroundMusic) {
      backgroundMusic.stop();
    }
    setBackgroundMusic(null);
  };

  // Fonction pour modifier le volume de la musique de fond
  const setBackgroundMusicVolume = (volume) => {
    setBgVolume(volume);
    if (backgroundMusic) {
      backgroundMusic.volume(volume);
    }
    localStorage.setItem("bgVolume", volume);
  };

  // Fonction pour jouer un effet sonore
  const playEffect = (effectName) => {
    if (!soundEffects[effectName]) {
      console.error(`Effet sonore "${effectName}" non trouvé.`);
      return;
    }

    const effect = new Howl({
      src: [soundEffects[effectName]],
      volume: effectVolume,
    });

    effect.play();
  };

  // Fonction pour modifier le volume des effets sonores
  const setEffectVolumeLevel = (volume) => {
    setEffectVolume(volume);
    localStorage.setItem("effectVolume", volume); // Enregistrer dans le localStorage
  };

  // Fournir les fonctions et variables au contexte
  return (
    <SoundContext.Provider
      value={{
        bgVolume,
        effectVolume,
        playBackgroundMusic,
        stopBackgroundMusic,
        setBackgroundMusicVolume,
        setEffectVolumeLevel,
        playEffect,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte
export const useSound = () => useContext(SoundContext);
