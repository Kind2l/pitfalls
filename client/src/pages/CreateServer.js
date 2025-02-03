import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/CreateServer.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateServer = () => {
  const [serverName, setServerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCustomServer, setIsCustomServer] = useState(false);
  const [cardCounts, setCardCounts] = useState({
    feurouge: { count: 5, minCount: 5, maxCount: 15, name: "Feu rouge" },
    zonedecontrole: {
      count: 4,
      minCount: 4,
      maxCount: 12,
      name: "Zone de contrôle",
    },
    embouteillage: {
      count: 3,
      minCount: 3,
      maxCount: 9,
      name: "Embouteillage",
    },
    fatigue: { count: 3, minCount: 3, maxCount: 9, name: "fatigue" },
    accident: { count: 3, minCount: 3, maxCount: 9, name: "Accident" },
    feuvert: { count: 14, minCount: 14, maxCount: 42, name: "Feu vert" },
    findezonedecontrole: {
      count: 6,
      minCount: 6,
      maxCount: 18,
      name: "Fin de zone de contrôle",
    },
    findembouteillage: {
      count: 6,
      minCount: 6,
      maxCount: 18,
      name: "Fin d'embouteillage",
    },
    repose: {
      count: 6,
      minCount: 6,
      maxCount: 18,
      name: "En forme",
    },
    reparation: { count: 6, minCount: 6, maxCount: 18, name: "Réparation" },
    25: { count: 10, minCount: 10, maxCount: 30, name: "25 Kms" },
    50: { count: 10, minCount: 10, maxCount: 30, name: "50 Kms" },
    75: { count: 10, minCount: 10, maxCount: 30, name: "75 Kms" },
    100: { count: 12, minCount: 12, maxCount: 36, name: "100 Kms" },
    200: { count: 4, minCount: 4, maxCount: 12, name: "200 Kms" },
  });

  const { socket, user } = useAuth();
  const navigate = useNavigate();
  const { playEffect } = useSound();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!serverName) {
      setErrorMessage("Le nom du serveur est requis.");
      return;
    }

    // Validation du nom du serveur
    if (serverName.length > 35) {
      setErrorMessage("Le nom du serveur est de maximum 35 caractères");
      return;
    }

    if (serverName.length < 2) {
      setErrorMessage("Le nom du serveur est de minimum 2 caractères");
      return;
    }
    if (maxPlayers < 2 || maxPlayers > 4) {
      setErrorMessage("Le nombre de joueurs doit être compris entre 2 et 4.");
      return;
    }

    if (isCustomServer) {
      const isValid = Object.keys(cardCounts).every((key) => {
        const { count, minCount, maxCount } = cardCounts[key];
        return count >= minCount && count <= maxCount;
      });

      if (!isValid) {
        setErrorMessage(
          "Les valeurs des cartes doivent être comprises entre la valeur par défaut et trois fois cette valeur."
        );
        return;
      }
    }

    createServer();
  };

  const createServer = () => {
    // Vérification des variables nécessaires
    if (!user || !serverName || !socket) {
      console.error(
        "Des informations nécessaires pour créer le serveur sont manquantes."
      );
      setErrorMessage(
        "Impossible de créer le serveur. Veuillez vérifier les informations fournies."
      );
      return;
    }

    // Construction des données pour les cartes si le serveur est personnalisé
    const cardData = isCustomServer
      ? {
          feurouge: cardCounts?.feurouge?.count || 5,
          zonedecontrole: cardCounts?.zonedecontrole?.count || 4,
          pannedessence: cardCounts?.pannedessence?.count || 3,
          fatigue: cardCounts?.fatigue?.count || 3,
          accident: cardCounts?.accident?.count || 3,
          feuvert: cardCounts?.feuvert?.count || 14,
          findezonedecontrole: cardCounts?.findezonedecontrole?.count || 6,
          essence: cardCounts?.essence?.count || 6,
          repose: cardCounts?.repose?.count || 6,
          reparation: cardCounts?.reparation?.count || 6,
          25: cardCounts?.[25]?.count || 10,
          50: cardCounts?.[50]?.count || 10,
          75: cardCounts?.[75]?.count || 10,
          100: cardCounts?.[100]?.count || 12,
          200: cardCounts?.[200]?.count || 4,
        }
      : null;

    // Émission de l'événement au serveur via socket
    socket.emit(
      "server:create",
      {
        user,
        serverName: String(serverName).trim(),
        maxPlayers: Number(maxPlayers),
        cardCounts: cardData,
      },
      (response) => {
        // Gestion de la réponse
        if (!response?.success) {
          console.error(
            "Erreur lors de la création du serveur :",
            response?.message || "Réponse inconnue."
          );
          setErrorMessage(
            response?.message ||
              "Une erreur est survenue lors de la création du serveur."
          );
        } else {
          addPlayerToServer(response?.data?.server_id);
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
    <>
      <Header />
      <main className="create-server">
        <div className="create-server-container">
          <h2>Créer une partie</h2>
          <div className="create-server-title">
            <input
              type="text"
              placeholder="Nom de la partie"
              id="server-name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              minLength={2}
              maxLength={30}
              required
            />
          </div>
          <h3>Type de partie</h3>
          <div className="server-type-selection">
            <input
              id="standard-server"
              type="radio"
              name="server-type"
              value="standard"
              checked={!isCustomServer}
              onChange={() => setIsCustomServer(false)}
            />
            <label htmlFor="standard-server">Classique</label>

            <input
              id="custom-server"
              type="radio"
              name="server-type"
              value="custom"
              checked={isCustomServer}
              onChange={() => setIsCustomServer(true)}
            />
            <label htmlFor="custom-server">Personnalisée</label>
          </div>
          <form onSubmit={handleSubmit} className="create-server-content">
            {isCustomServer && (
              <div className="create-server-custom">
                <h3>Définissez le nombre de cartes</h3>

                {/* Cartes d'attaque */}
                <div className="card-group attack">
                  <h4>Cartes d'attaque</h4>
                  <div className="card-counts">
                    {[
                      "fatigue",
                      "accident",
                      "embouteillage",
                      "zonedecontrole",
                      "feurouge",
                    ].map((key) => (
                      <div key={key} className="card-counts__element">
                        <div className="card-counts__title">
                          {cardCounts[key].name}
                        </div>
                        <div className="card-counts__buttons">
                          <button
                            type="button"
                            className=" color-red"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.max(
                                    prevCounts[key].count - 1,
                                    prevCounts[key].minCount
                                  ),
                                },
                              }))
                            }
                          >
                            -
                          </button>
                          <span>{cardCounts[key].count}</span>
                          <button
                            type="button"
                            className=" color-green"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.min(
                                    prevCounts[key].count + 1,
                                    prevCounts[key].maxCount
                                  ),
                                },
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cartes de parade */}
                <div className="card-group parade">
                  <h4>Cartes de parade</h4>
                  <div className="card-counts">
                    {[
                      "feuvert",
                      "findezonedecontrole",
                      "findembouteillage",
                      "repose",
                      "reparation",
                    ].map((key) => (
                      <div key={key} className="card-counts__element">
                        <div className="card-counts__title">
                          {cardCounts[key].name}
                        </div>
                        <div className="card-counts__buttons">
                          <button
                            type="button"
                            className=" color-red"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.max(
                                    prevCounts[key].count - 1,
                                    prevCounts[key].minCount
                                  ),
                                },
                              }))
                            }
                          >
                            -
                          </button>
                          <span>{cardCounts[key].count}</span>
                          <button
                            type="button"
                            className=" color-green"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.min(
                                    prevCounts[key].count + 1,
                                    prevCounts[key].maxCount
                                  ),
                                },
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cartes de distance */}
                <div className="card-group borne">
                  <h4>Cartes de distance</h4>
                  <div className="card-counts">
                    {["25", "50", "75", "100", "200"].map((key) => (
                      <div key={key} className="card-counts__element">
                        <div className="card-counts__title">
                          {cardCounts[key].name}
                        </div>
                        <div className="card-counts__buttons">
                          <button
                            type="button"
                            className=" color-red"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.max(
                                    prevCounts[key].count - 1,
                                    prevCounts[key].minCount
                                  ),
                                },
                              }))
                            }
                          >
                            -
                          </button>
                          <span>{cardCounts[key].count}</span>
                          <button
                            type="button"
                            className=" color-green"
                            onClick={() =>
                              setCardCounts((prevCounts) => ({
                                ...prevCounts,
                                [key]: {
                                  ...prevCounts[key],
                                  count: Math.min(
                                    prevCounts[key].count + 1,
                                    prevCounts[key].maxCount
                                  ),
                                },
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
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
            </div>

            {errorMessage && <p className="error">{errorMessage}</p>}
            <div className="buttons">
              <BackButton />
              <button
                className="primary-button bg-blue"
                type="submit"
                onClick={() => playEffect("open")}
              >
                Créer la partie
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateServer;
