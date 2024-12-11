import { useAuth } from "@Auth/SocketContext";
import "@Styles/CreateServer.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

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
          addPlayerToServer(response.data.server_id);
        }
      }
    );
  };

  const addPlayerToServer = (server_id) => {
    socket.emit("server:join", { user, server_id }, (response) => {
      if (!response.success) {
        setErrorMessage(response.message);
      } else {
        navigate(`/game/${server_id}`);
      }
    });
  };

  const handlePlayerCountChange = (event) => {
    setMaxPlayers(Number(event.target.value));
  };

  return (
    <div className="create-server">
      <form className="create-server-content" onSubmit={handleSubmit}>
        <h2>Créer une partie</h2>
        <section>
          <input
            type="text"
            placeholder="Nom du serveur"
            id="server-name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            required
          />
        </section>

        <section>
          <h3>Nombre de joueurs</h3>
          <div className="player-selection">
            {[2, 3, 4].map((playerCount) => (
              <div key={playerCount + "key"}>
                <input
                  id={playerCount + "players"}
                  type="radio"
                  name="max-players"
                  value={playerCount}
                  checked={maxPlayers === playerCount}
                  onChange={handlePlayerCountChange}
                />
                <label htmlFor={playerCount + "players"} key={playerCount}>
                  {playerCount}
                </label>
              </div>
            ))}
          </div>
        </section>

        {errorMessage && <p className="error">{errorMessage}</p>}

        <button type="submit">Créer Serveur</button>
        <BackButton />
      </form>
    </div>
  );
};

export default CreateServer;
