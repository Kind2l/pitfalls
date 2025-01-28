import { useLoader } from "@Auth/LoaderContext";
import { useNotification } from "@Auth/NotificationContext.js";
import { useAuth } from "@Auth/SocketContext";
import { useSound } from "@Auth/SoundContext";
import "@Styles/Connection/Register.scss";
import React, { useState } from "react";

const Register = ({ setChoice }) => {
  const { socket } = useAuth();
  const { hideLoader, showLoader } = useLoader();
  const { addNotification } = useNotification();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const { playEffect } = useSound();

  // Regex patterns
  const usernameRegex =
    /^(?!.*[-_]$)(?![-_])[a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\-_.]{4,20}$/;
  const passwordRegex = /^[a-zA-Z0-9$/!?:#+]{6,24}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validation functions
  const validateUsername = (username) => {
    if (username.length < 4) {
      return "Le nom d'utilisateur doit contenir 4 caractères minimum.";
    }
    if (username.length > 20) {
      return "Le nom d'utilisateur doit contenir 12 caractères maximum.";
    }
    if (!usernameRegex.test(username)) {
      return "Caractères spéciaux autorisés pour le nom d'utilisateur: - _";
    }
    return false;
  };

  const validateEmail = (email) => {
    if (!emailRegex.test(email)) {
      return "Email invalide.";
    }
    return "";
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
    console.log(passwordRegex.test(password));

    if (!passwordRegex.test(password)) {
      return "Caractères spéciaux autorisés pour le mot de passe :  $ / ! ? : # +";
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

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedPasswordRepeat = passwordRepeat.trim();
    const trimmedEmail = email.trim();

    const usernameError = validateUsername(trimmedUsername);
    const passwordError = validatePassword(trimmedPassword);
    const passwordRepeatError = validatePassword(trimmedPasswordRepeat);
    const emailError = validateEmail(trimmedEmail);

    if (usernameError) {
      setError(usernameError);
      addNotification(usernameError);

      return;
    }

    if (emailError) {
      setError(emailError);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (passwordRepeatError) {
      setError(passwordRepeatError);
      return;
    }

    if (passwordRepeat !== password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (username && password && passwordRepeat) {
      showLoader();
      socket.emit(
        "user:register",
        {
          username: trimmedUsername,
          password: trimmedPassword,
          email: trimmedEmail,
        },
        (response) => {
          hideLoader();
          if (!response.success) {
            setError(response.message);
          } else {
            addNotification("Inscription réussie.");
            setTimeout(() => {
              setChoice(true);
            }, 2000);
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              <img
                src={`./images/${showPassword ? "open-eye" : "close-eye"}.svg`}
                alt="Afficher ou non le mot de passe"
              />
            </button>
          )}
        </div>
        <div className="form-input">
          <input
            type="password"
            placeholder="Confirmation du mot de passe"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            minLength={6}
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
