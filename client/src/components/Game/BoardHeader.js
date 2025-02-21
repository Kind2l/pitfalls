import MessageOverlay from "@Components/Game/MessageOverlay";
import ShortMenu from "@Components/Game/ShortMenu";
import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Board/BoardHeader.scss";
import React, { useEffect, useRef, useState } from "react";

const BoardHeader = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { socket, user } = useAuth();
  const { playEffect } = useSound();
  const inputRef = useRef(null);

  const handleOpen = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  const handleOpenMessage = () => {
    setShowMessageInput(!showMessageInput);
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

  useEffect(() => {
    if (showMessageInput && inputRef.current) {
      inputRef.current.focus(); // Met le focus sur l'input
    }
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
        <button className="menu" onClick={handleOpen}>
          {menuIsOpen ? (
            <i className="fa-solid fa-caret-down"></i>
          ) : (
            <i className="fa-solid fa-bars"></i>
          )}
        </button>
        <ShortMenu isOpen={menuIsOpen} />
      </div>

      {showMessageInput && (
        <form className="message-input" onSubmit={handleSendMessage}>
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
      )}
    </>
  );
};

export default BoardHeader;
