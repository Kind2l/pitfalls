import MessageOverlay from "@Components/Game/MessageOverlay";
import ShortMenu from "@Components/Game/ShortMenu";
import ImageLoader from "@Components/ImageLoader";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Board/BoardHeader.scss";
import React, { useEffect, useState } from "react";

const BoardHeader = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { socket, user } = useAuth();
  const { playEffect } = useSound();

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
          <ImageLoader name="img_message" alt="Message" />
        </button>
        <div className="logo">
          <ImageLoader name="img_logoMin" alt="Musique" />
        </div>
        <button className="menu" onClick={handleOpen}>
          <ImageLoader name="img_menu" alt="Menu" />
        </button>
        <ShortMenu isOpen={menuIsOpen} />
      </div>

      {showMessageInput && (
        <form className="message-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            maxLength={30}
            minLength={1}
            value={message}
            onChange={handleSetMessage}
          />
          <button type="submit">
            <ImageLoader name="img_message" alt="Envoyer le message" />
          </button>
        </form>
      )}
    </>
  );
};

export default BoardHeader;
