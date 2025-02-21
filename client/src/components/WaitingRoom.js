import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "@Components/Header";

import { useLoader } from "@Context/LoaderContext.js";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import "@Styles/pages/WaitingRoom.scss";

const WaitingRoom = ({ setGameIsStarted }) => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();
  const navigate = useNavigate();

  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();
  const { playEffect } = useSound();

  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [author, setAuthor] = useState("null");
  const [serverName, setServerName] = useState("");
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const messagesBottomRef = useRef(null);

  useEffect(() => {
    showLoader();
    socket.emit("server:find", { user, server_id: serverId }, (response) => {
      hideLoader();
      if (response.success) {
        setGameIsStarted(response.data.start);
        setPlayers(response.data.players);
        setMaxPlayers(response.data.maxPlayers);
        setAuthor(response.data.author);
        setServerName(response.data.name);
      } else {
        console.error(response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "Êtes-vous sûr de vouloir quitter la partie ?";
    };

    const handleBackButton = (event) => {
      event.preventDefault();
      const confirmLeave = window.confirm(
        "Souhaitez-vous vraiment quitter la partie ?"
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.pathname);
      } else {
        handleLeaveServer();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  useEffect(() => {
    // Écoute des mises à jour du serveur
    socket.on("server:update", (data) => {
      if (data) {
        if (data.start === true) {
          showLoader();
        }
        data.start && setGameIsStarted(data.start);
        data.players && setPlayers(data.players);
        data.maxPlayers && setMaxPlayers(data.maxPlayers);
        data.author && setAuthor(data.author);
      }
    });

    socket.on("game:player-message", (data) => {
      const newMessage = {
        id: `${Date.now()}${data.username}`,
        text: data.message,
        username: data.username,
      };
      setMessages((prev) => [...prev, newMessage]);
      playEffect("message");
    });

    return () => {
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    if (showMessageInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showMessageInput]);

  useEffect(() => {
    // Scroll automatique vers le bas à chaque nouveau message
    if (messagesBottomRef.current) {
      messagesBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = () => {
    socket.emit(
      "server:initalization",
      { user, server_id: serverId },
      (response) => {
        if (!response.success) {
          console.error(response);
        } else {
          console.log(response);
        }
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pitfalls Road - Invitation à une partie",
          text: `Je t'invite à me rejoindre sur le jeu Pitfalls! Ma partie s'appelle "${serverName}" !`,
          url: "https://pitfalls-client.onrender.fr",
        });
      } catch (error) {
        console.error("Échec du partage", error);
      }
    } else {
      navigator.clipboard.writeText("https://pitfalls-client.onrender.fr");
      addNotification("Lien copié !");
    }
  };

  const handleLeaveServer = () => {
    socket.emit("server:leave", { user, server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        navigate(`/`);
      }
    });
  };

  const handleSetMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("game:player-message", { user, message }, (response) => {
      console.log(response);
    });
    setMessage("");
    setShowMessageInput(false);
  };

  return (
    <>
      <Header />
      <div className="waiting-room">
        <div className="waiting-room-container">
          <div className="waiting-room-container__header">
            <h2>{serverName}</h2>
            <button className="share" onClick={() => handleShare()}>
              <i className="fa-solid fa-share-nodes"></i>
            </button>
          </div>

          <div className="waiting-room-container__content">
            <div className="infos">
              <span>Hôte : {author}</span>
              <span>
                {Object.keys(players)?.length || "0"}/{maxPlayers} joueurs
              </span>
            </div>

            <ul className="players">
              {Object.keys(players)?.length > 0 ? (
                Object.values(players)?.map((player) => (
                  <li className="cherry-font" key={player.id + player.username}>
                    {player.username}
                  </li>
                ))
              ) : (
                <li>Aucun joueur connecté.</li>
              )}
            </ul>

            <p className="status">
              {Object.keys(players)?.length === 0
                ? "En attente de joueurs supplémentaires"
                : "En attente du lancement de la partie par l'hôte..."}
            </p>

            <div className="buttons">
              {String(author) === String(user.username) &&
              Number(Object.keys(players).length) >= 2 &&
              Number(Object.keys(players).length) <= Number(maxPlayers) ? (
                <button
                  className="primary-button bg-green"
                  onClick={() => handleSubmit()}
                >
                  Démarrer la partie
                </button>
              ) : null}
              <button
                className="primary-button bg-red"
                onClick={() => {
                  handleLeaveServer();
                }}
              >
                Quitter la partie
              </button>
            </div>
          </div>
        </div>

        <form className="waiting-room-chat" onSubmit={handleSendMessage}>
          <h3>Messages</h3>
          <ul>
            {messages.map((msg) => (
              <li key={msg.id} className="message">
                <span className="cherry-font">{msg.username}: </span>
                {msg.text}
              </li>
            ))}
            <div ref={messagesBottomRef} />
          </ul>

          <label>
            <input
              ref={inputRef}
              type="text"
              maxLength={250}
              minLength={1}
              value={message}
              onChange={handleSetMessage}
            />
            <button className="send" type="submit">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </label>
        </form>

        <span className="id">ID : {serverId}</span>
      </div>
    </>
  );
};

export default WaitingRoom;
