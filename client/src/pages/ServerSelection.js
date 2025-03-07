import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";

import BackButton from "@Components/BackButton";
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
    navigate(`/game/${server.id}`);
  };

  const filteredServers = Object.values(servers).filter(
    (server) =>
      server?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server?.host?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ServerItem = ({ server }) => {
    if (!server) return null;

    const isFull =
      server.players && Object.keys(server.players).length >= server.maxPlayers;
    const isStarted = server.start;

    return (
      <button
        className={`server ${isFull || isStarted ? "bg-red" : "bg-green"}`}
        disabled={isFull || isStarted}
        onClick={() => {
          isFull || isStarted ? playEffect("close") : playEffect("open");
          handleServerJoin(server);
        }}
      >
        <div className="server-infos">
          <span className="server-name">{server.name || "Nom inconnu"}</span>
          <span className="server-players">
            {`${Object.keys(server?.players || {}).length}/${
              server?.maxPlayers || 0
            } joueurs`}
          </span>
          <span className="server-type">
            {" "}
            {server.type === "classic"
              ? "Classique"
              : server.type === "classic"
              ? "Hardcore"
              : server.type === "infinite"
              ? "Jusqu'à l'hotel"
              : server.type === "custom"
              ? "Personnalisé"
              : "undefined"}
          </span>
          <span className="server-host">{server.host || "Auteur inconnu"}</span>
        </div>
        <div className="server-button">
          <i
            className={`fa-solid fa-arrow-right ${
              isFull || isStarted ? "bg-red" : "bg-green"
            }`}
          ></i>
        </div>
      </button>
    );
  };

  return (
    <div className="server-selection page">
      <div className="page-content">
        <h2 className="page-title">Rejoindre une partie</h2>

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
            to="/create-server/classic"
            className="color-orange"
            onClick={() => playEffect("open")}
          >
            créer une partie
          </Link>{" "}
          !
        </p>
      </div>

      {errorMessage && (
        <div className="server-selection-error">
          <p className="error">{errorMessage}</p>
        </div>
      )}
      <BackButton />
    </div>
  );
};

export default ServerSelection;
