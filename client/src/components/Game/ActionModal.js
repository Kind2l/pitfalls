import ImageLoader from "@Components/ImageLoader";
import React from "react";

const ActionModal = ({
  showActionPopup,
  selectedCard,
  handleUseCard,
  handleRemoveCard,
  setSelectedCard,
}) => {
  return (
    <div className={`action-modal ${showActionPopup ? "show" : ""}`}>
      <div className="action-modal__title">
        <h3>Choisissez une action</h3>
      </div>

      <div className="action-modal__image">
        {showActionPopup &&
          selectedCard &&
          (selectedCard.type === "borne" ? (
            <>
              <div className="borne">{selectedCard.value}</div>
              <div className="action-modal__image--title">
                {`Ajouter ${selectedCard.value} kms`}
              </div>
            </>
          ) : (
            <>
              <ImageLoader
                name={`cards/${selectedCard.tag}`}
                alt={selectedCard.name}
              />
              <div className="action-modal__image--title">
                {selectedCard.name}
              </div>
            </>
          ))}
      </div>

      <div className="action-modal__buttons">
        <button className="btn bg-green" onClick={handleUseCard}>
          Utiliser
        </button>
        <button className="btn bg-red" onClick={handleRemoveCard}>
          Jeter
        </button>
        <button className="btn bg-black" onClick={() => setSelectedCard(null)}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default ActionModal;
