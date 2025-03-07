import Header from "@Components/Header";
import WelcomerMessages from "@Components/WelcomerMessages";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/home/Home.scss";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const { handleLogout } = useAuth();
  const { addNotification } = useNotification();

  const { playMusic, playEffect, currentMusicName } = useSound();

  useEffect(() => {
    if (currentMusicName) {
      if (String(currentMusicName) === "bghome") {
        return;
      }
    }
    playMusic("bghome");
  }, []);

  // Fonction pour jouer un effet sonore
  const handleLinkClick = (effectName) => {
    playEffect(effectName);
  };

  return (
    <>
      <Header />
      <main className="home">
        <div className="home-content">
          <WelcomerMessages />
          <div className="links">
            <Link
              className="bg-green"
              to="/server-list"
              onClick={() => handleLinkClick("open")}
              aria-label="Rejoindre une partie"
            >
              <i className="fa-solid fa-flag-checkered"></i>
              <span>Rejoindre une partie</span>
            </Link>

            <Link
              className="bg-blue"
              to="/create-server/classic"
              onClick={() => handleLinkClick("open")}
              aria-label="Classique"
            >
              <i className="fa-solid fa-gamepad"></i>
              Créer une partie
            </Link>

            <div className="settings-container">
              <Link
                className="bg-black"
                to="/settings"
                onClick={() => handleLinkClick("open")}
                aria-label="Options"
              >
                <i className="fa-solid fa-sliders"></i>
                <span>Options</span>
              </Link>
              <Link
                className="bg-sky"
                to="/rules"
                onClick={() => {
                  handleLinkClick("open");
                }}
                aria-label="Règles du jeu"
              >
                <i className="fa-regular fa-lightbulb"></i>
                <span>Règles du jeu</span>
              </Link>
            </div>

            <Link
              className="bg-orange"
              to="/profile"
              onClick={() => {
                handleLinkClick("open");
              }}
              aria-label="Mon profil"
            >
              <i className="fa-regular fa-user"></i>
              <span>Mon profil</span>
            </Link>

            <Link
              className="bg-blue"
              to="/android-test"
              onClick={() => {
                handleLinkClick("open");
              }}
              aria-label="Application Android"
            >
              <i className="fa-brands fa-google-play"></i>
              <span>Télécharger sur Android</span>
            </Link>

            <Link
              className="bg-red"
              to="/"
              onClick={() => {
                handleLinkClick("close");
                addNotification("Vous êtes déconnecté.");

                handleLogout();
              }}
              aria-label="Déconnexion"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Déconnexion</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
