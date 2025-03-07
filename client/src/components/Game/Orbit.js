import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";

import "@Styles/Board/Orbit.scss";
import React, { useEffect, useState } from "react";

const Orbit = ({ players, serverInfos }) => {
  const { user } = useAuth();
  const [maxScore, setMaxScore] = useState(1000);
  const [hotelRight, setHotelRight] = useState("-100%");

  useEffect(() => {
    if (serverInfos?.requiredScore) {
      setMaxScore(serverInfos.requiredScore);
    }
  }, [serverInfos]);

  useEffect(() => {
    if (players) {
      const highestScore = Math.max(
        ...Object.values(players).map((player) => player.score),
        0
      );
      const hotelPosition = -100 + (highestScore / maxScore) * 100;
      setHotelRight(`${hotelPosition}%`);
    }
  }, [players, maxScore]);

  if (!players) {
    return <div>Aucune donnée disponible pour l'orbite</div>;
  }

  const playerKeys = Object.keys(players);

  return (
    <div className="orbit">
      <div className="planet">
        <ImageLoader name="planet4" alt="Planète" />
      </div>
      <div className="hotel" style={{ right: hotelRight }}>
        <ImageLoader name="hotel" alt="Hotel" />
      </div>

      {playerKeys.map((key) => {
        const player = players[key];
        if (player.username === user.username) return null;

        const score = player.score;

        // Ajustement pour que la rotation aille de -40° à 40°
        const rotation = -40 + (score / maxScore) * 80;

        return (
          <div
            key={player.id}
            className={`car-orbit player${player.position}`}
            style={{
              transform: `translateY(-50%) rotate(${rotation}deg)`,
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
