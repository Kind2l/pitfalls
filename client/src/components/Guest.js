import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Connection/Guest.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Guest = () => {
  const { socket, login } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const { playEffect } = useSound();

  const handleLogin = async (e) => {
    e.preventDefault();
    showLoader();
    socket.emit("user:guest-login", {}, (response) => {
      hideLoader();
      if (!response.success) {
        setError(response.message);
      } else {
        login(response.data);
        addNotification("Connexion réussie.");

        navigate("/");
      }
    });
  };

  return (
    <>
      <div className="guest">
        <form onSubmit={handleLogin}>
          <button
            className="submit color-blue"
            type="submit"
            onClick={() => playEffect("open")}
          >
            Jouer sans inscription
          </button>
          <div className="form-error">{error}</div>
        </form>
      </div>
    </>
  );
};

export default Guest;
