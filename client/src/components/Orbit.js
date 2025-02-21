import ImageLoader from "@Components/ImageLoader";
import "@Styles/Board/Orbit.scss";
import React from "react";

const Orbit = ({ players, maxScore = 1000 }) => {
  if (!players) {
    return <div>Aucune donnée disponible pour l'orbite</div>;
  }

  const playerKeys = Object.keys(players);

  return (
    <div className="orbit">
      <div className="planet">
        <ImageLoader name="planet3" alt="Planète" />
      </div>
      <div className="planet front">
        <ImageLoader name="planet-front" alt="Planète" />
      </div>
      <div className="planet back">
        <ImageLoader name="planet-back" alt="Planète" />
      </div>
      <div className="arrival">
        <ImageLoader name="arrival" alt="Hotel d'arrivée" />
      </div>
      {playerKeys.map((key, index) => {
        const player = players[key];
        const score = player.score;
        const rotation = -30 + (score / maxScore) * 60;
        return (
          <div
            key={player.id}
            className={`car-orbit player${player.position}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            }}
          >
            <div className={`car player${player.position}`}>
              <div className="car__name">{player.username}</div>
              <div className="car__image">
                <ImageLoader name={`cars/car_${player.position}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Orbit;
