import React, { useState } from "react";
import { useAuth } from "../auth/SocketContext";

const Register = ({ setChoice }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { socket } = useAuth();

  // Regex patterns
  const usernameRegex = /^[a-zA-Z0-9_-]{4,19}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validation functions
  const validateUsername = (username) => {
    if (username.length < 4) {
      return "Le nom d'utilisateur doit être de 4 caractères minimum";
    }
    if (username.length > 13) {
      return "Le nom d'utilisateur doit être de 13 caractères maximum";
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
    if (password.length < 8) {
      return "Le mot de passe doit être de 8 caractères minimum";
    }
    if (password.length > 20) {
      return "Le mot de passe doit être de 20 caractères maximum";
    }
    if (!/[a-z]/.test(password)) {
      return "Mot de passe doit contenir au moins une minuscule";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mot de passe doit contenir au moins une majuscule";
    }
    if (!/\d/.test(password)) {
      return "Mot de passe doit contenir au moins un chiffre";
    }
    if (/[^a-zA-Z0-9$/\!?:#+]/.test(password)) {
      return "Caractères spéciaux autorisés pour le mot de passe:  $ / ! ? : # +";
    }
    return false;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedEmail = email.trim();

    const usernameError = validateUsername(trimmedUsername);
    const passwordError = validatePassword(trimmedPassword);
    const emailError = validateEmail(trimmedEmail);

    if (usernameError) {
      setError(usernameError);
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

    socket.emit(
      "user:register",
      {
        username: trimmedUsername,
        password: trimmedPassword,
        email: trimmedEmail,
      },
      (response) => {
        if (!response.success) {
          setError(response.message);
        } else {
          setError(response.message);
          setChoice(true);
        }
      }
    );
  };

  return (
    <>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="error">{error}</div>
        <button className="submit primary-button bg-blue" type="submit">
          Inscription
        </button>
      </form>
    </>
  );
};

export default Register;
