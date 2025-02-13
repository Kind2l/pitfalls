import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import Header from "@Components/Header";
import Login from "@Components/Login";
import Register from "@Components/Register";
import "@Styles/connection/Connection.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameRules from "../components/GameRules";
import Guest from "../components/Guest";
import News from "../components/News";

const Connection = () => {
  const [choice, setChoice] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stopMusic, playEffect } = useSound();

  useEffect(() => {
    isAuthenticated && navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return stopMusic();
  }, []);

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
            onChange={() => {
              playEffect("open");
              setChoice(true);
            }}
          />
          <label htmlFor="login">Connexion</label>

          <input
            type="radio"
            id="register"
            name="auth"
            checked={choice === false}
            onChange={() => {
              playEffect("close");
              setChoice(false);
            }}
          />
          <label htmlFor="register">Inscription</label>
        </div>

        <div className="connection-content">
          {choice === true ? <Login /> : <Register setChoice={setChoice} />}
          <Guest />
        </div>

        <GameRules />
        <News />
      </main>
    </>
  );
};

export default Connection;
