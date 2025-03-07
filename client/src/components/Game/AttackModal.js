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
  isWaiting,
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
      <div className="attack-modal__title color-red">
        <h3>Attaquer un joueur ?</h3>
      </div>

      <div className="attack-modal__image">
        {showAttackPopup && selectedCard && (
          <>
            <ImageLoader
              name={`cards/${selectedCard.tag}`}
              alt={selectedCard.name}
            />
            <div className="action-modal__image--title">
              {selectedCard.name}
            </div>
          </>
        )}
      </div>

      <div className="attack-modal__buttons">
        {showAttackPopup &&
          attackablePlayers?.map((player) => (
            <button
              key={player.id}
              className={`btn ${
                ["bg-blue", "bg-red", "bg-green", "bg-orange"][
                  player.position - 1
                ] || ""
              }`}
              onClick={() =>
                !gameIsOver & !isWaiting && setAttackedPlayer(player.id)
              }
            >
              {player.username}
            </button>
          ))}
      </div>

      <div className="action-modal__buttons">
        <button className="btn bg-black" onClick={handleCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default AttackModal;
