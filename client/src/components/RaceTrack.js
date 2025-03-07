import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";
import "@Styles/Board/RaceTrack.scss";
import React, { useEffect, useState } from "react";

const RaceTrack = ({ players, serverInfos }) => {
  const [player, setPlayer] = useState(null);
  const [maxScore, setMaxScore] = useState(1000);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.username && players) {
      setPlayer(players[user.username]);
      console.log("player : ", players[user.username]);
    }
  }, [players, setPlayer]);

  useEffect(() => {
    if (user?.username && players) {
      setMaxScore(serverInfos.requiredScore);
      console.log("player : ", players[user.username]);
    }
  }, [serverInfos]);

  const playerSpeed = (states) => {
    if (
      ["accident", "embouteillage", "fatigue", "feurouge"].some(
        (state) => states[state].value
      )
    ) {
      return "stop";
    }
    if (states.zonedecontrole.value) {
      return "slow";
    }
    return "fast";
  };

  return (
    <div className="race-track">
      <>
        {player ? (
          <>
            <div
              key={player.id}
              className={`road ${playerSpeed(player.states)} player${
                player.position
              }`}
            ></div>
            <div className="car-line">
              <div
                className={`car player${player.position}`}
                style={{
                  left: `${10 + (player?.score / maxScore) * 80}%`,
                }}
              >
                <div className="car__name cherry-font">{player.username}</div>
                <div className="car__image">
                  <ImageLoader name={`cars/car_${player.position}`} />
                </div>
                {Object.entries(player.states).map(([key, obj]) =>
                  obj.value ? (
                    key === "fatigue" ? (
                      <div key={key} className={`car__malus ${key}`}>
                        <span className="cherry-font">
                          <i className="fa-solid fa-bolt"></i>
                        </span>
                      </div>
                    ) : key === "zonedecontrole" ? (
                      <div key={key} className={`car__malus ${key}`}>
                        <span>50</span>
                      </div>
                    ) : key === "embouteillage" ? (
                      <div key={key} className={`car__malus ${key}`}>
                        <ImageLoader name={`effects/${key}`} />
                        <ImageLoader name={`effects/${key}`} />
                        <ImageLoader name={`effects/${key}`} />
                      </div>
                    ) : (
                      <div key={key} className={`car__malus ${key}`}>
                        <ImageLoader name={`effects/${key}`} />
                      </div>
                    )
                  ) : null
                )}
              </div>
            </div>
          </>
        ) : (
          <div>Aucune donnée sur le joueur</div>
        )}
      </>
      {player && (
        <>
          <div
            className={`back-decoration bush1 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/bush1`} />
          </div>
          <div
            className={`back-decoration bush2 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/bush2`} />
          </div>

          <div
            className={`front-decoration light ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/light`} />
          </div>
          <div
            className={`front-decoration bush1 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/bush1`} />
          </div>
          <div
            className={`front-decoration bush2 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/bush2`} />
          </div>
          <div
            className={`front-decoration bush3 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/bush3`} />
          </div>
          <div
            className={`front-decoration grass1 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/grass1`} />
          </div>
          <div
            className={`front-decoration grass2 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/grass2`} />
          </div>
          <div
            className={`front-decoration grass3 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/grass3`} />
          </div>
          <div
            className={`front-decoration grass4 ${playerSpeed(player?.states)}`}
          >
            <ImageLoader name={`decorations/grass4`} />
          </div>
        </>
      )}
    </div>
  );
};

export default RaceTrack;
