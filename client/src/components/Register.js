import React, { useState } from "react";
import { useAuth } from "../auth/SocketContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { socket } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    socket.emit(
      "user:register",
      {
        username: username,
        email: email,
        password: password,
      },
      (response) => {
        if (!response.success) {
          setError(response.message);
        } else {
          console.log(response.data);
          setError(response.message);
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
        <button className="submit primary-button blue" type="submit">
          S'inscrire
        </button>
      </form>
    </>
  );
};

export default Register;
