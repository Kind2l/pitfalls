import { useAuth } from "@Auth/SocketContext";
import Header from "@Components/Header";
import Login from "@Components/Login";
import Register from "@Components/Register";
import "@Styles/Connection.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Connection = () => {
  const [choice, setChoice] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    isAuthenticated && navigate("/");
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Header />
      <main className="connection">
        <div className="connection-selector">
          <input
            type="radio"
            id="login"
            name="auth"
            checked={choice === true}
            onChange={() => setChoice(true)}
          />
          <label htmlFor="login">Connexion</label>

          <input
            type="radio"
            id="register"
            name="auth"
            checked={choice === false}
            onChange={() => setChoice(false)}
          />
          <label htmlFor="register">Inscription</label>
        </div>

        <div className="connection-content">
          {choice === true ? <Login /> : <Register />}
        </div>
      </main>
    </>
  );
};

export default Connection;
