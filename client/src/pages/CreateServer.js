import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";

const CreateServer = () => {
  const [serverName, setServerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [errorMessage, setErrorMessage] = useState("");
  const { socket, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!serverName) {
      setErrorMessage("Le nom du serveur est requis.");
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 4) {
      setErrorMessage("Le nombre de joueurs doit être compris entre 2 et 4.");
      return;
    }

    createServer();
  };

  const createServer = () => {
    socket.emit(
      "server:create",
      { user, serverName, maxPlayers },
      (response) => {
        if (!response.success) {
          setErrorMessage(response.message);
        } else {
          const serverId = response.data.server.id;
          addPlayerToServer(serverId);
        }
      }
    );
  };

  const addPlayerToServer = (serverId) => {
    socket.emit("server:add-player", { user, serverId }, (response) => {
      if (!response.success) {
        setErrorMessage(response.message);
      } else {
        navigate(`/game/${serverId}`);
      }
    });
  };

  const handlePlayerCountChange = (event) => {
    setMaxPlayers(Number(event.target.value));
  };

  return (
    <main id="create-server">
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Nom du serveur</h3>
          <input
            type="text"
            id="server-name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            required
          />
        </div>

        <div>
          <h3>Nombre de joueurs</h3>
          <div className="player-selection">
            {[2, 3, 4].map((playerCount) => (
              <label key={playerCount}>
                <input
                  type="radio"
                  name="max-players"
                  value={playerCount}
                  checked={maxPlayers === playerCount}
                  onChange={handlePlayerCountChange}
                />
                {playerCount}
              </label>
            ))}
          </div>
        </div>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button type="submit">Créer Serveur</button>
      </form>
    </main>
  );
};

export default CreateServer;
