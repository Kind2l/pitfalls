import React, { useEffect, useState } from "react";
import ImageLoader from "../ImageLoader";

const CountStart = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [count, setCount] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [shouldDestroy, setShouldDestroy] = useState(false);

  // Effet pour gérer l'affichage du logo
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setShowLogo(false);
        setOpacity(1);
      }, 500);
    }, 1500);

    return () => clearTimeout(logoTimer);
  }, []);

  // Effet pour gérer le compte à rebours
  useEffect(() => {
    if (showLogo || count < 0) return;

    const countdownTimer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount === 0) {
          setTimeout(() => {
            setShouldDestroy(true);
          }, 100);
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [count, showLogo]);

  // Si le composant doit être détruit, retourne null
  if (shouldDestroy) {
    return null;
  }

  // Rendu du composant
  return (
    <div className="count-start">
      {showLogo ? (
        <LogoDisplay opacity={opacity} />
      ) : (
        <CountdownDisplay count={count} />
      )}
    </div>
  );
};

// Composant pour afficher le logo
const LogoDisplay = ({ opacity }) => (
  <div
    className="logo"
    style={{
      opacity: opacity,
      transition: "opacity 0.5s ease-out",
    }}
  >
    <ImageLoader name="logo" />
  </div>
);

// Composant pour afficher le compte à rebours
const CountdownDisplay = ({ count }) => (
  <div
    className={`message cherry-font ${
      count === 3
        ? "color-white"
        : count === 2
        ? "color-orange"
        : count === 1
        ? "color-red"
        : "color-green"
    }`}
  >
    {count > 0 ? count : "Go !"}
  </div>
);

export default CountStart;
