import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import { useSound } from "@Context/SoundContext";
import "@Styles/Settings.scss";
import React from "react";

const Settings = () => {
  const {
    changeMusicVolume,
    playEffect,
    changeEffectVolume,
    musicVolume,
    effectVolume,
  } = useSound();

  return (
    <>
      <Header />
      <div className="settings">
        <div className="settings-content">
          {/* Slider pour le volume de la musique */}
          <h2>Options</h2>
          <h3>Volume de la musique</h3>
          <div className="range-slider">
            <div>{musicVolume * 100}%</div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.10"
              value={musicVolume}
              onChange={(e) => {
                changeMusicVolume(parseFloat(e.target.value));
              }}
            />
          </div>

          {/* Slider pour le volume des effets */}
          <h3>Volume des effets</h3>
          <div className="range-slider">
            <div>{effectVolume * 100}%</div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.10"
              value={effectVolume}
              onChange={(e) => {
                changeEffectVolume(parseFloat(e.target.value));
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
