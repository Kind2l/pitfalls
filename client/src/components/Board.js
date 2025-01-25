import { useAuth } from "@Auth/SocketContext";
import "@Styles/components/Board.scss";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  const [actionNotification, setActionNotification] = useState(null);
  const [actionNotificationIsVisible, setActionNotificationIsVisible] =
    useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationIsVisible, setNotificationIsVisible] = useState(false);
  const [attackNotification, setAttackNotification] = useState(null);
  const [attackNotificationIsVisible, setAttackNotificationIsVisible] =
    useState(false);
  const [attackablePlayers, setAttackablePlayers] = useState(null);
  const [showAttackPopup, setShowAttackPopup] = useState(false);
  const [attackedPlayer, setAttackedPlayer] = useState(null);
  const [gameIsOver, setGameIsOver] = useState(false);
  const [podium, setPodium] = useState(null);

  // Component to display the number of cards in the deck
  function CardStack({ numberOfCards }) {
    return (
      <div className="card-stack">
        <div
          className={`card-stack__count ${
            numberOfCards < 11
              ? "danger"
              : numberOfCards < 36
              ? "warning"
              : "good"
          } `}
        >
          {numberOfCards}
        </div>
      </div>
    );
  }

  // Fetch initial game data
  useEffect(() => {
    socket.emit("server:find", { user, server_id: serverId }, (response) => {
      if (response.success) {
        const playerData = response.data.players[user.username];
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

  // Fetch game data on next round
  useEffect(() => {
    socket.on("game:next-round", (response) => {
      if (response?.data?.type) {
        if (response?.data?.type === "attaque") {
          setAttackNotification(response.data);
        } else {
          setActionNotification(response.data);
        }
      }
      socket.emit("server:find", { user, server_id: serverId }, (response) => {
        if (response.success) {
          const playerData = response.data.players[user.username];
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

    socket.on("game:is-over", (data) => {
      setPlayers(data.players);
      setGameIsOver(true);
      setPodium(data.podium);
    });

    socket.on("server:update", (data) => {
      const playerData = data?.players[user.username];
      setCurrentPlayer(data?.currentPlayer);
      setHand(playerData?.hand);
      setPlayerEnvironment(playerData);
      setPosition(playerData?.position);
      setPlayers(data?.players);
      setDeckCount(data?.deck.length);
      setSelectedCard(null);
      setNotification(null);
      setAttackablePlayers(null);
      setAttackedPlayer(null);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Determine if it's the player's turn
  useEffect(() => {
    setIsMyTurn(Number(position) === Number(currentPlayer));
  }, [currentPlayer, position]);

  // Show notification for a short period
  useEffect(() => {
    if (notification) {
      setNotificationIsVisible(true);

      // Hide notification after 3 seconds
      let timerAppear = setTimeout(() => {
        setNotificationIsVisible(false);
      }, 1000);

      // Clear notification after 4 seconds
      let timerData = setTimeout(() => {
        setNotification(null);
      }, 2000);

      return () => {
        clearTimeout(timerAppear);
        clearTimeout(timerData);
      };
    }

    if (attackNotification) {
      setAttackNotificationIsVisible(true);

      // Hide notification after 3 seconds
      let timerAppear = setTimeout(() => {
        setAttackNotificationIsVisible(false);
      }, 1500);

      // Clear notification after 4 seconds
      let timerData = setTimeout(() => {
        setAttackNotification(null);
      }, 2000);

      return () => {
        clearTimeout(timerAppear);
        clearTimeout(timerData);
      };
    }
    if (actionNotification) {
      setActionNotificationIsVisible(true);

      // Hide notification after 3 seconds
      let timerAppear = setTimeout(() => {
        setActionNotificationIsVisible(false);
      }, 1500);

      // Clear notification after 4 seconds
      let timerData = setTimeout(() => {
        setActionNotification(null);
      }, 2000);

      return () => {
        clearTimeout(timerAppear);
        clearTimeout(timerData);
      };
    }
  }, [notification, attackNotification, actionNotification]);

  // Show action popup when a card is selected
  useEffect(() => {
    setShowActionPopup(!!selectedCard);
  }, [selectedCard]);

  // Show attack popup when there are attackable players
  useEffect(() => {
    if (attackablePlayers) {
      setShowAttackPopup(true);
    } else {
      setShowAttackPopup(false);
    }
  }, [attackablePlayers]);

  // Handle card usage when a player is attacked
  useEffect(() => {
    if (attackedPlayer) {
      handleUseCard();
    }
  }, [attackedPlayer]);

  // Component to display player states
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
        {Object.entries(states).map(([key, value]) =>
          value ? (
            <span key={key} className="state-item">
              <img src={`../images/icons/${key}.svg`} alt={labels[key]} />
            </span>
          ) : null
        )}
      </div>
    );
  }

  // Component to display player bonuses
  function PlayerHeaderBonus(bonus) {
    const labels = {
      asduvolant: "As du volant",
      citerne: "Citerne",
      increvable: "Increvable",
      vehiculeprioritaire: "Véhicule prioritaire",
    };

    return (
      <div className="player-header__bonus">
        {Object.entries(bonus).map(([key, value]) =>
          value ? (
            <span key={key} className="bonus-item">
              <img src={`../images/icons/${key}.svg`} alt={labels[key]} />
            </span>
          ) : null
        )}
      </div>
    );
  }

  // Component to display player name
  function PlayerHeaderName(username) {
    return <span className="player-header__name">{username}</span>;
  }

  // Component to display player score
  function PlayerHeaderScore(score) {
    return <span className="player-header__score">{score}</span>;
  }

  // Handle card click
  const handleClickCard = (card) => {
    if (!isMyTurn) {
      return;
    }
    setShowAttackPopup(false);
    setAttackablePlayers(null);
    setSelectedCard(card);
  };

  // Handle card usage
  const handleUseCard = () => {
    if (!gameIsOver) {
      if (selectedCard) {
        if (selectedCard.type === "attaque") {
          if (attackedPlayer) {
            socket.emit(
              "game:player-action",
              {
                server_id: serverId,
                card: selectedCard,
                attackedPlayerId: Number(attackedPlayer),
                user,
              },
              (response) => {
                if (response.success) {
                  if (!response.data.actionState) {
                    setNotification({
                      type: "error",
                      content: response.message,
                    });
                    console.error(response.message);
                  }
                } else {
                  setNotification({
                    type: "error",
                    content: response.message,
                  });
                  console.error(response.message);
                }

                setSelectedCard(null);
                setAttackedPlayer(null);
              }
            );
          } else {
            socket.emit(
              "game:player-action",
              {
                server_id: serverId,
                card: selectedCard,
                user,
              },
              (response) => {
                if (response.success) {
                  if (!response.data.actionState) {
                    setNotification({
                      type: "error",
                      content: response.message,
                    });
                  } else if (response.data.attackablePlayers.length > 0) {
                    setAttackablePlayers(response.data.attackablePlayers);
                    setShowAttackPopup(true);
                    setShowActionPopup(false);
                  } else {
                    setNotification({
                      type: "error",
                      content: "Aucun joueur attaquable.",
                    });
                    setAttackablePlayers(null);
                    setShowAttackPopup(false);
                    setShowActionPopup(false);
                    setAttackedPlayer(null);
                  }
                } else {
                  setNotification({
                    type: "error",
                    content: response.message,
                  });
                  console.error(response.message);
                }

                // setSelectedCard(null);
                setAttackedPlayer(null);
              }
            );
          }
        } else {
          socket.emit(
            "game:player-action",
            { server_id: serverId, card: selectedCard, user },
            (response) => {
              if (response.success) {
                if (!response.data.actionState) {
                  setNotification({
                    type: "error",
                    content: response.message,
                  });
                  setSelectedCard(null);
                  setAttackedPlayer(null);
                  setAttackablePlayers(null);
                  setShowAttackPopup(false);
                  return console.error(response.message);
                }
              } else {
                return console.error(
                  "Erreur lors de la récupération du serveur :",
                  response
                );
              }
            }
          );
        }
      }
    }
  };

  // Handle card removal
  const handleRemoveCard = () => {
    if (!gameIsOver) {
      if (selectedCard) {
        if (!gameIsOver) {
          socket.emit(
            "game:player-remove-card",
            { server_id: serverId, card: selectedCard, user },
            (response) => {
              if (!response.success) {
                return console.error(
                  "Erreur lors de la récupération du serveur :",
                  response
                );
              }
            }
          );
        }
      }
    }
  };

  const GameOverModal = ({ podium }) => {
    const onQuitGame = () => {
      window.location.href = "/"; // Recharge la page en redirigeant vers la page d'accueil
    };

    return (
      <div className="game-over-modal">
        <div className="game-over-modal__title">
          {podium[0] === playerEnvironment.username
            ? "Vous avez gagné la partie !"
            : `${podium[0]} remporte la partie !`}
        </div>

        <div className="game-over-modal__podium">
          {podium.map((username, index) => (
            <div key={index} className="game-over-modal__podium-player">
              <div className="game-over-modal__podium-player-rank">
                {index + 1}
              </div>
              <div className="game-over-modal__podium-player-name">
                {username}
              </div>
            </div>
          ))}
        </div>
        <div className="game-over-modal__buttons">
          <button className="primary-button bg-black" onClick={onQuitGame}>
            Quitter la partie
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="game-board">
      <header className="game-header">
        {players &&
          Object.values(players).map((player, index) => {
            const uniqueKey = `${player.id}-${index}`; // Combinaison de l'ID du joueur et de l'index
            return (
              <div
                className={`player-header ${
                  Number(player.position) === Number(currentPlayer)
                    ? "current"
                    : ""
                } ${
                  String(player.username) === String(user.username)
                    ? "self"
                    : ""
                }`}
                data-order={player.position}
                key={uniqueKey} // Utilisez la combinaison de l'ID du joueur et de l'index comme clé unique
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
        <CardStack numberOfCards={deckCount} />
        {/* {players && <Orbit players={players} />} */}
      </section>
      <section className="player-area">
        <div className="player-area__hand">
          {hand.length > 0 ? (
            <>
              {hand.map((card, index) => {
                const { name, tag, id, type } = card;

                return (
                  <button
                    key={id}
                    data-id={id}
                    data-type={type}
                    className="card"
                    disabled={!isMyTurn}
                    onClick={() => {
                      handleClickCard(card);
                    }}
                  >
                    <div className="card-top">{name}</div>
                    <div className="card-image">
                      {type === "borne" ? (
                        <div className={tag}>{tag}</div>
                      ) : (
                        <img src={`../images/cards/${tag}.svg`} alt={name} />
                      )}
                    </div>
                    <div className="card-bottom">{name}</div>
                  </button>
                );
              })}
            </>
          ) : (
            <p>Aucune carte dans la main</p>
          )}
        </div>
      </section>

      <div className={`action-modal ${showActionPopup ? "show" : ""}`}>
        <div className="action-modal__title">
          <h3>Choisissez une action</h3>
        </div>
        <div className="action-modal__image">
          {showActionPopup &&
            (selectedCard?.type === "borne" ? (
              <>
                <div className="borne">{selectedCard?.value}</div>
                <div className="action-modal__image--title">
                  {`Ajouter ${selectedCard?.value} kms`}
                </div>
              </>
            ) : (
              <>
                <img
                  src={`../images/cards/${selectedCard?.tag}.svg`}
                  alt={selectedCard?.name}
                />
                <div className="action-modal__image--title">
                  {selectedCard?.name}
                </div>
              </>
            ))}
        </div>

        <div className="action-modal__buttons">
          <button className="primary-button bg-green" onClick={handleUseCard}>
            Utiliser
          </button>
          <button className="primary-button bg-red" onClick={handleRemoveCard}>
            Jeter
          </button>
          <button
            className="primary-button bg-black"
            onClick={() => setSelectedCard(null)}
          >
            Annuler
          </button>
        </div>
      </div>

      <div className={`attack-modal ${showAttackPopup ? "show" : ""}`}>
        <span></span>
        <div className="attack-modal__title color-red">
          <h3>Qui voulez-vous attaquer ?</h3>
        </div>
        <div className="attack-modal__image">
          {showAttackPopup && (
            <img
              src={`../images/cards/${selectedCard?.tag}.svg`}
              alt={selectedCard?.name}
            />
          )}
        </div>
        <div className="attack-modal__players">
          {showAttackPopup &&
            attackablePlayers?.map((player, key) => (
              <button
                className={`primary-button ${
                  Number(player.position) === 1
                    ? "bg-blue"
                    : Number(player.position) === 2
                    ? "bg-red"
                    : Number(player.position) === 3
                    ? "bg-green"
                    : Number(player.position) === 4
                    ? "bg-orange"
                    : ""
                }`}
                key={key}
                onClick={() => {
                  if (!gameIsOver) {
                    setAttackedPlayer(player.id);
                  }
                }}
              >
                {player.username}
              </button>
            ))}
        </div>
        <div className="action-modal__buttons">
          <button
            className="primary-button bg-black"
            onClick={() => {
              if (!gameIsOver) {
                setSelectedCard(null);
                setAttackedPlayer(null);
                setAttackablePlayers(null);
                setShowAttackPopup(false);
                setNotification(null);
                setShowActionPopup(false);
              }
            }}
          >
            Annuler
          </button>
        </div>
      </div>

      <div
        className={`notification-popup ${notificationIsVisible && "show"}  ${
          notification?.type && notification.type
        }`}
      >
        {notification?.content && (
          <span className="notification-popup__content">
            {notification.content}
          </span>
        )}
      </div>

      <div
        className={`player-attack-notification ${
          attackNotificationIsVisible && "show"
        }`}
      >
        <div className={`player-attack-notification__title`}>Attaque</div>
        <div className={`player-attack-notification__content`}>
          <div className="player-attack-notification__image">
            <img
              src={`../images/cars/big_car${attackNotification?.attackedPlayer.position}-${attackNotification?.card.tag}.svg`}
              alt={`${attackNotification?.player.username} attaque ${attackNotification?.attackedPlayer.username} avec ${attackNotification?.card.name}`}
            />
          </div>
          <div className="player-attack-notification__message">
            <span>{attackNotification?.player.username}</span> attaque{" "}
            <span>{attackNotification?.attackedPlayer.username}</span>
          </div>
          <div className="player-attack-notification__action">
            {attackNotification?.card.name}
          </div>
        </div>
      </div>

      {gameIsOver && <GameOverModal podium={podium} />}

      <div
        className={`player-action-modal ${
          actionNotificationIsVisible && "show"
        } ${actionNotification?.type}`}
      >
        <div className={`player-action-modal__content`}>
          <div className="player-action-modal__image">
            {actionNotification?.type === "borne" ? (
              <>{actionNotification?.card.value}</>
            ) : actionNotification?.type === "remove" ? (
              <>
                <img src={`../images/cards/poubelle.svg`} alt="Une poubelle" />
              </>
            ) : (
              <>
                <img
                  src={`../images/cards/${actionNotification?.card.tag}.svg`}
                  alt={actionNotification?.card.name}
                />
              </>
            )}
          </div>
          <div className="player-action-modal__message">
            {actionNotification?.type === "borne" && (
              <>
                <span>{actionNotification?.player}</span> avance de{" "}
                <span>{actionNotification?.card.value} kms</span>.
              </>
            )}
            {actionNotification?.type === "parade" &&
              actionNotification?.card.tag === "findelimitedevitesse" && (
                <>
                  Fin de <span>limitation de vitesse</span> pour{" "}
                  <span>{actionNotification?.player}</span>.
                </>
              )}
            {actionNotification?.type === "parade" &&
              actionNotification?.card.tag !== "findelimitedevitesse" && (
                <>
                  <span>{actionNotification?.player}</span> peut reprendre la
                  route !{" "}
                </>
              )}
            {actionNotification?.type === "bonus" && (
              <>
                <span>{actionNotification?.player}</span> active son bonus{" "}
                <span>{actionNotification?.card.name} !</span>
              </>
            )}
            {actionNotification?.type === "remove" && (
              <>
                <span>{actionNotification?.player}</span> défausse une carte.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
