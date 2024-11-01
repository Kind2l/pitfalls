import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const Join = () => {
  const [servers, setServers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const { socket, user } = useAuth();
  const navigate = useNavigate();

  // Récupère la liste des serveurs lors du premier chargement
  useEffect(() => {
    socket.emit("server:get-list", {}, (response) => {
      if (response.success) {
        setServers(response.data.servers);
      } else {
        setErrorMessage(response.message);
      }
    });
  }, [socket]);

  // Met à jour la liste des serveurs en temps réel
  useEffect(() => {
    socket.on("subscription:server-list", (data) => {
      setServers(data.servers);
    });

    return () => {
      socket.off("subscription:server-list");
    };
  }, [socket]);

  // Permet de rejoindre le serveur suite au clic.
  const handleServerJoin = (server) => {
    socket.emit("server:join", { user, serverId: server.id }, (response) => {
      if (response.success) {
        navigate(`/game/${response.data.server.id}`);
      } else {
        setErrorMessage(response.message);
      }
    });
  };

  return (
    <main id="join">
      <h1>Rejoindre un Serveur</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}

      <ul className="server-list">
        {Object.keys(servers).length > 0 ? (
          Object.values(servers).map((server) => (
            <li key={server.id} className="server-item">
              <span className="server-name">{server.name}</span>
              <span className="server-players">
                {`${Object.keys(server.players).length}/${
                  server.maxPlayers
                } joueurs`}
              </span>
              <button onClick={() => handleServerJoin(server)}>
                Rejoindre
              </button>
            </li>
          ))
        ) : (
          <li>Aucun serveur disponible</li>
        )}
      </ul>
    </main>
  );
};

export default Join;
