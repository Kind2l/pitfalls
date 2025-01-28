import { useSound } from "@Auth/SoundContext";
import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import "@Styles/Settings.scss";
import React, { useState } from "react";

const Settings = () => {
  const {
    changeMusicVolume,
    playEffect,
    changeEffectVolume,
    musicVolume,
    effectVolume,
  } = useSound();

  // État pour gérer la position de la bulle
  const [musicBubblePosition, setMusicBubblePosition] = useState(() => {
    return ((musicVolume - 0) / (1 - 0)) * 100; // Convertir en pourcentage
  });

  const [effectBubblePosition, setEffectBubblePosition] = useState(() => {
    return ((effectVolume - 0) / (1 - 0)) * 100; // Convertir en pourcentage
  });

  /**
   * Met à jour la position de la bulle en fonction de l'input.
   * @param {Event} e - Événement de l'input
   * @param {Function} setPosition - Setter pour mettre à jour la position
   */
  const updateBubblePosition = (e, setPosition) => {
    const input = e.target;
    const value = parseFloat(input.value);

    // Calcul de la position en pourcentage
    const percent = ((value - input.min) / (input.max - input.min)) * 100;

    // Met à jour la position
    setPosition(percent);
  };

  return (
    <>
      <Header />
      <div className="settings">
        <div className="settings-content">
          {/* Slider pour le volume de la musique */}
          <h2>Options</h2>
          <h3>Volume de la musique</h3>
          <div className="range-slider">
            <span
              className="slider-bubble"
              style={{ left: `${musicBubblePosition}%` }}
            >
              {Math.round(musicVolume * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.10"
              value={musicVolume}
              onChange={(e) => {
                changeMusicVolume(parseFloat(e.target.value));
                updateBubblePosition(e, setMusicBubblePosition);
              }}
            />
          </div>

          {/* Slider pour le volume des effets */}
          <h3>Volume des effets</h3>
          <div className="range-slider">
            <span
              className="slider-bubble"
              style={{ left: `${effectBubblePosition}%` }}
            >
              {Math.round(effectVolume * 100)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.10"
              value={effectVolume}
              onChange={(e) => {
                changeEffectVolume(parseFloat(e.target.value));
                updateBubblePosition(e, setEffectBubblePosition);
              }}
            />
          </div>

          <div className="buttons">
            <BackButton />
            <button
              className="primary-button bg-orange"
              onClick={() => playEffect("open")}
            >
              Jouer un effet
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
