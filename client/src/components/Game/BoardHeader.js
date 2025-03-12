import MessageOverlay from "@Components/Game/MessageOverlay";
import ShortMenu from "@Components/Game/ShortMenu";
import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Board/BoardHeader.scss";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BoardHeader = ({ serverInfos }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [serverInfosIsOpen, setServerInfosIsOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showMessageInput, setShowMessageInput] = useState(false);
  const [messages, setMessages] = useState([]);
  const { socket, user } = useAuth();
  const { playEffect } = useSound();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleOpenMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  const handleOpenMessage = () => {
    setShowMessageInput(!showMessageInput);
  };

  const handleSendMessage = (message) => {
    if (!message.trim()) return;
    socket.emit("game:player-message", { user, message }, (response) => {
      console.log(response);
    });
    setShowMessageInput(false);
  };

  const handleLeave = () => {
    setShowLeaveModal(true);
  };

  const confirmLeave = () => {
    navigate("/");
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
  };

  useEffect(() => {
    if (showMessageInput && inputRef.current) {
      inputRef.current.focus(); // Met le focus sur l'input
    }
  }, [showMessageInput]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !showMessageInput) {
        handleOpenMessage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMessageInput]);

  useEffect(() => {
    socket.on("game:player-message", (data) => {
      const newMessage = {
        id: `${Date.now()}${data.username}`,
        text: data.message,
        username: data.username,
      };
      setMessages((prev) => [...prev, newMessage]);
      playEffect("message");
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      }, 5000);
    });

    return () => {
      socket.off();
    };
  }, [socket]);

  return (
    <>
      <MessageOverlay messages={messages} />
      <div className="board-header">
        <button className="message" onClick={handleOpenMessage}>
          {showMessageInput ? (
            <i className="fa-regular fa-keyboard"></i>
          ) : (
            <i className="fa-regular fa-comment-dots"></i>
          )}
        </button>
        <div className="logo">
          <ImageLoader name="logo-min" alt="Logo du jeu Pitfalls Road" />
        </div>
        <button className="menu" onClick={handleOpenMenu}>
          {menuIsOpen ? (
            <i className="fa-solid fa-caret-down"></i>
          ) : (
            <i className="fa-solid fa-bars"></i>
          )}
        </button>
        <ShortMenu
          isOpen={menuIsOpen}
          serverInfosIsOpen={serverInfosIsOpen}
          setServerInfosIsOpen={setServerInfosIsOpen}
          handleLeave={handleLeave}
        />
      </div>

      {showMessageInput && (
        <div className="message-input">
          {[
            "Bonjour !",
            "Bonne chance !",
            "Bien joué !",
            "Merci !",
            "Wow !",
            "La remontada !",
            "Ouch, ça pique !",
            "Pas cool !",
            "Plein gaz !",
            "C'est pas fini !",
            "C'était serré !",
            "On remet ça ?",
          ].map((preset) => (
            <button
              key={preset}
              className="preset-message btn"
              onClick={() => handleSendMessage(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
      {serverInfosIsOpen && serverInfos && (
        <ul className="server-infos-modal">
          <h3>Informations</h3>
          <li>
            <strong>Nom</strong> {serverInfos.name}
          </li>
          <li>
            <strong>Nombre de joueurs max</strong> {serverInfos.maxPlayers}
          </li>
          <li>
            <strong>Type de partie</strong> {serverInfos.type}
          </li>
          <li>
            <strong>Score requis</strong> {serverInfos.requiredScore}
          </li>
          <li>
            <strong>Suppression auto des pénalités</strong>{" "}
            {serverInfos.autoRemovePenality ? "Oui" : "Non"}
          </li>

          <li>
            <strong>Carte illimitées</strong>{" "}
            {serverInfos.isDeckUnlimited ? "Oui" : "Non"}
          </li>

          <button
            className="bg-red"
            onClick={() => setServerInfosIsOpen(false)}
          >
            <i class="fa-solid fa-xmark"></i>{" "}
          </button>
        </ul>
      )}
      {showLeaveModal && (
        <div className="leave-modal">
          <h3>Êtes-vous sûr de vouloir quitter la partie ?</h3>
          <div className="modal-content">
            <button className="btn bg-red" onClick={confirmLeave}>
              Oui
            </button>
            <button className="btn bg-green" onClick={cancelLeave}>
              Non
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardHeader;
