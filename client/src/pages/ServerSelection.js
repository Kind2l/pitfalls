import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import "@Styles/ServerSelection.scss";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ServerSelection = () => {
  const [servers, setServers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const { socket, user } = useAuth();
  const { playEffect } = useSound();

  const navigate = useNavigate();

  // Récupère la liste des serveurs lors du premier chargement
  useEffect(() => {
    const fetchServers = () => {
      socket.emit("server:get-list", { user }, (response) => {
        if (response?.success && response.data?.servers) {
          setServers(response.data.servers);
        } else {
          setErrorMessage(response?.message || "Une erreur est survenue.");
        }
      });
    };

    fetchServers();
  }, [socket, user]);

  useEffect(() => {
    const handleServerListUpdate = (data) => {
      if (data?.servers) {
        setServers(data.servers);
      }
    };

    socket.on("subscription:server-list", handleServerListUpdate);
    return () => socket.off("subscription:server-list", handleServerListUpdate);
  }, [socket]);

  const handleServerJoin = (server) => {
    if (!server || !server.id) return;

    socket.emit("server:join", { user, server_id: server.id }, (response) => {
      if (response?.success && response.data?.server) {
        navigate(`/game/${response.data.server.id}`);
      } else {
        setErrorMessage(
          response?.message || "Impossible de rejoindre le serveur."
        );
      }
    });
  };

  const filteredServers = Object.values(servers).filter(
    (server) =>
      server?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server?.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ServerItem = ({ server }) => {
    if (!server) return null;

    const isFull =
      server.players && Object.keys(server.players).length >= server.maxPlayers;
    const isStarted = server.start;

    return (
      <li className="list-item">
        <span className="server-name">{server.name || "Nom inconnu"}</span>
        <span className="server-players">
          {`${Object.keys(server?.players || {}).length}/${
            server?.maxPlayers || 0
          } joueurs`}
        </span>
        <span className="server-custom">
          {server.custom && Object.keys(server.custom).length > 0
            ? "Partie personnalisée"
            : "Partie classique"}
        </span>
        <span className="server-author">
          {server.author || "Auteur inconnu"}
        </span>
        <button
          className={`primary-button ${
            isFull || isStarted ? "bg-red" : "bg-green"
          }`}
          disabled={isFull || isStarted}
          onClick={() => {
            isFull || isStarted ? playEffect("close") : playEffect("open");
            handleServerJoin(server);
          }}
        >
          {isStarted ? "En cours" : isFull ? "Complet" : "Rejoindre"}
        </button>
      </li>
    );
  };

  return (
    <>
      <Header />
      <div className="server-selection">
        <div className="server-selection-content">
          <h2>Rejoindre une partie</h2>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher par nom ou auteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <ul className="list">
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => (
                <ServerItem key={server.id} server={server} />
              ))
            ) : (
              <li className="empty">Aucune partie disponible</li>
            )}
          </ul>

          <p>
            Vous pouvez aussi{" "}
            <Link
              to="/create-server"
              className="color-orange"
              onClick={() => playEffect("open")}
            >
              créer une partie
            </Link>{" "}
            !
          </p>

          <div className="buttons">
            <BackButton />
          </div>
        </div>

        {errorMessage && (
          <div className="server-selection-error">
            <p className="error">{errorMessage}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ServerSelection;
