import Header from "@Components/Header";
import WelcomerMessages from "@Components/WelcomerMessages";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/home/Home.scss";
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
              className="bg-green"
              to="/server-list"
              onClick={() => handleLinkClick("open")}
              aria-label="Rejoindre une partie"
            >
              <i class="fa-solid fa-flag-checkered"></i>
              <span>Rejoindre une partie</span>
            </Link>
            <Link
              className="bg-blue"
              to="/create-server"
              onClick={() => handleLinkClick("open")}
              aria-label="Créer une partie"
            >
              <i class="fa-solid fa-gamepad"></i>
              <span>Créer une partie</span>
            </Link>
            <Link
              className="bg-orange"
              to="/settings"
              onClick={() => handleLinkClick("open")}
              aria-label="Options"
            >
              <i class="fa-solid fa-sliders"></i>
              <span>Options</span>
            </Link>
            <Link
              className="bg-red"
              to="/"
              onClick={() => {
                handleLinkClick("close");
                logout();
              }}
              aria-label="Déconnexion"
            >
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Déconnexion</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
