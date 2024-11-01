import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import WelcomerMessages from "../components/WelcomerMessages";

const Home = () => {
  return (
    <>
      <Header />
      <main className="home">
        <div className="home-content">
          <p className="welcomer">{<WelcomerMessages />}</p>

          <div className="links">
            <Link to="/server-list">Rejoindre une partie</Link>
            <Link to="/create-server">Créer une partie</Link>
            <Link to="/">Options</Link>
            <Link to="/">Déconnexion</Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
