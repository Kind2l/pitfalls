import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import Header from "@Components/Header";
import Login from "@Components/Login";
import "@Styles/connection/Connection.scss";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import News from "../components/News";

const Connection = () => {
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
        <div className="connection-container">
          <Login />
          <div className="info">
            Pitfalls est en développement et le serveur s’éteint en cas
            d'inactivité. Si c'est le cas, veuillez patienter quelques secondes
            pour son redémarrage.
          </div>
        </div>
        <News />
      </main>
    </>
  );
};

export default Connection;
