import { useSound } from "@Context/SoundContext";
import "@Styles/Board/ShortMenu.scss";
import React, { useState } from "react";

const ShortMenu = ({
  isOpen,
  serverInfosIsOpen,
  setServerInfosIsOpen,
  handleLeave,
}) => {
  const { changeEffectVolume, effectVolume, changeMusicVolume, musicVolume } =
    useSound();

  const [savedMusicVolume, setSavedMusicVolume] = useState(musicVolume || 1);
  const [savedEffectVolume, setSavedEffectVolume] = useState(effectVolume || 1);

  const toggleInfos = () => {
    setServerInfosIsOpen(!serverInfosIsOpen);
  };

  const toggleMusic = () => {
    if (musicVolume > 0) {
      setSavedMusicVolume(musicVolume);
      changeMusicVolume(0);
    } else {
      changeMusicVolume(savedMusicVolume > 0 ? savedMusicVolume : 0.5);
    }
  };

  const toggleEffect = () => {
    if (effectVolume > 0) {
      setSavedEffectVolume(effectVolume);
      changeEffectVolume(0);
    } else {
      changeEffectVolume(savedEffectVolume > 0 ? savedEffectVolume : 0.5);
    }
  };

  return (
    <div className={`short-menu ${isOpen && "show"}`}>
      <button onClick={toggleInfos}>
        <i className="fa-solid fa-question color-blue"></i>
      </button>
      <button onClick={toggleMusic}>
        <i
          className={`fa-solid fa-music ${musicVolume > 0 ? "on" : "off"}`}
        ></i>
      </button>
      <button onClick={toggleEffect}>
        <i
          className={`fa-solid fa-volume-high ${
            effectVolume > 0 ? "on" : "off"
          }`}
        ></i>
      </button>
      <button onClick={handleLeave} className="leave">
        <i className="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>
  );
};

export default ShortMenu;
