import ImageLoader from "@Components/ImageLoader";
import React from "react";

const AttackModal = ({
  showAttackPopup,
  selectedCard,
  attackablePlayers,
  setAttackedPlayer,
  setSelectedCard,
  setAttackablePlayers,
  setShowAttackPopup,
  setNotification,
  setShowActionPopup,
  gameIsOver,
}) => {
  const handleCancel = () => {
    if (!gameIsOver) {
      setSelectedCard(null);
      setAttackedPlayer(null);
      setAttackablePlayers(null);
      setShowAttackPopup(false);
      setNotification(null);
      setShowActionPopup(false);
    }
  };

  return (
    <div className={`attack-modal ${showAttackPopup ? "show" : ""}`}>
      <span></span>
      <div className="attack-modal__title color-red">
        <h3>Qui voulez-vous attaquer ?</h3>
      </div>

      <div className="attack-modal__image">
        {showAttackPopup && selectedCard && (
          <ImageLoader
            name={`cards/${selectedCard.tag}`}
            alt={selectedCard.name}
          />
        )}
      </div>

      <div className="attack-modal__players">
        {showAttackPopup &&
          attackablePlayers?.map((player) => (
            <button
              key={player.id}
              className={`primary-button ${
                ["bg-blue", "bg-red", "bg-green", "bg-orange"][
                  player.position - 1
                ] || ""
              }`}
              onClick={() => !gameIsOver && setAttackedPlayer(player.id)}
            >
              {player.username}
            </button>
          ))}
      </div>

      <div className="action-modal__buttons">
        <button className="primary-button bg-black" onClick={handleCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default AttackModal;
