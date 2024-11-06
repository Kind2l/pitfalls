import { useAuth } from "@Auth/SocketContext";
import BackButton from "@Components/BackButton";
import "@Styles/ServerSelection.scss";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ServerSelection = () => {
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
    <div className="server-selection">
      <div className="server-selection-content">
        <h2>Rejoindre une partie</h2>
        <ul className="list">
          {Object.keys(servers).length > 0 ? (
            Object.values(servers).map((server) => (
              <li
                key={server.id}
                className={
                  Object.keys(server.players).length === server.maxPlayers
                    ? "list-item full"
                    : "list-item"
                }
              >
                <span className="server-name">{server.name}</span>
                <span className="server-players">
                  {`${Object.keys(server.players).length}/${
                    server.maxPlayers
                  } joueurs`}
                </span>
                <button
                  className="primary-button green"
                  onClick={() => {
                    Object.keys(server.players).length !== server.maxPlayers &&
                      handleServerJoin(server);
                  }}
                >
                  Rejoindre
                </button>
              </li>
            ))
          ) : (
            <li className="empty">Aucune partie n'est disponible</li>
          )}
        </ul>
        <p>
          Vous pouvez aussi <Link to={"/create-server"}>créer une partie</Link>
          {" !"}
        </p>
        <BackButton />
      </div>
      <div className="server-selection-error">
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default ServerSelection;
