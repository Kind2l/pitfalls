import { useSound } from "@Auth/SoundContext";
import ImageLoader from "@Components/ImageLoader"; // Assurez-vous que ce composant est bien importé.
import React from "react";
// Assurez-vous que cette fonction est bien importée.

const PlayerActionModal = ({
  actionNotification,
  actionNotificationIsVisible,
}) => {
  const { playEffect } = useSound();

  return (
    <div
      className={`player-action-modal ${
        actionNotificationIsVisible && "show"
      } ${actionNotification?.type}`}
    >
      <div className="player-action-modal__content">
        <div className="player-action-modal__image">
          {actionNotification?.type === "borne" ? (
            <>{actionNotification?.card.value}</>
          ) : actionNotification?.type === "remove" ? (
            <>
              <ImageLoader name="img_trash" alt="Poubelle" />
            </>
          ) : (
            <>
              <ImageLoader
                name={`card_${actionNotification?.card.tag}`}
                alt={actionNotification?.card.name}
              />
            </>
          )}
        </div>
        <div className="player-action-modal__message">
          {actionNotification?.type === "borne" && (
            <>
              {playEffect("drives")}
              <span>{actionNotification?.player}</span> avance de{" "}
              <span>{actionNotification?.card.value} kms</span>.
            </>
          )}
          {actionNotification?.type === "parade" &&
            actionNotification?.card.tag === "findezonedecontrole" && (
              <>
                {playEffect("special")}
                Fin de <span>zone de radar</span> pour{" "}
                <span>{actionNotification?.player}</span>.
              </>
            )}
          {actionNotification?.type === "parade" &&
            actionNotification?.card.tag !== "findezonedecontrole" && (
              <>
                {playEffect("start")}
                <span>{actionNotification?.player}</span> reprend la route !
              </>
            )}
          {actionNotification?.type === "bonus" && (
            <>
              {actionNotification?.card.tag === "pilote"
                ? playEffect("pilote")
                : actionNotification?.card.tag === "cartedepolice"
                ? playEffect("talkie")
                : playEffect("bonus")}
              <span>{actionNotification?.player}</span> active son bonus{" "}
              <span>{actionNotification?.card.name} !</span>
            </>
          )}
          {actionNotification?.type === "remove" && (
            <>
              {playEffect("trash")}
              <span>{actionNotification?.player}</span> défausse une carte.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerActionModal;
