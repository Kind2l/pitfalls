import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const WaitingRoom = ({ setGameIsStarted }) => {
  const { socket, user } = useAuth();
  const { serverId } = useParams();

  // Utilisation de useState pour les joueurs, le nombre maximum de joueurs et l'auteur
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    // Rechercher le serveur à l'initialisation du composant
    socket.emit("server:find", { serverId: serverId }, (response) => {
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
    socket.emit("server:initalization", { serverId: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        console.log(response);
      }
    });
  };
  useEffect(() => {
    // Écoute des mises à jour du serveur
    socket.on("server:update", (data) => {
      console.log("update", data);
      setGameIsStarted(data.start);
      setPlayers(data.players);
      setMaxPlayers(data.maxPlayers);
      setGameIsStarted(data.start);
    });

    // Nettoyage de l'écouteur d'événements lors du démontage du composant
    return () => {
      socket.off("server:update");
    };
  }, [socket, setGameIsStarted]);

  return (
    <div>
      <h1>Bienvenue sur le serveur de jeu</h1>
      <p>ID du serveur : {serverId}</p>
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
      <button>Quitter la partie</button>
    </div>
  );
};

export default WaitingRoom;
