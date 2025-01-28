import { useAuth } from "@Auth/SocketContext";
import { useSound } from "@Auth/SoundContext";
import Header from "@Components/Header";
import WelcomerMessages from "@Components/WelcomerMessages";
import "@Styles/Home/Home.scss";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const { logout } = useAuth();
  const {
    playMusic,
    playEffect,
    currentMusicName,
    // stopMusic,
    // changeEffectVolume,
  } = useSound();

  useEffect(() => {
    console.log(currentMusicName);
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
          <p className="welcomer">
            <WelcomerMessages />
          </p>

          <div className="links">
            <Link
              className="primary-button bg-green"
              to="/server-list"
              onClick={() => handleLinkClick("open")}
              aria-label="Rejoindre une partie"
            >
              Rejoindre une partie
            </Link>
            <Link
              className="primary-button bg-blue"
              to="/create-server"
              onClick={() => handleLinkClick("open")}
              aria-label="Créer une partie"
            >
              Créer une partie
            </Link>
            <Link
              className="primary-button bg-orange"
              to="/settings"
              onClick={() => handleLinkClick("open")}
              aria-label="Options"
            >
              Options
            </Link>
            <Link
              className="primary-button bg-red"
              to="/"
              onClick={() => {
                handleLinkClick("close");
                logout();
              }}
              aria-label="Déconnexion"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
