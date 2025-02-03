import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Connection/Register.scss";
import React, { useState } from "react";
import ImageLoader from "./ImageLoader";

const Register = ({ setChoice }) => {
  const { socket } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const { playEffect } = useSound();

  // Regex patterns
  const usernameRegex = /^[a-zA-ZÀ-ÿ-_]{4,20}$/;
  const passwordRegex = /^[a-zA-ZÀ-ÿ!@#$%^&*-_=+,.?]{4,20}$/;

  // Validation functions
  const validateUsername = (username) => {
    if (!username) {
      return "Aucun nom d'utilisateur";
    }

    if (username.length < 4) {
      return "Le nom d'utilisateur doit contenir 4 caractères minimum.";
    }
    if (username.length > 20) {
      return "Le nom d'utilisateur doit contenir 20 caractères maximum.";
    }

    if (!usernameRegex.test(username)) {
      return "Caractères spéciaux autorisés pour le nom d'utilisateur: - _";
    }
    return false;
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Aucun mot de passe.";
    }
    if (password.length < 4) {
      return "Le mot de passe doit contenir 4 caractères minimum.";
    }
    if (password.length > 20) {
      return "Le mot de passe doit contenir  20 caractères maximum.";
    }
    if (!passwordRegex.test(password)) {
      return `Caractères spéciaux autorisés pour le mot de passe !@#$%^&*-_=+,.?`;
    }
    return false;
  };

  const handlePasswordView = (e) => {
    setShowPassword(!showPassword);
    e.preventDefault();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (username && password && passwordRepeat) {
      if (
        typeof username !== "string" ||
        typeof username !== "string" ||
        typeof passwordRepeat !== "string"
      ) {
        setError("Les champs doivent êtres des chaînes de caractères");
        return;
      }
      username.trim();
      password.trim();
      passwordRepeat.trim();

      if (passwordRepeat !== password) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (validateUsername(username)) {
        setError(validateUsername(username));
        return;
      }
      if (validatePassword(password)) {
        setError(validatePassword(password));
        return;
      }
      if (passwordRepeat !== password) {
        setError("Les mots de passe sont différents.");
        return;
      }

      showLoader();
      socket.emit(
        "user:register",
        {
          username: username,
          password: password,
        },
        (response) => {
          hideLoader();
          if (!response.success) {
            setError(response.message);
          } else {
            addNotification("Inscription réussie.");
            setChoice(true);
          }
        }
      );
    } else {
      setError("Veuillez compléter les informations ci-dessus.");
    }
  };

  return (
    <div className="register">
      <form onSubmit={handleRegister}>
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
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            maxLength={24}
          />
          {password && (
            <button className="password-eye" onClick={handlePasswordView}>
              {showPassword ? (
                <ImageLoader
                  name="img_openEye"
                  alt="Afficher le mot de passe"
                />
              ) : (
                <ImageLoader name="img_closeEye" alt="Cacher le mot de passe" />
              )}
            </button>
          )}
        </div>
        <div className="form-input">
          <input
            type="password"
            placeholder="Confirmation du mot de passe"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            minLength={4}
            maxLength={24}
          />
        </div>
        <div className="form-error">{error}</div>
        <button
          className="submit primary-button bg-blue"
          type="submit"
          onClick={() => playEffect("open")}
        >
          Inscription
        </button>
      </form>
    </div>
  );
};

export default Register;
