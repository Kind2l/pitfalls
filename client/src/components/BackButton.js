import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // -1 pour revenir à la page précédente
  };

  return (
    <button onClick={handleBack} className="back-button primary-button black">
      Retour
    </button>
  );
};

export default BackButton;
