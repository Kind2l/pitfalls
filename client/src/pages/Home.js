import { useAuth } from "@Auth/SocketContext";
import Header from "@Components/Header";
import { useSound } from "@Components/SoundContext";
import WelcomerMessages from "@Components/WelcomerMessages";
import "@Styles/Home.scss";
import { Link } from "react-router-dom";

const Home = () => {
  const { playBackgroundMusic, playEffect } = useSound(); // Déstructuration de playEffect
  const { logout } = useAuth();

  // Fonction pour jouer l'effet "open" au clic
  const handleLinkClick = (effectName) => {
    playEffect(effectName); // Appelle l'effet "open" (par exemple 'open' comme effet sonore)
  };

  return (
    <>
      <Header />
      <main className="home">
        <div className="home-content">
          <p className="welcomer">{<WelcomerMessages />}</p>

          <div className="links">
            <Link
              className="primary-button bg-green"
              to="/server-list"
              onClick={() => handleLinkClick("open")}
            >
              Rejoindre une partie
            </Link>
            <Link
              className="primary-button bg-blue"
              to="/create-server"
              onClick={() => handleLinkClick("open")}
            >
              Créer une partie
            </Link>
            <Link
              className="primary-button bg-orange"
              to="/settings"
              onClick={() => handleLinkClick("open")}
            >
              Options
            </Link>
            <Link
              className="primary-button bg-red"
              to="/"
              onClick={() => {
                handleLinkClick("open"); // Jouer l'effet "open"
                logout();
              }}
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
