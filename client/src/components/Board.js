import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const Board = () => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();

  const [hand, setHand] = useState([]);
  const [playerEnvironment, setPlayerEnvironment] = useState(null);
  const [players, setPlayers] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [position, setPosition] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(null);
  const [deckCount, setDeckCount] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationIsVisible, setNotificationIsVisible] = useState(false);
  const [attackablePlayers, setAttackablePlayers] = useState(null);
  const [showAttackPopup, setShowAttackPopup] = useState(false);
  const [attackedPlayer, setAttackedPlayer] = useState(null);

  function CardStack({ numberOfCards }) {
    return <div className="card-stack">Cartes restantes : {numberOfCards}</div>;
  }

  useEffect(() => {
    socket.emit("server:find", { serverId }, (response) => {
      if (response.success) {
        let playerData = response.data.players[user.id];
        setCurrentPlayer(response.data.currentPlayer);
        setHand(playerData.hand);
        setPlayerEnvironment(playerData);
        setPosition(playerData.position);
        setPlayers(response.data.players);
        setDeckCount(response.data.deck.length);
      } else {
        console.error("Erreur lors de la récupération du serveur :", response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("game:next-round", () => {
      socket.emit("server:find", { serverId }, (response) => {
        if (response.success) {
          let playerData = response.data.players[user.id];
          setCurrentPlayer(response.data.currentPlayer);
          setHand(playerData.hand);
          setPlayerEnvironment(playerData);
          setPosition(playerData.position);
          setPlayers(response.data.players);
          setDeckCount(response.data.deck.length);
          setSelectedCard(null);
          setNotification(null);
          setAttackablePlayers(null);
          setAttackedPlayer(null);
        } else {
          console.error(
            "Erreur lors de la récupération du serveur :",
            response
          );
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    socket.emit(
      "game:player-action",
      { serverId, card: selectedCard, attackedPlayerId: attackedPlayer, user },
      (response) => {
        if (response.success) {
          if (response.data.actionState === false) {
            setNotification({ title: "Erreur", content: response.message });
            console.error(response.message);
          }
          console.log(response.message);
        } else {
          setNotification({
            title: "Erreur serveur",
            content: response.message,
          });
          console.error(response.message);
        }

        setSelectedCard(null);
        setAttackedPlayer(null);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attackedPlayer, setAttackedPlayer]);

  useEffect(() => {
    if (Number(position) === Number(currentPlayer)) {
      setIsMyTurn(true);
    } else {
      setIsMyTurn(false);
    }
  }, [currentPlayer, position]);

  useEffect(() => {
    if (notification) {
      setNotificationIsVisible(true);

      // Masquer la notification après 3 secondes
      const timerAppear = setTimeout(() => {
        setNotificationIsVisible(false);
      }, 3000);

      // Supprimer la notification après 4 secondes
      const timerData = setTimeout(() => {
        setNotification(null);
      }, 4000);

      return () => {
        clearTimeout(timerAppear);
        clearTimeout(timerData);
      };
    }
  }, [notification, setNotification]);

  useEffect(() => {
    if (selectedCard) {
      setShowActionPopup(true);
    } else {
      setShowActionPopup(false);
    }
  }, [selectedCard, setShowActionPopup]);

  useEffect(() => {
    if (attackablePlayers) {
      setShowAttackPopup(true);
    } else {
      setShowAttackPopup(false);
    }
  }, [attackablePlayers, setAttackablePlayers]);

  function PlayerHeaderStates(states) {
    const labels = {
      feurouge: "Feu rouge",
      limitedevitesse: "Limite de vitesse",
      accident: "Accident",
      crevaison: "Crevaison",
      pannedessence: "Panne d'essence",
    };

    return (
      <div className="player-header__states">
        {Object.entries(states).map(([key, value]) => (
          <span
            key={key + value}
            className={`state-item ${value ? "active" : "inactive"}`}
          >
            {labels[key]}
          </span>
        ))}
      </div>
    );
  }
  function PlayerHeaderBonus(bonus) {
    const labels = {
      asduvolant: "As du volant",
      citerne: "Citerne",
      increvable: "Increvable",
      vehiculeprioritaire: "Véhicule prioritaire",
    };

    return (
      <div className="player-header__bonus">
        {Object.entries(bonus).map(([key, value]) => (
          <span
            key={key + value}
            className={`bonus-item ${value ? "active" : "inactive"}`}
          >
            {labels[key]}
          </span>
        ))}
      </div>
    );
  }

  function PlayerHeaderName(username) {
    return <span className="player-header__name">{username}</span>;
  }
  function PlayerHeaderScore(score) {
    return <span className="player-header__score">{score} Km</span>;
  }

  const handleClickCard = (card) => {
    if (!isMyTurn) {
      return;
    }
    setSelectedCard(card);
  };

  const handleUseCard = () => {
    if (selectedCard) {
      socket.emit(
        "game:player-action",
        { serverId, card: selectedCard, user },
        (response) => {
          if (response.success) {
            if (response.data.actionState === false) {
              setNotification({ title: "Erreur", content: response.message });
              setSelectedCard(null);
              return console.error(response.message);
            }

            if (selectedCard.type === "attaque") {
              setAttackablePlayers(response.data.attackablePlayers);
              return;
            }
            return console.log(response.message);
          } else {
            return console.error(
              "Erreur lors de la récupération du serveur :",
              response
            );
          }
        }
      );
    }
  };
  const handleRemoveCard = () => {
    if (selectedCard) {
      socket.emit(
        "game:player-remove-card",
        { serverId, card: selectedCard, user },
        (response) => {
          if (response.success) {
            console.log("Success");
          } else {
            return console.error(
              "Erreur lors de la récupération du serveur :",
              response
            );
          }
        }
      );
    }
  };

  return (
    <div id="game-board">
      <header className="game-header">
        {players &&
          Object.values(players).map((player) => {
            return (
              <div
                className="player-header"
                data-order={player.position}
                key={player.username + player.id}
              >
                {PlayerHeaderName(player.username)}
                {PlayerHeaderScore(player.score)}
                {PlayerHeaderStates(player.states)}
                {PlayerHeaderBonus(player.bonus)}
              </div>
            );
          })}
      </header>
      <section className="game-area">
        {<CardStack numberOfCards={deckCount} />}
      </section>
      <section className="player-area">
        <div className="cards">
          {hand.length > 0 ? (
            hand.map((card) => (
              <button
                key={card.id}
                data-id={card.id}
                className="card"
                disabled={!isMyTurn}
                onClick={() => handleClickCard(card)}
              >
                <span>{card.name}</span>
              </button>
            ))
          ) : (
            <p>Aucune carte dans la main</p>
          )}
        </div>
      </section>

      {showActionPopup && (
        <div className="action-modal">
          <span>Que voulez vous faire ?</span>
          <div className="action-modal__buttons">
            <button onClick={handleUseCard}>Utiliser</button>
            <button onClick={handleRemoveCard}>Jeter</button>
            <button onClick={() => setSelectedCard(null)}>Annuler</button>
          </div>
        </div>
      )}

      {showAttackPopup && (
        <div className="attack-modal">
          <span>Qui voulez-vous attaquer ?</span>

          {attackablePlayers?.map((player, key) => (
            <button
              key={key}
              onClick={() => {
                setAttackedPlayer(player.id);
              }}
            >
              {player.username}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedCard(null);
              setAttackedPlayer(null);
              setAttackablePlayers(null);
              setShowAttackPopup(false);
            }}
          >
            Annuler
          </button>
        </div>
      )}
      {notification && (
        <div
          className={`notification-popup ${
            notificationIsVisible ? "visible" : ""
          }`}
        >
          {notification?.title && (
            <span className="notification-popup__title">
              {notification.title}
            </span>
          )}
          {notification?.content && (
            <span className="notification-popup__content">
              {notification.content}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Board;
