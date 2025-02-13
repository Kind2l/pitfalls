import ActionModal from "@Components/Game/ActionModal";
import AttackModal from "@Components/Game/AttackModal";
import BoardHeader from "@Components/Game/BoardHeader";
import NotificationPopup from "@Components/Game/NotificationPopup";
import PlayerActionModal from "@Components/Game/PlayerActionModal";
import PlayerAttackNotification from "@Components/Game/PlayerAttackNotification";
import PlayerHand from "@Components/Game/PlayerHand";
import ImageLoader from "@Components/ImageLoader.js";
import Orbit from "@Components/Orbit.js";
import { useLoader } from "@Context/LoaderContext";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Board/Board.scss";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CardStack from "./Game/CardStack";
import CloudPane from "./Game/CloudPane";
import CountStart from "./Game/CountStart";

const Board = () => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();
  const { playMusic, playEffect } = useSound();
  const { hideLoader, showLoader } = useLoader();

  const [hand, setHand] = useState([]);
  const [playerEnvironment, setPlayerEnvironment] = useState(null);
  const [players, setPlayers] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [position, setPosition] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(null);
  const [deckCount, setDeckCount] = useState(0);
  const [stopActions, setStopActions] = useState(true);
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
  const [showCountStart, setShowCountStart] = useState(null);

  useEffect(() => {
    playMusic("bgparty");
    setTimeout((e) => {
      hideLoader();
      setShowCountStart(true);
      setStopActions(false);
    }, 1000);
  }, []);

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

  useEffect(() => {
    console.log("StopAction :", stopActions);
  }, [stopActions, setStopActions]);

  // Fetch game data on next round
  useEffect(() => {
    socket.on("game:next-round", (response) => {
      if (response?.data?.type) {
        setStopActions(false);
        if (response?.data?.type === "attaque") {
          setAttackNotification(response.data);
        } else {
          setActionNotification(response.data);
        }
      }

      socket.emit("server:find", { user, server_id: serverId }, (response) => {
        setStopActions(false);
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
      setStopActions(true);
      setPlayers(data.players);
      setGameIsOver(true);
      setPodium(data.podium);
    });

    socket.on("server:update", (data) => {
      setStopActions(false);
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

    return () => {
      socket.off("game:next-round");
      socket.off("game:is-over");
      socket.off("server:update");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Determine if it's the player's turn
  useEffect(() => {
    setIsMyTurn(Number(position) === Number(currentPlayer));
  }, [currentPlayer, position]);

  // Show notification for a short period
  useEffect(() => {
    setNotificationIsVisible(false);
    setAttackNotificationIsVisible(false);
    setActionNotificationIsVisible(false);

    if (notification) {
      setNotificationIsVisible(true);

      // Hide notification after 3 seconds
      let timerNotificationAppear = setTimeout(() => {
        setNotificationIsVisible(false);
      }, 1000);

      // Clear notification after 4 seconds
      let timerData = setTimeout(() => {
        setNotification(null);
      }, 2000);

      return () => {
        clearTimeout(timerNotificationAppear);
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

      let timerAppear = setTimeout(() => {
        setActionNotificationIsVisible(false);
      }, 1500);

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
      zonedecontrole: "Zone de contrôle",
      accident: "Accident",
      fatigue: "Fatigué",
      pannedessence: "Panne d'essence",
    };

    return (
      <div className="player-header__states">
        {Object.entries(states).map(([key, value]) =>
          value ? (
            <span key={key} className="state-item">
              <ImageLoader name={`icons/${key}`} alt={labels[key]} />
            </span>
          ) : null
        )}
      </div>
    );
  }

  // Component to display player bonuses
  function PlayerHeaderBonus(bonus) {
    const labels = {
      pilote: "Pilote",
      deviation: "Déviation",
      infatigable: "Infatigable",
      cartedepolice: "Carte de police",
    };

    return (
      <div className="player-header__bonus">
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

  // Component to display player name
  function PlayerHeaderName(username) {
    return (
      <span className="player-header__name">
        {username === user.username ? "Vous" : username}
      </span>
    );
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
    if (stopActions) {
      return;
    }
    if (gameIsOver) {
      return;
    }

    if (!selectedCard) {
      return;
    }

    if (selectedCard.type === "attaque") {
      if (attackedPlayer) {
        setStopActions(true);
        socket.emit(
          "game:player-action",
          {
            server_id: serverId,
            card: selectedCard,
            attackedPlayerId: Number(attackedPlayer),
            user,
          },
          (response) => {
            setStopActions(false);
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
        setStopActions(true);
        socket.emit(
          "game:player-action",
          {
            server_id: serverId,
            card: selectedCard,
            user,
          },
          (response) => {
            setStopActions(false);
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
      setStopActions(true);
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
            setStopActions(false);
            return console.error(
              "Erreur lors de la récupération du serveur :",
              response
            );
          }
        }
      );
    }
  };

  // Handle card removal
  const handleRemoveCard = () => {
    if (!gameIsOver) {
      if (selectedCard) {
        if (!gameIsOver) {
          setStopActions(true);
          socket.emit(
            "game:player-remove-card",
            { server_id: serverId, card: selectedCard, user },
            (response) => {
              if (!response.success) {
                setStopActions(false);

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
    setStopActions(true);
    const onQuitGame = () => {
      window.location.href = "/"; // Recharge la page en redirigeant vers la page d'accueil
    };

    return (
      <div className="game-over-modal">
        <div className="game-over-modal__trophy">
          <ImageLoader name="trophy" alt="Image d'un trophé" />
          <span>{podium[0]}</span>
        </div>
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
                {username === user.username ? "Vous" : username}
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
      <BoardHeader />
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
        {players && <Orbit players={players} />}
        <CloudPane />
      </section>
      <PlayerHand
        hand={hand}
        isMyTurn={isMyTurn}
        handleClickCard={handleClickCard}
      />
      <ActionModal
        showActionPopup={showActionPopup}
        selectedCard={selectedCard}
        handleUseCard={handleUseCard}
        handleRemoveCard={handleRemoveCard}
        setSelectedCard={setSelectedCard}
      />
      <AttackModal
        showAttackPopup={showAttackPopup}
        selectedCard={selectedCard}
        attackablePlayers={attackablePlayers}
        setAttackedPlayer={setAttackedPlayer}
        setSelectedCard={setSelectedCard}
        setAttackablePlayers={setAttackablePlayers}
        setShowAttackPopup={setShowAttackPopup}
        setNotification={setNotification}
        setShowActionPopup={setShowActionPopup}
        gameIsOver={gameIsOver}
      />
      <NotificationPopup
        notification={notification}
        notificationIsVisible={notificationIsVisible}
      />
      <PlayerAttackNotification
        attackNotification={attackNotification}
        attackNotificationIsVisible={attackNotificationIsVisible}
      />
      {gameIsOver && <GameOverModal podium={podium} />}
      <PlayerActionModal
        actionNotification={actionNotification}
        actionNotificationIsVisible={actionNotificationIsVisible}
      />
      {/* <div className="count-start">
        <div className="message cherry-font">C'est parti !</div>
      </div> */}
      {showCountStart && <CountStart />}
    </div>
  );
};

export default Board;
