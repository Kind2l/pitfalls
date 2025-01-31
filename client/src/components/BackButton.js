import { useSound } from "@Context/SoundContext";
import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const { playEffect } = useSound();
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault();
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
