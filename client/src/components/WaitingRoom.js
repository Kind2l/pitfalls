import { useAuth } from "@Auth/SocketContext";
import "@Styles/components/WaitingRoom.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WaitingRoom = ({ setGameIsStarted }) => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();
  const navigate = useNavigate();

  // Utilisation de useState pour les joueurs, le nombre maximum de joueurs et l'auteur
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    // Rechercher le serveur à l'initialisation du composant
    socket.emit("server:find", { server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        setGameIsStarted(response.data.start);
        setPlayers(response.data.players);
        setMaxPlayers(response.data.maxPlayers);
        setAuthor(response.data.author);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    socket.emit("server:initalization", { server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        console.log(response);
      }
    });
  };

  const handleLeaveServer = () => {
    socket.emit(
      "server:leave-server",
      { user, server_id: serverId },
      (response) => {
        if (!response.success) {
          console.error(response);
        } else {
          navigate(`/`);
        }
      }
    );
  };

  useEffect(() => {
    // Écoute des mises à jour du serveur
    socket.on("server:update", (data) => {
      setGameIsStarted(data.start);
      setPlayers(data.players);
      setMaxPlayers(data.maxPlayers);
      setGameIsStarted(data.start);
      setAuthor(data.author);
    });

    return () => {
      socket.off("server:update");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div className="waiting-room">
      <div className="waiting-room-content">
        <h2>Veuillez patienter</h2>
        <p>En attente du lancement de la partie par l'hôte...</p>
        <ul>
          {Object.keys(players).length > 0 ? (
            Object.values(players).map((player) => (
              <li key={player.id + player.username}>{player.username}</li>
            )) // Assurez-vous que chaque player a un id unique
          ) : (
            <li>Aucun joueur connecté.</li>
          )}
        </ul>
        {String(author) === String(user.username) &&
        Number(Object.keys(players).length) >= 2 &&
        Number(Object.keys(players).length) <= Number(maxPlayers) ? (
          <button onClick={() => handleSubmit()}>Démarrer la partie</button>
        ) : null}
        <button
          onClick={() => {
            handleLeaveServer();
          }}
        >
          Quitter la partie
        </button>
        <p className="id-server">ID du serveur : {serverId}</p>
      </div>
    </div>
  );
};

export default WaitingRoom;
