import { useLoader } from "@Context/LoaderContext";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/Connection/Login.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const validateUsername = (username) => {
    if (!username) {
      return "Aucun nom d'utilisateur fourni.";
    }

    if (username.length < 4) {
      return "Le nom d'utilisateur doit contenir 4 caractères minimum.";
    }

    if (username.length > 20) {
      return "Le nom d'utilisateur doit contenir 20 caractères maximum.";
    }

    // Regex autorisant lettres, chiffres, accents et caractères spéciaux définis
    const usernameRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ!@#$%^&*\-_=+?]+$/;

    if (!usernameRegex.test(username)) {
      return "Le nom d'utilisateur contient des caractères non autorisés.";
    }

    return false;
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Aucun mot de passe fourni.";
    }

    if (password.length < 4) {
      return "Le mot de passe doit contenir 4 caractères minimum.";
    }

    if (password.length > 20) {
      return "Le mot de passe doit contenir 20 caractères maximum.";
    }

    // Regex autorisant lettres, chiffres, accents et caractères spéciaux définis
    const passwordRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ!@#$%^&*\-_=+?]+$/;

    if (!passwordRegex.test(password)) {
      return "Le mot de passe contient des caractères non autorisés.";
    }

    return false;
  };

  const handlePasswordView = (e) => {
    setShowPassword(!showPassword);
    e.preventDefault();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (username && password) {
      if (typeof username !== "string" || typeof username !== "string") {
        setError("Les champs doivent êtres des chaînes de caractères");
        return;
      }
      username.trim();
      password.trim();

      if (validatePassword(password)) {
        setError(validatePassword(password));
        return;
      }
      if (validateUsername(username)) {
        setError(validateUsername(username));
        return;
      }

      showLoader();
      socket.emit(
        "user:login",
        {
          username,
          password,
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
