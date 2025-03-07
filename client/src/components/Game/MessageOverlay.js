import "@Styles/Board/MessageOverlay.scss";
import React from "react";

const MessageOverlay = ({ messages }) => {
  return (
    <div className="message-overlay">
      {messages.map((msg) => (
        <div key={msg.id} className="message-item">
          <span className="cherry-font">{msg.username}: </span>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default MessageOverlay;
