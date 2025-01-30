import { useSound } from "@Auth/SoundContext";
import ImageLoader from "@Components/ImageLoader";

import { useEffect } from "react";

const PlayerAttackNotification = ({
  attackNotification,
  attackNotificationIsVisible,
}) => {
  const { playEffect } = useSound();

  useEffect(() => {
    if (!attackNotification) return;

    // Jouer le son correspondant à la carte
    const soundEffects = {
      accident: "crash",
      zonedecontrole: "police",
      embouteillage: "horn",
      fatigue: "yawn",
    };

    const effect = soundEffects[attackNotification?.card.tag];
    if (effect) playEffect(effect);
  }, [attackNotification, playEffect]); // Exécute l'effet seulement quand attackNotification change

  if (!attackNotification) return null;

  return (
    <div
      className={`player-attack-notification ${
        attackNotificationIsVisible ? "show" : ""
      }`}
    >
      <div className="player-attack-notification__title">Attaque</div>
      <div className="player-attack-notification__content">
        <div className="player-attack-notification__image">
          <ImageLoader
            name={`card_${attackNotification.card.tag}`}
            alt={`${attackNotification.player.username} attaque ${attackNotification.attackedPlayer.username} avec ${attackNotification.card.name}`}
          />
        </div>
        <div className="player-attack-notification__message">
          <span>{attackNotification.player.username}</span> attaque{" "}
          <span>{attackNotification.attackedPlayer.username}</span>
        </div>
        <div className="player-attack-notification__action">
          {attackNotification.card.name}
        </div>
      </div>
    </div>
  );
};

export default PlayerAttackNotification;
