import Header from "@Components/Header";
import { useNotification } from "@Context/NotificationContext.js";
import { useAuth } from "@Context/SocketContext";
import "@Styles/components/WaitingRoom.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ImageLoader from "./ImageLoader";

const WaitingRoom = ({ setGameIsStarted }) => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();
  const navigate = useNavigate();

  // Utilisation de useState pour les joueurs, le nombre maximum de joueurs et l'auteur
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [author, setAuthor] = useState("null");

  const [serverName, setserverName] = useState("");
  const { addNotification } = useNotification();

  useEffect(() => {
    // Rechercher le serveur à l'initialisation du composant
    socket.emit("server:find", { user, server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        setGameIsStarted(response.data.start);
        setPlayers(response.data.players);
        setMaxPlayers(response.data.maxPlayers);
        setAuthor(response.data.author);
        setserverName(response.data.name);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    socket.emit(
      "server:initalization",
      { user, server_id: serverId },
      (response) => {
        if (!response.success) {
          console.error(response);
        } else {
          console.log(response);
        }
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pitfalls - Invitation à une partie", // Titre de la page
          text: `Je t'invite à me rejoindre sur le jeu Pitfalls! Ma partie s'appelle "${serverName}" !`,
          url: "https://pitfalls.kindll.fr",
        });
        console.log("Partage réussi");
      } catch (error) {
        console.error("Échec du partage", error);
      }
    } else {
      navigator.clipboard.writeText("https://pitfalls.kindll.fr");
      addNotification("Lien copié dans le presse-papiers !");
    }
  };

  const handleLeaveServer = () => {
    socket.emit("server:leave", { user, server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        navigate(`/`);
      }
    });
  };

  useEffect(() => {
    // Écoute des mises à jour du serveur
    socket.on("server:update", (data) => {
      if (data) {
        data.start && setGameIsStarted(data.start);
        data.players && setPlayers(data.players);
        data.maxPlayers && setMaxPlayers(data.maxPlayers);
        data.author && setAuthor(data.author);
      }
    });

    return () => {
      socket.off("server:update");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <>
      <Header />
      <div className="waiting-room">
        <div className="waiting-room-content">
          <div className="waiting-room-infos">
            <h2 className="cherry-font">{serverName}</h2>
            <p>Hôte : {author}</p>
            <p>
              {Object.keys(players)?.length || "0"}/{maxPlayers} joueurs
            </p>
          </div>

          <ul className="waiting-room-players">
            {Object.keys(players).length > 0 ? (
              Object.values(players).map((player) => (
                <li key={player.id + player.username}>{player.username}</li>
              )) // Assurez-vous que chaque player a un id unique
            ) : (
              <li>Aucun joueur connecté.</li>
            )}
          </ul>
          <p>
            En attente du lancement de la partie par {author || "l'hôte"}...
          </p>

          <div className="waiting-room-content__buttons">
            {String(author) === String(user.username) &&
            Number(Object.keys(players).length) >= 2 &&
            Number(Object.keys(players).length) <= Number(maxPlayers) ? (
              <button
                className="primary-button bg-green"
                onClick={() => handleSubmit()}
              >
                Démarrer la partie
              </button>
            ) : null}
            <button
              className="primary-button bg-red"
              onClick={() => {
                handleLeaveServer();
              }}
            >
              Quitter la partie
            </button>
          </div>
          <p className="id-server">ID du serveur : {serverId}</p>
          <button className="share-button" onClick={() => handleShare()}>
            <ImageLoader name="img_share" alt="bouton de partage" />
          </button>
        </div>
      </div>
    </>
  );
};

export default WaitingRoom;
