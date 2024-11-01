import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { socket, login } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
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
      setError("Veuillez compléter les champs");
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
        <button className="submit" type="submit">
          Se connecter
        </button>
      </form>
    </>
  );
};

export default Login;
