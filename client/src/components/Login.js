import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { socket, login } = useAuth();
  const [error, setError] = useState("");

  // Regex patterns
  const usernameRegex = /^[a-zA-Z0-9_-]{4,13}$/;

  // Validation functions
  const validateUsername = (username) => {
    if (username.length < 4) {
      return "Nom d'utilisateur trop court. Il doit faire au moins 4 caractères.";
    }
    if (username.length > 13) {
      return "Nom d'utilisateur trop long. Il doit faire au plus 13 caractères.";
    }
    if (!usernameRegex.test(username)) {
      return "Caractères spéciaux autorisés pour le nom d'utilisateur: - _";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir 8 caractères";
    }
    if (password.length > 20) {
      return "Le mot de passe doit contenir moins de 20 caractères";
    }
    if (!/[a-z]/.test(password)) {
      return "Mot de passe doit contenir au moins une minuscule.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mot de passe doit contenir au moins une majuscule.";
    }
    if (!/\d/.test(password)) {
      return "Mot de passe doit contenir au moins un chiffre.";
    }
    if (/[^a-zA-Z0-9$/\!?:#+]/.test(password)) {
      return "Caractères spéciaux autorisés pour le mot de passe :  $ / ! ? : # +";
    }
    return "";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (username && password) {
      socket.emit(
        "user:login",
        {
          username: username,
          password: password,
        },
        (response) => {
          if (!response.success) {
            setError(response.message);
          } else {
            login(response.data);
            navigate("/");
          }
        }
      );
    } else {
      setError("Complétez les champs ci-dessus");
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="error">{error}</div>
        <button className="submit primary-button bg-blue" type="submit">
          Connexion
        </button>
      </form>
    </>
  );
};

export default Login;
