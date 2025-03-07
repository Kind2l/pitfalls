import ActionModal from "@Components/Game/ActionModal";
import AttackModal from "@Components/Game/AttackModal";
import BoardHeader from "@Components/Game/BoardHeader";
import CloudPane from "@Components/Game/CloudPane";
import NotificationPopup from "@Components/Game/NotificationPopup";
import PlayerActionModal from "@Components/Game/PlayerActionModal";
import PlayerAttackNotification from "@Components/Game/PlayerAttackNotification";
import PlayerDashboard from "@Components/Game/PlayerDashboard";
import ImageLoader from "@Components/ImageLoader.js";
import RaceTrack from "@Components/RaceTrack.js";
import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import "@Styles/Board/Board.scss";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CardStack from "./Game/CardStack";
import Orbit from "./Game/Orbit";

const Board = () => {
  const { socket, user, logout } = useAuth();
  const { serverId } = useParams();
  const { playMusic } = useSound();
  const { hideLoader } = useLoader();

  const [serverInfos, setServerInfos] = useState(null);
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
  const [showCountStart, setShowCountStart] = useState(null);
  const [afkTimer, setAfkTimer] = useState(120);
  const [isAfkTimerStarted, setIsAfkTimerStarted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    playMusic("bgparty");
    setTimeout((e) => {
      hideLoader();
      setShowCountStart(true);
      // setTimeout(() => {
      //   setIsAfkTimerStarted(true);
      // }, 5000);
    }, 1000);
  }, []);

  useEffect(() => {
    console.log("isWaiting ? ", isWaiting);
  }, [setIsWaiting, isWaiting]);

  useEffect(() => {
    let timerInterval;

    // if (isMyTurn && isAfkTimerStarted) {
    //   timerInterval = setInterval(() => {
    //     setAfkTimer((prevTimer) => {
    //       if (prevTimer > 0) {
    //         return prevTimer - 1;
    //       } else {
    //         clearInterval(timerInterval);
    //         socket.emit("server:afk-player", { user });
    //         logout();
    //         return 0;
    //       }
    //     });
    //   }, 1000);
    // }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isMyTurn, isAfkTimerStarted, socket, serverId, user]);

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
        setServerInfos({
          maxPlayers: response.data.maxPlayers || "",
          name: response.data.name || "",
          canDrawLastDiscard: response.data.canDrawLastDiscard || "",
          autoRemovePenality: response.data.autoRemovePenality || "",
          requiredScore: response.data.requiredScore || "",
          isDeckUnlimited: response.data.isDeckUnlimited || "",
          type: response.data.type || "",
        });
      } else {
        console.error("Erreur lors de la récupération du serveur :", response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch game data on next round
  useEffect(() => {
    socket.on("game:next-round", (response) => {
      setAfkTimer(120);
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
      setIsWaiting(false);
    });

    socket.on("game:is-over", (data) => {
      setPlayers(data.players);
      setGameIsOver(true);
      setPodium(data.podium);
      setIsWaiting(true);
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
      setIsWaiting(false);
    });

    socket.on("server:afk-player", (data) => {
      let username = data.username;
      addNotification(`${username} est exclu pour inactivité`);
    });

    return () => {
      socket.off("server:afk-player");
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
  function PlayerHeaderStates(states, autoRemovePenality) {
    const labels = {
      feurouge: "Feu rouge",
      zonedecontrole: "Zone de contrôle",
      accident: "Accident",
      fatigue: "Fatigué",
      pannedessence: "Panne d'essence",
    };

    return (
      <div className="player-header__states">
        {Object.entries(states).map(([key, obj]) =>
          obj.value ? (
            <span key={key} className="state-item">
              <ImageLoader name={`icons/${key}`} alt={labels[key]} />
              {console.log("obj", obj)}
              {autoRemovePenality && (
                <span className="state-item__count cherry-font">
                  {Number(obj.count) === 0
                    ? "4"
                    : Number(obj.count) === 1
                    ? "3"
                    : Number(obj.count) === 2
                    ? "2"
                    : Number(obj.count) === 3
                    ? "1"
                    : ""}
                </span>
              )}
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
    if (isWaiting || gameIsOver || !selectedCard) {
      return;
    }

    if (selectedCard.type === "attaque") {
      if (attackedPlayer) {
        try {
          setIsWaiting(true);
          socket.emit(
            "game:player-action",
            {
              server_id: serverId,
              card: selectedCard,
              attackedPlayerId: attackedPlayer,
              user,
            },
            (response) => {
              setIsWaiting(false);

              if (response.success) {
                if (!response.data.actionState) {
                  setNotification({
                    type: "error",
                    content: response.message,
                  });
                  console.error(response.message);
                }
              } else {
                setIsWaiting(false);
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
        } catch (error) {
          console.log(error);
          setIsWaiting(false);
        }
      } else {
        try {
          setIsWaiting(true);
          socket.emit(
            "game:player-action",
            {
              server_id: serverId,
              card: selectedCard,
              user,
            },
            (response) => {
              setIsWaiting(false);
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
              setAttackedPlayer(null);
            }
          );
        } catch (error) {
          setIsWaiting(false);
          console.log(error);
        }
      }
    } else {
      try {
        setIsWaiting(true);
        socket.emit(
          "game:player-action",
          { server_id: serverId, card: selectedCard, user },
          (response) => {
            setIsWaiting(false);

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
      } catch (error) {
        console.log(error);
        setIsWaiting(false);
      }
    }
  };

  // Handle card removal
  const handleRemoveCard = () => {
    if (isWaiting) {
      return;
    }
    if (!gameIsOver && selectedCard) {
      try {
        setIsWaiting(true);
        socket.emit(
          "game:player-remove-card",
          { server_id: serverId, card: selectedCard, user },
          (response) => {
            setIsWaiting(false);

            if (!response.success) {
              return console.error(
                "Erreur lors de la récupération du serveur :",
                response
              );
            }
          }
        );
      } catch (error) {
        setIsWaiting(false);
        console.log(error);
      }
    }
  };

  const GameOverModal = ({ podium }) => {
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
      <BoardHeader serverInfos={serverInfos} />
      <header className="game-header">
        {players &&
          Object.values(players).map((player, index) => {
            const uniqueKey = `${player.id}-${index}`; // Combinaison de l'ID du joueur et de l'index
            if (player.username === playerEnvironment?.username) {
              return;
            }
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
                {PlayerHeaderStates(
                  player.states,
                  serverInfos?.autoRemovePenality
                )}
                {PlayerHeaderBonus(player.bonus)}
              </div>
            );
          })}
      </header>
      <section className="game-area">
        <CardStack
          numberOfCards={deckCount}
          isDeckUnlimited={serverInfos?.isDeckUnlimited}
        />
        {players && <Orbit players={players} serverInfos={serverInfos} />}
        {players && <RaceTrack players={players} serverInfos={serverInfos} />}
      </section>
      {/* {isMyTurn & (afkTimer < 50) ? (
        <div className="timer cherry-font">
          {Math.floor(afkTimer / 60)}:{String(afkTimer % 60).padStart(2, "0")}
        </div>
      ) : (
        ""
      )} */}

      {
        <PlayerDashboard
          players={players}
          isMyTurn={isMyTurn}
          currentPlayer={currentPlayer}
          hand={hand}
          handleClickCard={handleClickCard}
          isWaiting={isWaiting}
          serverInfos={serverInfos}
        />
      }
      <ActionModal
        showActionPopup={showActionPopup}
        selectedCard={selectedCard}
        handleUseCard={handleUseCard}
        handleRemoveCard={handleRemoveCard}
        setSelectedCard={setSelectedCard}
        isWaiting={isWaiting}
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
        isWaiting={isWaiting}
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
      {/* {showCountStart && <CountStart />} */}
      <CloudPane />
    </div>
  );
};

export default Board;
