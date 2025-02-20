import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/connection/Login.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { socket, login } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { playEffect } = useSound();

  const validateUsername = (username) => {
    if (!username) {
      return "Aucun nom d'utilisateur fourni.";
    }

    if (username.length < 4) {
      return "Minimum 4 caractères.";
    }

    if (username.length > 20) {
      return "Maximum 20 caractères.";
    }

    // Regex autorisant lettres, chiffres, accents et caractères spéciaux définis
    const usernameRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ!@#$%^&*\-_=+?]+$/;

    if (!usernameRegex.test(username)) {
      return "Le nom d'utilisateur contient des caractères non autorisés.";
    }

    return false;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (username) {
      if (typeof username !== "string") {
        setError("Le nom d'utilisateur doit être une chaîne de caractères");
        return;
      }
      username.trim();

      if (validateUsername(username)) {
        setError(validateUsername(username));
        return;
      }

      showLoader();
      socket.emit("user:guest-login", { username }, (response) => {
        hideLoader();
        if (!response.success) {
          setError(response.message);
        } else {
          login(response.data);
          addNotification("Connexion réussie.");

          navigate("/");
        }
      });
    } else {
      setError("Insérez un nom d'utilisateur.");
    }
  };

  return (
    <>
      <div className="login">
        <h2>Bienvenue sur Pitfalls Road !</h2>
        <form onSubmit={handleLogin}>
          <div className="form-input">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={4}
              maxLength={20}
            />
          </div>
          <div className="form-input">
            <button
              className="submit btn bg-blue cherry-font"
              type="submit"
              onClick={() => playEffect("open")}
            >
              JOUER
            </button>
          </div>
          <div className="form-error">{error}</div>
        </form>
      </div>
    </>
  );
};

export default Login;
