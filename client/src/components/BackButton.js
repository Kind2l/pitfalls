import React from "react";
import { useNavigate } from "react-router-dom";
import { useSound } from "../components/SoundContext";

const BackButton = () => {
  const { playEffect } = useSound();
  const navigate = useNavigate();

  const handleBack = () => {
    playEffect("close");
    navigate(-1); // -1 pour revenir à la page précédente
  };

  return (
    <button
      onClick={handleBack}
      className="back-button primary-button bg-black"
    >
      Retour
    </button>
  );
};

export default BackButton;
