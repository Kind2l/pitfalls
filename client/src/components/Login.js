import { useNotification } from "@Auth/NotificationContext.js";
import { useAuth } from "@Auth/SocketContext";
import { useSound } from "@Auth/SoundContext";
import "@Styles/Connection/Login.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../auth/LoaderContext";
import ImageLoader from "./ImageLoader";

const Login = () => {
  const { socket, login } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { playEffect } = useSound();

  const usernameRegex =
    /^(?!.*[-_]$)(?![-_])[a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\-_.]{4,20}$/;
  const passwordRegex = /^[a-zA-Z0-9$/!?:#+]{6,24}$/;

  // Validation functions
  const validateUsername = (username) => {
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
    if (password.length < 6) {
      return "Le mot de passe doit contenir 6 caractères minimum.";
    }
    if (password.length > 24) {
      return "Le mot de passe doit contenir  24 caractères maximum.";
    }
    if (!/[a-z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une minuscule.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une majuscule.";
    }
    if (!/\d/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre.";
    }
    if (!passwordRegex.test(password)) {
      return "Caractères spéciaux autorisés pour le mot de passe :  $ / ! ? : # +";
    }
    return "";
  };

  const handlePasswordView = (e) => {
    setShowPassword(!showPassword);
    e.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const usernameError = validateUsername(trimmedUsername);
    const passwordError = validatePassword(trimmedPassword);

    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (username && password) {
      showLoader();
      socket.emit(
        "user:login",
        {
          username: trimmedUsername,
          password: trimmedPassword,
        },
        (response) => {
          hideLoader();
          if (!response.success) {
            setError(response.message);
          } else {
            login(response.data);
            addNotification("Connexion réussie.");

            navigate("/");
          }
        }
      );
    } else {
      setError("Veuillez compléter les informations ci-dessus.");
    }
  };

  return (
    <>
      <div className="login">
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
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
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
                  <ImageLoader
                    name="img_closeEye"
                    alt="Cacher le mot de passe"
                  />
                )}
              </button>
            )}
          </div>

          <div className="form-error">{error}</div>
          <button
            className="submit primary-button bg-blue"
            type="submit"
            onClick={() => playEffect("open")}
          >
            Connexion
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
