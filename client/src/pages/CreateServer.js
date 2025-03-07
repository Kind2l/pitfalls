import BackButton from "@Components/BackButton";
import { useAuth } from "@Context/SocketContext";
import { useSound } from "@Context/SoundContext";
import "@Styles/CreateServer.scss";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CreateServer = () => {
  const { type } = useParams();
  const [serverName, setServerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [errorMessage, setErrorMessage] = useState("");
  const [serverType, setServerType] = useState(type || "classic");
  const [requiredScore, setRequiredScore] = useState(1000);
  const [autoRemovePenality, setAutoRemovePenality] = useState(false);
  const [canDrawLastDiscard, setCanDrawLastDiscard] = useState(false);
  const [cardCounts, setCardCounts] = useState("x1");

  const { socket, user } = useAuth();
  const navigate = useNavigate();
  const { playEffect } = useSound();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Vérification du nom du serveur
    if (!serverName) {
      return setErrorMessage("Le nom du serveur est requis.");
    }

    if (typeof serverName !== "string") {
      return setErrorMessage("Nom du serveur non valide.");
    }

    if (serverName.length > 30) {
      return setErrorMessage("Le nom du serveur est limité à 30 caractères.");
    }

    if (serverName.length < 3) {
      return setErrorMessage(
        "Le nom du serveur doit contenir au moins 3 caractères."
      );
    }

    // Vérification du nombre de joueurs
    if (typeof maxPlayers !== "number" || maxPlayers < 2 || maxPlayers > 4) {
      return setErrorMessage(
        "Le nombre de joueurs doit être compris entre 2 et 4."
      );
    }

    // Vérification du type de serveur
    const validServerTypes = ["classic", "hardcore", "infinite", "custom"];
    if (
      !serverType ||
      typeof serverType !== "string" ||
      !validServerTypes.includes(serverType)
    ) {
      return setErrorMessage("Type de serveur non reconnu ou requis.");
    }

    // Vérifications spécifiques au mode "custom"
    if (serverType === "custom") {
      const validRequiredScores = [500, 1000, 1500, 2000];

      if (!validRequiredScores.includes(Number(requiredScore))) {
        return setErrorMessage("Score incorrect.");
      }

      if (typeof autoRemovePenality !== "boolean") {
        return setErrorMessage("Valeur de 'autoRemovePenality' incorrecte.");
      }

      if (typeof canDrawLastDiscard !== "boolean") {
        return setErrorMessage("Valeur de 'canDrawLastDiscard' incorrecte.");
      }

      if (typeof cardCounts !== "string") {
        return setErrorMessage("Valeur de 'cardCounts' incorrecte.");
      }
    }

    // Création du serveur si toutes les vérifications sont passées
    createServer();
  };

  const createServer = () => {
    if (!user || !socket) {
      setErrorMessage(
        "Impossible de créer le serveur. Veuillez vérifier les informations fournies."
      );
      return;
    }

    let serverData = {
      user,
      serverName,
      maxPlayers,
      serverType,
    };
    if (serverType === "custom") {
      serverData = {
        ...serverData,
        cardCounts,
        canDrawLastDiscard,
        autoRemovePenality,
        requiredScore,
      };
    }

    // console.log("Données du serveur avant envoi :", serverData);

    socket.emit("server:create", serverData, (response) => {
      if (!response?.success) {
        console.error(response?.message || "Réponse inconnue.");
        setErrorMessage(response?.message || "Une erreur est survenue.");
      } else {
        let server_id = response.data.server_id;
        navigate(`/game/${server_id}`);
      }
    });
  };

  const handlePlayerCountChange = (event) => {
    setMaxPlayers(Number(event.target.value));
  };

  const handleScoreCountChange = (event) => {
    setRequiredScore(Number(event.target.value));
  };

  const handlePenalityChange = (event) => {
    setAutoRemovePenality(event.target.value === "true");
  };
  const handleDrawChange = (event) => {
    setCanDrawLastDiscard(event.target.value === "true");
  };
  const handleCardCountsChange = (event) => {
    setCardCounts(event.target.value);
  };

  return (
    <>
      <form className="create-server page" onSubmit={handleSubmit}>
        <div className="page-content">
          <h2 className="page-title">Créer une partie</h2>

          <div className="form-input">
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

          <h3 className="page-subtitle">Nombre de joueurs maximum</h3>
          <div className="player-selection selector">
            {[2, 3, 4].map((playerCount) => (
              <div key={playerCount + "key"}>
                <input
                  id={"players" + playerCount}
                  type="radio"
                  name="max-players"
                  value={playerCount}
                  checked={maxPlayers === playerCount}
                  onChange={handlePlayerCountChange}
                />
                <label
                  className="btn"
                  htmlFor={"players" + playerCount}
                  key={playerCount}
                >
                  {playerCount}
                </label>
              </div>
            ))}
          </div>

          <h3 className="page-subtitle">Type de partie</h3>
          <div className="server-type-selection">
            <input
              id="classic-server"
              type="radio"
              name="server-type"
              value="classic"
              checked={serverType === "classic"}
              onChange={() => setServerType("classic")}
            />
            <label className="btn" htmlFor="classic-server">
              Classique
            </label>

            <input
              id="hardcore-server"
              type="radio"
              name="server-type"
              value="hardcore"
              checked={serverType === "hardcore"}
              onChange={() => setServerType("hardcore")}
            />
            <label className="btn" htmlFor="hardcore-server">
              Hardcore
            </label>

            <input
              id="infinite-server"
              type="radio"
              name="server-type"
              value="infinite"
              checked={serverType === "infinite"}
              onChange={() => setServerType("infinite")}
            />
            <label className="btn" htmlFor="infinite-server">
              Jusqu'à l'hôtel
            </label>

            <input
              id="custom-server"
              type="radio"
              name="server-type"
              value="custom"
              checked={serverType === "custom"}
              onChange={() => setServerType("custom")}
            />
            <label className="btn" htmlFor="custom-server">
              Personnalisée
            </label>
          </div>

          <div className="server-type-description">
            {serverType === "classic" ? (
              <ul>
                <li>
                  <span>Objectif :</span> Parcourir 1000 km
                </li>
                <li>
                  <span>Cartes :</span> 110 cartes disponibles
                </li>
                <li>
                  <span>Main :</span> 7 cartes par joueur
                </li>
                <li>
                  <span>Malus :</span> Disparaissent après 4 tours
                </li>
                <li>
                  <span>Défausse :</span> Pas de pioche
                </li>
              </ul>
            ) : serverType === "infinite" ? (
              <ul>
                <li>
                  <span>Objectif :</span> Parcourir 1000 km
                </li>
                <li>
                  <span>Cartes :</span> Nombre illimité de cartes (sauf bonus)
                </li>
                <li>
                  <span>Main :</span> 7 cartes par joueur
                </li>
                <li>
                  <span>Malus :</span> Disparaissent après 4 tours
                </li>
                <li>
                  <span>Défausse :</span> Pas de pioche
                </li>
              </ul>
            ) : serverType === "hardcore" ? (
              <ul>
                <li>
                  <span>Objectif :</span> Parcourir 1000 km
                </li>
                <li>
                  <span>Cartes :</span> 110 cartes disponibles
                </li>
                <li>
                  <span>Main :</span> 3 cartes par joueur
                </li>
                <li>
                  <span>Malus :</span> Actifs jusqu'à la parade
                </li>
                <li>
                  <span>Défausse :</span> Pioche de la dernière carte
                </li>
              </ul>
            ) : (
              <p>Partie personnalisable</p>
            )}
          </div>

          {serverType === "custom" && (
            <div className="custom-server">
              <div className="custom-server-section">
                <h3 className="page-subtitle">Score à atteindre</h3>
                <div className="score-selection selector">
                  {[500, 1000, 1500, 2000].map((score) => (
                    <div key={score + "key"}>
                      <input
                        id={"score" + score}
                        type="radio"
                        name="max-score"
                        value={score}
                        checked={requiredScore === score}
                        onChange={handleScoreCountChange}
                      />
                      <label
                        className="btn"
                        htmlFor={"score" + score}
                        key={score}
                      >
                        {score}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="custom-server-section">
                <h3 className="page-subtitle">Retrait des malus</h3>
                <p className="disclaimer">
                  Les malus disparaissent après 4 tours
                </p>
                <div className="penality-selection selector">
                  <input
                    id="autoRemovePenality1"
                    type="radio"
                    name="remove-penality"
                    value="true"
                    checked={autoRemovePenality === true}
                    onChange={handlePenalityChange}
                  />
                  <label className="btn" htmlFor="autoRemovePenality1">
                    Oui
                  </label>
                  <input
                    id="autoRemovePenality2"
                    type="radio"
                    name="remove-penality"
                    value="false"
                    checked={autoRemovePenality === false}
                    onChange={handlePenalityChange}
                  />
                  <label className="btn" htmlFor="autoRemovePenality2">
                    Non
                  </label>
                </div>
              </div>

              <div className="custom-server-section">
                <h3 className="page-subtitle">
                  Piocher la dernière carte défaussée
                </h3>
                <p className="disclaimer">
                  Les joueurs peuvent piocher la dernière carte défaussée
                </p>
                <div className="draw-selection selector">
                  <input
                    id="canDrawLastDiscard1"
                    type="radio"
                    name="draw-last-discard"
                    value="true"
                    checked={canDrawLastDiscard === true}
                    onChange={handleDrawChange}
                  />
                  <label className="btn" htmlFor="canDrawLastDiscard1">
                    Oui
                  </label>
                  <input
                    id="canDrawLastDiscard2"
                    type="radio"
                    name="draw-last-discard"
                    value="false"
                    checked={canDrawLastDiscard === false}
                    onChange={handleDrawChange}
                  />
                  <label className="btn" htmlFor="canDrawLastDiscard2">
                    Non
                  </label>
                </div>
              </div>

              {serverType === "custom" && (
                <div className="custom-server-section cards-section">
                  <h3 className="page-subtitle">Nombre de cartes</h3>
                  <p className="disclaimer">
                    {cardCounts === "unlimited"
                      ? "Cartes illimitées (sauf cartes bonus)"
                      : cardCounts === "x3"
                      ? " 318 cartes (+ 4 cartes bonus)"
                      : cardCounts === "x2"
                      ? " 212 cartes (+ 4 cartes bonus)"
                      : " 106 cartes (+ 4 cartes bonus)"}
                  </p>

                  {/* Option Cartes illimitées */}
                  <div className="unlimited-selection selector">
                    <input
                      id="unlimitedCards"
                      type="radio"
                      name="card-counts"
                      value="unlimited"
                      checked={cardCounts === "unlimited"}
                      onChange={handleCardCountsChange}
                    />
                    <label className="btn" htmlFor="unlimitedCards">
                      <i className="fa-solid fa-infinity"></i>
                    </label>
                    <input
                      id="limitedCardsx1"
                      type="radio"
                      name="card-counts"
                      value="x1"
                      checked={cardCounts === "x1"}
                      onChange={handleCardCountsChange}
                    />
                    <label className="btn" htmlFor="limitedCardsx1">
                      x 1
                    </label>
                    <input
                      id="limitedCardsx2"
                      type="radio"
                      name="card-counts"
                      value="x2"
                      checked={cardCounts === "x2"}
                      onChange={handleCardCountsChange}
                    />
                    <label className="btn" htmlFor="limitedCardsx2">
                      x 2
                    </label>
                    <input
                      id="limitedCardsx3"
                      type="radio"
                      name="card-counts"
                      value="x3"
                      checked={cardCounts === "x3"}
                      onChange={handleCardCountsChange}
                    />
                    <label className="btn" htmlFor="limitedCardsx3">
                      x 3
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && <p className="error">{errorMessage}</p>}

          <button
            className="btn bg-green"
            type="submit"
            onClick={() => playEffect("open")}
          >
            Créer
          </button>
          <BackButton />
        </div>
      </form>
    </>
  );
};

export default CreateServer;
