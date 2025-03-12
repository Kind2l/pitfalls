import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";
import "@Styles/Board/PlayerDashboard.scss";
import React, { useEffect, useState } from "react";

const PlayerDashboard = ({
  isMyTurn,
  players,
  hand,
  isWaiting,
  serverInfos,
  handleClickCard,
}) => {
  const [player, setPlayer] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.username && players) {
      setPlayer(players[user.username]);
      console.log("player : ", players[user.username]);
    }
  }, [user?.username, players]); // Ajout de players comme dépendance

  function PlayerHeaderStates({ states, autoRemovePenality }) {
    const labels = {
      feurouge: "Feu rouge",
      zonedecontrole: "Zone de contrôle",
      accident: "Accident",
      fatigue: "Fatigué",
      pannedessence: "Panne d'essence",
    };

    return (
      <div className="states">
        {Object.entries(states).map(
          ([key, obj]) =>
            obj.value && (
              <span key={key} className="states-item">
                <ImageLoader name={`icons/${key}`} alt={labels[key]} />
                {autoRemovePenality && (
                  <span className="states-item_count">{obj.count}</span>
                )}
              </span>
            )
        )}
      </div>
    );
  }

  function PlayerHeaderBonus({ bonus }) {
    const labels = {
      pilote: "Pilote",
      deviation: "Déviation",
      infatigable: "Infatigable",
      cartedepolice: "Carte de police",
    };

    return (
      <div className="bonus">
        {Object.entries(bonus).map(([key, value]) =>
          value ? (
            <span key={key} className="bonus-item">
              <ImageLoader name={`icons/${key}`} alt={labels[key]} />
            </span>
          ) : null
        )}
      </div>
    );
  }

  function PlayerHeaderScore({ score = Number }) {
    return <div className="score cherry-font">{Number(score)}</div>;
  }

  return (
    <section className="player-dashboard">
      <div className={`player-dashboard__header player${player?.position}`}>
        {player ? (
          <>
            <PlayerHeaderStates
              states={player.states}
              autoRemovePenality={serverInfos?.autoRemovePenality}
            />
            <PlayerHeaderScore score={Number(player.score)} />
            <PlayerHeaderBonus bonus={player.bonus} />
          </>
        ) : (
          <>Aucune donnée sur le joueur</>
        )}
      </div>
      <div className="player-dashboard__hand">
        {hand.map((card, index) => {
          const { name, tag, id, type } = card;

          return (
            <button
              key={id}
              data-id={id}
              data-type={type}
              className={`card card-${index}`}
              disabled={!isMyTurn & !isWaiting}
              onClick={() => !isWaiting && handleClickCard(card)}
            >
              <div className="card-top">{name}</div>
              <div className="card-image">
                {type === "borne" ? (
                  <div className={tag}>{tag}</div>
                ) : (
                  <ImageLoader name={`cards/${tag}`} alt={name} />
                )}
              </div>
              <div className="card-bottom">{name}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PlayerDashboard;
