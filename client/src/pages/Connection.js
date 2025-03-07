import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import Login from "@Components/Connection/Login";
import Register from "@Components/Connection/Register";
import Header from "@Components/Header";
import "@Styles/Connection/Connection.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Guest from "../components/Connection/Guest";

const Connection = () => {
  const [choice, setChoice] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { stopMusic } = useSound();

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
        <div>
          <div className="connection-selector">
            <input
              type="radio"
              id="login"
              name="auth"
              checked={choice === true}
              onChange={() => {
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
                setChoice(false);
              }}
            />
            <label htmlFor="register">Inscription</label>
          </div>
          <div className="connection-container">
            {choice === true ? <Login /> : <Register setChoice={setChoice} />}
          </div>
        </div>
        <div className="connection-container rounded">
          <Guest />
        </div>
      </main>
    </>
  );
};

export default Connection;
