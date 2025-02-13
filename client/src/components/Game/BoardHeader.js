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
      }, 3000);
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
          <ImageLoader name="message" alt="Message" />
        </button>
        <div className="logo">
          <ImageLoader name="logo-min" alt="Musique" />
        </div>
        <button className="menu" onClick={handleOpen}>
          <ImageLoader name="menu" alt="Menu" />
        </button>
        <ShortMenu isOpen={menuIsOpen} />
      </div>

      {showMessageInput && (
        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            ref={inputRef}
            type="text"
            maxLength={30}
            minLength={1}
            value={message}
            onChange={handleSetMessage}
          />
          <button className="send-message" type="submit">
            <ImageLoader name="message" alt="Envoyer le message" />
          </button>
        </form>
      )}
    </>
  );
};

export default BoardHeader;
