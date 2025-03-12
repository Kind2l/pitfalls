import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const [host, setHost] = useState("");
  const [serverName, setServerName] = useState("");
  const [serverType, setServerType] = useState("");
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
        setHost(response.data.host);
        setServerName(response.data.name);
        setServerType(response.data.type);
      } else {
        console.error(response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log("players : ", players);
  }, [setPlayers, players]);

  useEffect(() => {
    // Écoute des mises à jour du serveur
    socket.on("server:update", (data) => {
      if (data) {
        console.log("serveur", data);
        if (data.start === true) {
          showLoader();
        }
        data.start && setGameIsStarted(data.start);
        data.players && setPlayers(data.players);
        data.maxPlayers && setMaxPlayers(data.maxPlayers);
        data.host && setHost(data.host);
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
      socket.off("server:update");
      socket.off("game:player-message");
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
    socket.emit("server:initalization", { user, serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        console.log(response);
      }
    });
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
    navigate(`/`);
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
    <div className="waiting-room page">
      <div className="page-content">
        <h2 className="page-title">En attente ...</h2>
        <h3 className="subtitle server-name">{serverName}</h3>

        <ul className="server-infos">
          <li>
            <span>Hôte : </span> {host}
          </li>
          <li>
            <span>Joueur(s) : </span>
            {Object.keys(players)?.length || "0"}/{maxPlayers}
          </li>
          <li>
            <span>Type : </span>{" "}
            {serverType === "classic"
              ? "Classique"
              : serverType === "classic"
              ? "Hardcore"
              : serverType === "infinite"
              ? "Jusqu'à l'hotel"
              : serverType === "custom"
              ? "Personnalisé"
              : "undefined"}
          </li>
        </ul>
        <div className="server-description">
          {serverType === "classic" ? (
            <p>
              L'objectif est de parcourir 1000 km avec 110 cartes disponibles.
              Chaque joueur a une main de 7 cartes, les malus disparaissent
              après 8 tours..
            </p>
          ) : serverType === "infinite" ? (
            <p>
              L'objectif est de parcourir 1000 km avec un nombre illimité de
              cartes (sauf les bonus). Chaque joueur a une main de 7 cartes, les
              malus restent actifs jusqu'à la parade.
            </p>
          ) : serverType === "hardcore" ? (
            <p>
              L'objectif est de parcourir 1000 km avec 110 cartes disponibles.
              Chaque joueur commence avec une main de 3 cartes, les malus
              restent actifs jusqu'à la parade.
            </p>
          ) : (
            <p>Partie personnalisée.</p>
          )}
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
          {String(host) === String(user.username) &&
          Number(Object.keys(players).length) >= 2 &&
          Number(Object.keys(players).length) <= Number(maxPlayers) ? (
            <button className="btn bg-green" onClick={() => handleSubmit()}>
              Démarrer
            </button>
          ) : null}
          <button
            className="btn bg-red"
            onClick={() => {
              handleLeaveServer();
            }}
          >
            Quitter
          </button>
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
    </div>
  );
};

export default WaitingRoom;
