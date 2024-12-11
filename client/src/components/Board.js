import { useAuth } from "@Auth/SocketContext";
import "@Styles/components/Board.scss";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import accident_ico from "../images/icons/accident.png";
import crevaison_ico from "../images/icons/crevaison.png";
import feurouge_ico from "../images/icons/feurouge.png";
import limitedevitesse_ico from "../images/icons/limitedevitesse.png";
import pannedessence_ico from "../images/icons/pannedessence.png";

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
    socket.emit("server:find", { server_id: serverId }, (response) => {
      if (response.success) {
        let playerData = response.data.players[user.username];
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
      socket.emit("server:find", { server_id: serverId }, (response) => {
        if (response.success) {
          let playerData = response.data.players[user.username];
          console.log("playerdata", playerData);

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
      feurouge: feurouge_ico,
      limitedevitesse: limitedevitesse_ico,
      accident: accident_ico,
      crevaison: crevaison_ico,
      pannedessence: pannedessence_ico,
    };

    return (
      <div className="player-header__states">
        {Object.entries(states).map(([key, value]) =>
          value ? (
            <span key={key} className="state-item">
              <img src={labels[key]} alt={key} />
            </span>
          ) : null
        )}
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
        {Object.entries(bonus).map(([key, value]) =>
          value ? (
            <span key={key} className="state-item">
              <img src={labels[key]} alt={key} />
            </span>
          ) : null
        )}
      </div>
    );
  }

  function PlayerHeaderName(username) {
    return <span className="player-header__name">{username}</span>;
  }
  function PlayerHeaderScore(score) {
    return <span className="player-header__score">{score}</span>;
  }

  const handleClickCard = (card) => {
    if (!isMyTurn) {
      return;
    }
    setSelectedCard(card);
  };

  const handleUseCard = () => {
    if (selectedCard) {
      if (selectedCard.type === "attaque") {
        if (attackedPlayer) {
          socket.emit(
            "game:player-action",
            {
              server_id: serverId,
              card: selectedCard,
              attackedPlayerId: attackedPlayer,
              user,
            },
            (response) => {
              if (response.success) {
                if (response.data.actionState === false) {
                  setNotification({
                    title: "Erreur",
                    content: response.message,
                  });
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
        } else {
          let attackables = Object.values(players).filter((player) => {
            if (player.id === user.id) return false;

            const hasOtherMalus =
              player.states.feurouge ||
              player.states.accident ||
              player.states.crevaison ||
              player.states.pannedessence;
            if (hasOtherMalus && selectedCard.tag !== "limitedevitesse") {
              return false;
            }

            if (
              (selectedCard.tag === "accident" && player.bonus.asduvolant) ||
              (selectedCard.tag === "crevaison" && player.bonus.increvable) ||
              (selectedCard.tag === "pannedessence" && player.bonus.citerne) ||
              (selectedCard.tag === "feurouge" &&
                player.bonus.vehiculeprioritaire)
            ) {
              return false;
            }

            return true;
          });

          if (attackables.length > 0) {
            console.log(attackables);
            setAttackablePlayers(attackables);
            setShowAttackPopup(true);
            setShowActionPopup(false);
          } else {
            setNotification({
              title: "Info",
              content: "Aucun joueur attaquable.",
            });
            setAttackablePlayers(null);
            setShowAttackPopup(false);
            setShowActionPopup(false);
            setAttackedPlayer(null);
          }
        }
      } else {
        socket.emit(
          "game:player-action",
          { server_id: serverId, card: selectedCard, user },
          (response) => {
            if (response.success) {
              if (response.data.actionState === false) {
                setNotification({ title: "Erreur", content: response.message });
                setSelectedCard(null);
                setAttackedPlayer(null);
                setAttackablePlayers(null);
                setShowAttackPopup(false);
                return console.error(response.message);
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
    }
  };

  const handleRemoveCard = () => {
    if (selectedCard) {
      socket.emit(
        "game:player-remove-card",
        { server_id: serverId, card: selectedCard, user },
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
    <div className="game-board">
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
        <div className="player-area__hand">
          {hand.length > 0 ? (
            <>
              {Object(hand).map((card) => {
                const { name, tag, id, type } = card;
                return (
                  <button
                    key={id}
                    data-id={id}
                    data-type={type}
                    className="card"
                    disabled={!isMyTurn}
                    onClick={() => handleClickCard(card)}
                  >
                    <span className="card-title">{name}</span>
                    <span className="card-image">
                      {type === "borne" ? (
                        <span className={tag}>{tag}</span>
                      ) : (
                        <img src={"../images/" + tag + ".png"} alt={name}></img>
                      )}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            <p>Aucune carte dans la main</p>
          )}
        </div>
      </section>

      {showActionPopup && (
        <div className="action-modal">
          <div className="action-modal__title">
            <h3>Que voulez vous faire de cette carte ?</h3>
          </div>
          <div className="action-modal__buttons">
            <button className="primary-button blue" onClick={handleUseCard}>
              Utiliser
            </button>
            <button className="primary-button red" onClick={handleRemoveCard}>
              Jeter
            </button>
            <button
              className="primary-button black"
              onClick={() => setSelectedCard(null)}
            >
              Annuler
            </button>
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
              setNotification(null);
              setShowActionPopup(false);
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
