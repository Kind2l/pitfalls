import React from "react";

const Orbit = ({ players }) => {
  if (!players) {
    return <div>No players data available</div>;
  }

  const playerKeys = Object.keys(players);

  return (
    <div className="orbit">
      <div className="planet"></div>
      {playerKeys.map((key, index) => {
        const player = players[key];
        const score = player.score;
        const rotation = 50 + (score / 1000) * 85; // Convertir le score en angle de rotation
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
                <img
                  src={`../images/cars/car${player.position}.svg`}
                  alt="Voiture des joueurs"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Orbit;
