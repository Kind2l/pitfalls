import ImageLoader from "@Components/ImageLoader";
import { useSound } from "@Context/SoundContext";
import { useEffect } from "react";

const PlayerActionModal = ({
  actionNotification,
  actionNotificationIsVisible,
}) => {
  const { playEffect } = useSound();

  useEffect(() => {
    if (actionNotificationIsVisible && actionNotification) {
      switch (actionNotification.type) {
        case "borne":
          playEffect("drives");
          break;
        case "parade":
          playEffect(
            actionNotification.card?.tag === "findezonedecontrole"
              ? "special"
              : "start"
          );
          break;
        case "bonus":
          playEffect(
            actionNotification.card?.tag === "pilote"
              ? "pilote"
              : actionNotification.card?.tag === "cartedepolice"
              ? "talkie"
              : "bonus"
          );
          break;
        case "remove":
          playEffect("trash");
          break;
        default:
          break;
      }
    }
  }, [actionNotificationIsVisible, actionNotification, playEffect]);

  return (
    <div
      className={`player-action-modal ${
        actionNotificationIsVisible && "show " + actionNotification?.type
      }`}
    >
      <div className="player-action-modal__content">
        <div className="player-action-modal__image">
          {actionNotification?.type === "borne" ? (
            <>{actionNotification?.card?.value}</>
          ) : actionNotification?.type === "remove" ? (
            <ImageLoader name="img_trash" alt="Poubelle" />
          ) : actionNotification?.card ? ( // Vérification de l'existence de card
            <ImageLoader
              name={`card_${actionNotification.card.tag}`}
              alt={actionNotification.card.name}
            />
          ) : null}
        </div>
        <div className="player-action-modal__message">
          {actionNotification?.type === "borne" && (
            <>
              <span className="cherry-font">{actionNotification?.player}</span>{" "}
              avance de <span>{actionNotification?.card?.value} kms</span>.
            </>
          )}
          {actionNotification?.type === "parade" &&
            actionNotification?.card?.tag === "findezonedecontrole" && (
              <>
                Fin de <span>zone de radar</span> pour{" "}
                <span>{actionNotification?.player}</span>.
              </>
            )}
          {actionNotification?.type === "parade" &&
            actionNotification?.card?.tag !== "findezonedecontrole" && (
              <>
                <span>{actionNotification?.player}</span> reprend la route !
              </>
            )}
          {actionNotification?.type === "bonus" && (
            <>
              <span>{actionNotification?.player}</span> active son bonus{" "}
              <span>{actionNotification?.card?.name} !</span>
            </>
          )}
          {actionNotification?.type === "remove" && (
            <>
              <span className="cherry-font">{actionNotification?.player}</span>{" "}
              défausse une carte.
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerActionModal;
