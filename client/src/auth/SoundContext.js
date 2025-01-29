import { Howl } from "howler";
import React, { createContext, useContext, useState } from "react";
import effectAccident from "../audio/accident.mp3";
import background1 from "../audio/background1.mp3";
import background2 from "../audio/background2.mp3";
import background3 from "../audio/background3.mp3";
import effectBonus from "../audio/bonus.wav";
import effectCard from "../audio/card.mp3";
import effectClose from "../audio/close.mp3";
import effectDrives from "../audio/drives.wav";
import effectGaz from "../audio/gaz.mp3";
import effectHorn from "../audio/horn.mp3";
import effectOpen from "../audio/open.mp3";
import effectPilote from "../audio/pilote.wav";
import effectPolice from "../audio/police.wav";
import effectSpecial from "../audio/special.mp3";
import effectStart from "../audio/start.mp3";
import effectTalkie from "../audio/talkie.mp3";
import effectTrash from "../audio/trash.mp3";
import effectYawn from "../audio/yawn.mp3";

// Créer le contexte
const SoundContext = createContext();

// Liste des musiques et effets sonores
const MusicList = {
  bghome: background1,
  bgparty: background2,
  bgintense: background3,
};

const EffectsList = {
  bonus: effectBonus,
  card: effectCard,
  close: effectClose,
  drives: effectDrives,
  gaz: effectGaz,
  horn: effectHorn,
  open: effectOpen,
  pilote: effectPilote,
  police: effectPolice,
  special: effectSpecial,
  start: effectStart,
  talkie: effectTalkie,
  trash: effectTrash,
  yawn: effectYawn,
  accident: effectAccident,
};

// Fournisseur du contexte
export const SoundProvider = ({ children }) => {
  const [currentMusic, setCurrentMusic] = useState(null); // Instance de Howl pour la musique
  const [currentMusicName, setCurrentMusicName] = useState(null); // Nom de la musique
  const [musicVolume, setMusicVolume] = useState(() => {
    const savedVolume = localStorage.getItem("pitfalls-music-volume");
    return savedVolume !== null ? Number(savedVolume) : 0.2; // Si la valeur existe, la convertir, sinon 0.5
  });
  const [effectVolume, setEffectVolume] = useState(() => {
    const savedVolume = localStorage.getItem("pitfalls-effects-volume");
    return savedVolume !== null ? Number(savedVolume) : 0.8; // Si la valeur existe, la convertir, sinon 0.5
  });
  /**
   * Joue une musique.
   * @param {string} musicName - Nom de la musique dans MusicList.
   */
  const playMusic = (musicName) => {
    if (!MusicList[musicName]) {
      console.error(`Musique "${musicName}" non trouvée.`);
      return;
    }

    // Arrête la musique actuelle
    if (currentMusic) {
      currentMusic.stop();
    }

    // Crée une nouvelle instance Howl et joue la musique
    const newMusic = new Howl({
      src: [MusicList[musicName]],
      loop: true,
      volume: musicVolume,
    });

    newMusic.play();
    setCurrentMusic(newMusic);
    setCurrentMusicName(musicName);
  };

  /**
   * Arrête la musique en cours.
   */
  const stopMusic = () => {
    if (currentMusic) {
      currentMusic.stop();
      setCurrentMusic(null);
      setCurrentMusicName(null);
    }
  };

  /**
   * Modifie le volume de la musique.
   * @param {number} volume - Nouvelle valeur de volume (entre 0 et 1).
   */
  const changeMusicVolume = (volume) => {
    const clampedVolume = Math.min(Math.max(volume, 0), 1);
    localStorage.setItem("pitfalls-music-volume", clampedVolume);
    setMusicVolume(clampedVolume);
    if (currentMusic) {
      currentMusic.volume(clampedVolume);
    }
  };

  /**
   * Joue un effet sonore.
   * @param {string} effectName - Nom de l'effet sonore dans EffectsList.
   */
  const playEffect = (effectName) => {
    if (!EffectsList[effectName]) {
      console.error(`Effet sonore "${effectName}" non trouvé.`);
      return;
    }

    // Crée une instance Howl et joue l'effet sonore
    const effect = new Howl({
      src: [EffectsList[effectName]],
      volume: effectVolume,
    });

    effect.play();
  };

  /**
   * Modifie le volume des effets sonores.
   * @param {number} volume - Nouvelle valeur de volume (entre 0 et 1).
   */
  const changeEffectVolume = (volume) => {
    const clampedVolume = Math.min(Math.max(volume, 0), 1);
    localStorage.setItem("pitfalls-effects-volume", clampedVolume);
    setEffectVolume(clampedVolume);
  };

  return (
    <SoundContext.Provider
      value={{
        playMusic,
        stopMusic,
        changeMusicVolume,
        playEffect,
        changeEffectVolume,
        currentMusicName,
        musicVolume,
        effectVolume,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

// Hook personnalisé pour utiliser le SoundContext
export const useSound = () => useContext(SoundContext);
