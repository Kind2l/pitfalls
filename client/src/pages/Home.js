import { useAuth } from "@Auth/SocketContext";
import Header from "@Components/Header";
import WelcomerMessages from "@Components/WelcomerMessages";
import "@Styles/Home.scss";
import { Link } from "react-router-dom";

const Home = () => {
  const { logout } = useAuth();
  return (
    <>
      <Header />
      <main className="home">
        <div className="home-content">
          <p className="welcomer">{<WelcomerMessages />}</p>

          <div className="links">
            <Link className="primary-button green" to="/server-list">
              Rejoindre une partie
            </Link>
            <Link className="primary-button blue" to="/create-server">
              Créer une partie
            </Link>
            <Link className="primary-button orange" to="/">
              Options
            </Link>
            <Link
              className="primary-button red"
              to="/"
              onClick={() => {
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
