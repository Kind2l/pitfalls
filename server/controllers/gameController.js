const GameModel = require("../models/GameModel");
const {
  servers,
  getFilteredServers,
  updateUser,
  findUserServerByUsername,
  checkIfPlayerIsHost,
  setNewHost,
} = require("../utils/data");
const { v4: uuidv4 } = require("uuid");
const { findUserByUsername } = require("../utils/data");
const { censorText } = require("../utils/censor");

/**
 * Crée un nouveau serveur et l'ajoute à la liste des serveurs.
 *
 * @param {object} request - La requête contenant les informations du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après la création du serveur.
 */

/**
 * Crée un nouveau serveur de jeu.
 *
 * @param {Object} request - Objet contenant les informations pour créer un serveur.
 * @param {string} request.serverName - Nom du serveur.
 * @param {Object} request.user - Informations de l'utilisateur.
 * @param {string} request.user.username - Nom d'utilisateur de l'hôte.
 * @param {number} request.maxPlayers - Nombre maximal de joueurs.
 * @param {Object} request.socket - Socket de l'utilisateur.
 * @param {Object} request.cardCounts - Configuration des cartes (facultatif).
 * @param {Function} callback - Fonction callback pour retourner le résultat.
 *
 * @returns {void} Appelle le callback avec un objet `success`, un `message`, et des données éventuelles.
 */
exports.createServer = (request, callback) => {
  console.log("createServer: Entrée dans la fonction.");
  try {
    if (!request.serverName || typeof request.serverName !== "string") {
      return callback({
        success: false,
        message: "Le nom du serveur est invalide.",
      });
    }

    request.serverName.trim();

    if (request?.serverName.length > 30 || request?.serverName.length < 2) {
      return callback({
        success: false,
        message: "Longueur du nom invalide.",
      });
    }

    if (
      !request.user ||
      !request.user.username ||
      typeof request.user.username !== "string"
    ) {
      return callback({
        success: false,
        message: "Le nom d'utilisateur est requis.",
      });
    }

    if (
      !request.maxPlayers ||
      typeof request.maxPlayers !== "number" ||
      request.maxPlayers < 2 ||
      request.maxPlayers > 4
    ) {
      return callback({
        success: false,
        message: "Le nombre maximum de joueurs doit être compris entre 2 et 4.",
      });
    }

    if (!request.serverType || typeof request.serverType !== "string") {
      return callback({
        success: false,
        message: "Le type de serveur est requis.",
      });
    }

    let id = uuidv4();
    let name = request.serverName;
    let host = request.user.username;
    let maxPlayers = request.maxPlayers;
    let type = request.serverType;

    let newServer = null;

    if (type === "classic") {
      newServer = new GameModel({
        id,
        name,
        type,
        host,
        maxPlayers,
        autoRemovePenality: true,
      });
    }
    if (type === "hardcore") {
      newServer = new GameModel({
        id,
        name,
        type,
        host,
        maxPlayers,
        handSize: 3,
      });
    }
    if (type === "infinite") {
      newServer = new GameModel({
        id,
        name,
        type,
        host,
        maxPlayers,
        isDeckUnlimited: true,
      });
    }
    if (type === "custom") {
      newServer = new GameModel({
        id,
        name,
        host,
        type,
        maxPlayers,
        requiredScore: request?.requiredScore || null,
        autoRemovePenality: request?.autoRemovePenality || null,
      });

      if (request?.cardCounts === "unlimited") {
        newServer.isDeckUnlimited = true;
      } else if (request?.cardCounts) {
        newServer.cardCounts = request.cardCounts;
      }
    }

    servers[id] = newServer;

    if (!request.socket) {
      delete servers[id];
      return callback({
        success: false,
        message: "Impossible de créer le serveur.",
      });
    }
    request.socket.join(`server_${id}`);
    return callback({
      success: true,
      message: "Serveur enregistré avec succès.",
      data: {
        server_id: id,
      },
    });
  } catch (error) {
    console.error("Erreur createServer :", error);
    return callback({
      success: false,
      message: "Une erreur s'est produite.",
    });
  }
};

/**
 * Rejoint un serveur existant.
 *
 * @param {object} request - La requête contenant les informations du joueur et du serveur.
 * @param {string} request.server_id - L'ID du serveur à rejoindre.
 * @param {object} request.user - Informations sur l'utilisateur.
 * @param {string} request.user.username - Nom d'utilisateur.
 * @param {object} request.socket - Socket de l'utilisateur.
 * @param {object} request.io - Instance de l'objet io.
 * @param {function} callback - La fonction de rappel à exécuter après avoir rejoint le serveur.
 *
 * @returns {void} Appelle le callback avec un objet `success`, un `message`, et éventuellement des données.
 */
exports.joinServer = (request, callback) => {
  console.log("joinServer: Entrée dans la fonction.");

  try {
    const { server_id, user, socket, io } = request;

    if (!server_id || typeof server_id !== "string") {
      return callback({
        success: false,
        message: "ID du serveur requis et doit être une chaîne.",
      });
    }

    if (!user || !user.username || typeof user.username !== "string") {
      return callback({
        success: false,
        message: "Informations utilisateur incomplètes/invalides.",
      });
    }

    const server = servers[server_id];

    if (!server) {
      return callback({
        success: false,
        message: "Serveur introuvable.",
      });
    }

    if (
      Object.keys(server.players).length >= server.maxPlayers ||
      server.start === true
    ) {
      return callback({
        success: false,
        message: `Le serveur est complet ou a déjà commencé.`,
      });
    }

    if (!socket) {
      return callback({
        success: false,
        message: `Impossible de s'abonner au serveur.`,
      });
    }

    socket.join(`server_${server_id}`);
    socket.leave("subscription:server-list");
    console.log("JOIN ERR", servers[server_id], user.id, user.username);
    servers[server_id].addPlayer(user.id, user.username);

    io.emit("subscription:server-list", { servers: getFilteredServers() });
    io.to(`server_${server_id}`).emit("server:update", servers[server_id]);

    updateUser({
      username: user.username,
      update: { current_server: server_id },
    });

    return callback({
      success: true,
      message: `Joueur ajouté au serveur.`,
    });
  } catch (error) {
    // Gestion des erreurs inattendues
    console.error(
      "joinServer: Erreur inattendue lors de la tentative de rejoindre un serveur:",
      error
    );
    return callback({
      success: false,
      message:
        "Une erreur inattendue s'est produite lors de la tentative de rejoindre le serveur.",
    });
  }
};

/**
 * Ajoute un joueur à un serveur.
 *
 * @param {object} request - La requête contenant les informations du joueur et du serveur.
 * @param {string} request.server_id - L'ID du serveur cible.
 * @param {object} request.user - Informations sur l'utilisateur.
 * @param {string} request.user.id - Identifiant unique de l'utilisateur.
 * @param {string} request.user.username - Nom d'utilisateur.
 * @param {object} request.socket - Socket de l'utilisateur.
 * @param {object} request.io - Instance de l'objet io.
 * @param {function} callback - La fonction de rappel à exécuter après l'ajout du joueur.
 *
 * @returns {void} Appelle le callback avec un objet `success`, un `message`, et éventuellement des données.
 */
exports.addPlayer = (request, callback) => {
  console.log("addPlayer: Entrée dans la fonction.");

  try {
    const { server_id, user, socket, io } = request;

    if (!server_id || typeof server_id !== "string") {
      return callback({
        success: false,
        message: "L'ID du serveur est requis et doit être une chaîne.",
      });
    }

    if (
      !user ||
      !user.id ||
      !user.username ||
      typeof user.username !== "string"
    ) {
      return callback({
        success: false,
        message: "Les informations utilisateur sont incomplètes ou invalides.",
      });
    }

    if (!servers[server_id]) {
      return callback({
        success: false,
        message: "Serveur introuvable.",
      });
    }

    const playerAdded = servers[server_id].addPlayer(user.id, user.username);
    if (!playerAdded) {
      return callback({
        success: false,
        message: "Impossible d'ajouter le joueur.",
      });
    }

    return callback({
      success: false,
      message:
        "Une erreur inattendue s'est produite lors de l'ajout du joueur.",
    });
  } catch (error) {
    // Gestion des erreurs inattendues
    console.error(
      "addPlayer: Erreur inattendue lors de l'ajout du joueur:",
      error
    );
    return callback({
      success: false,
      message:
        "Une erreur inattendue s'est produite lors de l'ajout du joueur.",
    });
  }
};

/**
 * Supprime un utilisateur de toutes les rooms serveurs.
 *
 * @param {object} socket - Socket de l'utilisateur.
 */

exports.leaveAllServerRooms = (socket) => {
  if (!socket) {
    return false;
  }
  socket.rooms.forEach((room) => {
    if (room.startsWith("server_")) {
      socket.leave(room);
    }
  });
  return true;
};

/**
 * Permet à un utilisateur de quitter un serveur.
 *
 * @param {object} req - La requête contenant l'utilisateur, le socket et l'instance io.
 * @param {function} callback - La fonction de rappel exécutée après le retrait du joueur.
 */
exports.leaveServer = (req, callback) => {
  console.log("🚪 leaveServer: Entrée dans la fonction", { req });

  try {
    const { user, socket, io } = req;

    if (!user?.username) {
      return callback({
        success: false,
        message: "Aucun nom d'utilisateur fourni.",
      });
    }

    const { username } = user;

    const userData = findUserByUsername(username);
    if (!userData) {
      return callback({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const serverId = findUserServerByUsername(username);

    if (serverId) {
      const isRemoved = this.removeUserFromServerByUsername(username);

      if (!isRemoved) {
        return callback({
          success: false,
          message: "Erreur lors de la suppression du joueur du serveur.",
        });
      }
    }

    const server = servers[serverId];

    if (server) {
      const totalPlayers = Object.keys(server.players).length;
      if (totalPlayers === 0) {
        delete servers[serverId];
      } else if (totalPlayers === 1 && server.start && !server.gameOver) {
        console.log("🚪 leaveServer: Fin de la partie.");
        req.server_id = serverId;
        this.endGame(req);
      } else {
        socket.to("server_" + serverId).emit("server:update", server);
        this.leaveAllServerRooms(socket);
      }
    }

    io.emit("subscription:server-list", { servers: getFilteredServers() });
    return callback({ success: true, message: "Joueur retiré avec succès." });
  } catch (error) {
    return callback({
      success: false,
      message: "Erreur lors du retrait du joueur.",
    });
  }
};

/**
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {string} username - Le nom d'utilisateur du joueur à supprimer.
 * @returns {boolean} - Retourne `true` si le joueur a été supprimé avec succès, sinon `false`.
 */
exports.removeUserFromServerByUsername = (username) => {
  if (!username) return false;

  const serverId = findUserServerByUsername(username);
  if (!serverId) return false;

  const server = servers[serverId];
  if (!server || !server.players[username]) return false;

  const isPlayerOwner = checkIfPlayerIsHost(username);
  if (isPlayerOwner) {
    setNewHost(serverId);
  }

  const playerPosition = server.players[username].position;
  const totalPlayers = Object.keys(server.players).length;

  delete server.players[username];

  const players = Object.entries(server.players)
    .map(([username, { position }]) => ({ username, position }))
    .sort((a, b) => a.position - b.position);

  players.forEach((player, index) => {
    server.players[player.username].position = index + 1;
  });

  if (totalPlayers === playerPosition) {
    server.nextPlayer();
  }

  return true;
};

/**
 * Retourne la liste des serveurs.
 *
 * @param {object} request - La requête.
 * @param {function} callback - La fonction de rappel à exécuter après avoir obtenu la liste des serveurs.
 */
exports.serverList = (request, callback) => {
  console.log(servers);
  callback({
    success: true,
    message: `Liste des serveurs`,
    data: {
      servers: servers,
    },
  });
};

/**
 * Trouve un serveur par son identifiant.
 *
 * @param {object} request - La requête contenant l'identifiant du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir trouvé le serveur.
 */
exports.findServer = (request, callback) => {
  let server_id = request.server_id;

  if (!server_id) {
    callback({
      success: false,
      message: `Aucun identifiant de serveur`,
    });
    return;
  }

  let server = servers[server_id];

  if (!server) {
    callback({
      success: false,
      message: `Le serveur n'existe pas`,
    });
    return;
  }

  callback({
    success: true,
    message: `Serveur trouvé`,
    data: server,
  });
};

/**
 * Initialise un serveur.
 *
 * @param {object} request - La requête contenant l'identifiant du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après l'initialisation du serveur.
 */
exports.initServer = (request, callback) => {
  try {
    // Validation de l'identifiant du serveur
    const { serverId } = request;
    if (!serverId) {
      console.error("initServer: Aucun identifiant de serveur fourni.");
      return callback({
        success: false,
        message: "Aucun identifiant de serveur fourni.",
      });
    }

    // Récupération du serveur
    const server = servers[serverId];
    if (!server) {
      console.error(
        `initServer: Le serveur avec l'ID ${serverId} n'existe pas.`
      );
      return callback({
        success: false,
        message: "Le serveur n'existe pas.",
      });
    }

    // Réinitialisation et démarrage du jeu
    console.log(`initServer: Réinitialisation du serveur ${serverId}.`);
    server.reset();
    server.startGame();

    // Envoi de la réponse via callback
    callback({
      success: true,
      message: "Serveur initialisé avec succès.",
      data: server,
    });

    // Notification des clients connectés au serveur
    console.log(
      `initServer: Notification des clients pour le serveur ${serverId}.`
    );
    request.io.to(`server_${serverId}`).emit("server:update", server);
  } catch (error) {
    console.error("initServer: Une erreur est survenue.", error);
    callback({
      success: false,
      message:
        "Une erreur interne est survenue lors de l'initialisation du serveur.",
    });
  }
};

/**
 * Démarre le jeu sur un serveur existant.
 *
 * @param {object} request - La requête contenant l'identifiant du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir démarré le jeu.
 */
exports.startGame = (request, callback) => {
  const server = Object.values(servers).find((s) => s.id === request.server_id);

  // Vérifie si le serveur existe et s'il y a suffisamment de joueurs
  if (!server || server.players.length < 2) {
    return callback({
      success: false,
      message: `Serveur introuvable ou pas assez de joueurs`,
    });
  }

  // Émet un événement pour mettre à jour la liste des serveurs pour tous les clients abonnés
  request.io
    .to("subscribe - server list")
    .emit("subscribe - server list", servers);

  // Renvoie une réponse au créateur du serveur
  callback({
    success: true,
    message: `La partie commence pour le serveur ${server.id}`,
  });
};

/**
 * Gère les actions des joueurs.
 *
 * @param {object} request - La requête contenant les informations de l'action du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir traité l'action du joueur.
 */
exports.playerAction = (request, callback) => {
  const { card } = request;
  const server = servers[request.server_id];
  const players = server.players;
  const playerUsername = request.user.username;
  const player = players[playerUsername];

  if (!card) {
    return callback({
      success: false,
      message: "Aucune carte sélectionnée",
    });
  }

  console.log("REMOVE PENALITY ?", server.autoRemovePenality);
  if (server.autoRemovePenality) {
    updateStatesCount({ server, playerUsername });
  }

  // Gestion des cartes de type "attaque"
  if (card.type === "attaque") {
    handleAttackCard(request, callback, card, playerUsername, players);
  }

  // Gestion des cartes de type "parade"
  if (card.type === "parade") {
    handleParadeCard(request, callback, card, playerUsername, player);
  }

  // Gestion des cartes de type "borne"
  if (card.type === "borne") {
    handleBorneCard(request, callback, card, playerUsername, player);
  }

  // Gestion des cartes de type "bonus"
  if (card.type === "bonus") {
    handleBonusCard(request, callback, card, playerUsername, player);
  }

  return callback({
    success: false,
    message: "Type de carte non géré",
  });
};

/**
 * Gère les cartes de type "attaque".
 *
 * @param {object} request - La requête contenant les informations de l'action du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir traité l'action du joueur.
 * @param {object} card - La carte utilisée.
 * @param {string} playerUsername - Le nom d'utilisateur du joueur.
 * @param {object} players - Les joueurs du serveur.
 */
const handleAttackCard = (request, callback, card, playerUsername, players) => {
  let { attackedPlayerId } = request;
  if (attackedPlayerId) {
    let attackedPlayer = null;
    for (const key in players) {
      if (players[key].id === attackedPlayerId) {
        attackedPlayer = players[key];
        break;
      }
    }

    if (!attackedPlayer) {
      return callback({
        success: false,
        message: "Joueur ciblé non trouvé",
      });
    }

    const bonusProtectionMap = {
      feurouge: attackedPlayer.bonus.cartedepolice,
      zonedecontrole: attackedPlayer.bonus.cartedepolice,
      accident: attackedPlayer.bonus.pilote,
      fatigue: attackedPlayer.bonus.infatiguable,
      embouteillage: attackedPlayer.bonus.deviation,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "zonedecontrole"
        ? attackedPlayer.states.zonedecontrole.value
        : ["fatigue", "accident", "feurouge", "embouteillage"].some(
            (state) => attackedPlayer.states[state].value
          );

    if (isProtectedByBonus || hasBlockingState) {
      return callback({
        success: false,
        message: `Le joueur ${attackedPlayer.username} est protégé et ne peut pas être attaqué`,
      });
    }

    attackedPlayer.states[card.tag].value = true;
    servers[request.server_id].updatePlayer(
      attackedPlayer.username,
      attackedPlayer
    );
    servers[request.server_id].removeCard(playerUsername, card.id);
    servers[request.server_id].drawCard(playerUsername);
    servers[request.server_id].nextPlayer();

    callback({
      success: true,
      message: `L'attaque a réussi contre ${attackedPlayer.username}`,
      data: {
        actionState: true,
      },
    });

    if (servers[request.server_id].length === 0) {
      return this.endGame(request);
    }

    return request.io
      .to(`server_${request.server_id}`)
      .emit("game:next-round", {
        servers: servers[request.server_id],
        data: {
          type: "attaque",
          attackedPlayer: attackedPlayer,
          player: request.user,
          card,
        },
      });
  }

  const attackablePlayers = Object.values(players).filter((plr) => {
    console.log("players", players);
    if (plr.username === playerUsername) {
      return false;
    }

    const bonusProtectionMap = {
      feurouge: plr.bonus.cartedepolice,
      accident: plr.bonus.pilote,
      fatigue: plr.bonus.infatiguable,
      embouteillage: plr.bonus.deviation,
      zonedecontrole: plr.bonus.cartedepolice,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "zonedecontrole"
        ? plr.states.zonedecontrole.value
        : ["fatigue", "accident", "feurouge", "embouteillage"].some(
            (state) => plr.states[state].value
          );

    return !isProtectedByBonus && !hasBlockingState;
  });

  // Utiliser un ensemble pour garantir l'unicité des joueurs
  const uniqueAttackablePlayers = Array.from(
    new Set(attackablePlayers.map((plr) => plr.id))
  ).map((id) => {
    return attackablePlayers.find((plr) => plr.id === id);
  });

  // Vérifier si la liste des joueurs attaquables est vide
  if (uniqueAttackablePlayers.length === 0) {
    return callback({
      success: true,
      message: "Aucun joueur ne peut être attaqué",
      data: { actionState: false },
    });
  }

  // Retourner la liste des joueurs attaquables
  return callback({
    success: true,
    message: "Liste des joueurs pouvant être attaqués",
    data: { actionState: true, attackablePlayers: uniqueAttackablePlayers },
  });
};

/**
 * Gère les cartes de type "parade".
 *
 * @param {object} request - La requête contenant les informations de l'action du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir traité l'action du joueur.
 * @param {object} card - La carte utilisée.
 * @param {string} playerUsername - Le nom d'utilisateur du joueur.
 * @param {object} player - Le joueur.
 */
const handleParadeCard = (request, callback, card, playerUsername, player) => {
  const requiredMalusState = {
    feuvert: player.states.feurouge.value,
    findezonedecontrole: player.states.zonedecontrole.value,
    findembouteillage: player.states.embouteillage.value,
    repose: player.states.fatigue.value,
    reparation: player.states.accident.value,
  };

  if (!requiredMalusState[card.tag]) {
    return callback({
      success: true,
      message: `Vous n'avez pas besoin de cette carte`,
      data: { actionState: false },
    });
  }

  const blockingConditions = {
    feuvert: {
      condition: player.bonus.cartedepolice,
      message: `Vous êtes déjà immunisé (Carte de police)`,
    },
    findezonedecontrole: {
      condition: player.bonus.cartedepolice,
      message: `Vous êtes déjà immunisé (Carte de police)`,
    },
    findembouteillage: {
      condition: player.bonus.deviation,
      message: `Vous êtes déjà immunisé (Déviation)`,
    },
    repose: {
      condition: player.bonus.infatiguable,
      message: `Vous êtes déjà immunisé (Infatiguable)`,
    },
    reparation: {
      condition: player.bonus.reparation,
      message: `Vous êtes déjà immunisé (Pilote)`,
    },
  };

  const blockCondition = blockingConditions[card.tag];

  if (blockCondition?.condition) {
    return callback({
      success: true,
      message: blockCondition.message,
      data: { actionState: false },
    });
  }

  switch (card.tag) {
    case "feuvert":
      player.states.feurouge.value = false;
      break;
    case "findezonedecontrole":
      player.states.zonedecontrole.value = false;
      break;
    case "findembouteillage":
      player.states.embouteillage.value = false;
      break;
    case "repose":
      player.states.fatigue.value = false;
      break;
    case "reparation":
      player.states.accident.value = false;
      break;
    default:
      break;
  }

  servers[request.server_id].updatePlayer(playerUsername, player);
  servers[request.server_id].removeCard(playerUsername, card.id);
  servers[request.server_id].drawCard(playerUsername);
  servers[request.server_id].nextPlayer();
  callback({
    success: true,
    message: `La carte parade est appliquée`,
    data: { actionState: true, player: playerUsername, card },
  });

  if (Object.keys(servers[request.server_id].deck).length === 0) {
    return this.endGame(request);
  }

  return request.io.to(`server_${request.server_id}`).emit("game:next-round", {
    servers: servers[request.server_id],
    data: {
      type: "parade",
      player: playerUsername,
      card,
    },
  });
};

/**
 * Gère les cartes de type "borne".
 *
 * @param {object} request - La requête contenant les informations de l'action du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir traité l'action du joueur.
 * @param {object} card - La carte utilisée.
 * @param {string} playerUsername - Le nom d'utilisateur du joueur.
 * @param {object} player - Le joueur.
 */
const handleBorneCard = (request, callback, card, playerUsername, player) => {
  const updatedScore = player.score + card.value;
  console.log(servers[request.server_id]);

  if (
    player.states.feurouge.value ||
    player.states.fatigue.value ||
    player.states.accident.value ||
    player.states.embouteillage.value
  ) {
    let message = "Vous ne pouvez plus rouler";
    if (player.states.feurouge.value) {
      message = "Vous êtes à l'arrêt (Feu rouge)";
    }
    if (player.states.fatigue.value) {
      message = "Vous êtes à l'arrêt (Fatigue)";
    }
    if (player.states.accident.value) {
      message = "Vous êtes à l'arrêt (Accident)";
    }
    if (player.states.embouteillage.value) {
      message = "Vous êtes à l'arrêt (Embouteillage)";
    }
    return callback({
      success: true,
      message,
      data: { actionState: false },
    });
  }

  if (player.states.zonedecontrole.value && card.value > 50) {
    return callback({
      success: true,
      message: `Vous êtes limité à 50 Kms`,
      data: { actionState: false },
    });
  }

  if (updatedScore > servers[request.server_id].requiredScore) {
    return callback({
      success: true,
      message: `Vous devez faire exactement ${
        servers[request.server_id].requiredScore
      } Kms`,
      data: { actionState: false },
    });
  }
  if (updatedScore === servers[request.server_id].requiredScore) {
    player.score = updatedScore;
    servers[request.server_id].updatePlayer(playerUsername, player);
    servers[request.server_id].removeCard(playerUsername, card.id);
    servers[request.server_id].drawCard(playerUsername);
    callback({
      success: true,
      message: `Ajout de ${card.value} Kms`,
      data: { actionState: true, player: playerUsername, card },
    });
    return this.endGame(request);
  } else {
    player.score = updatedScore;
    servers[request.server_id].updatePlayer(playerUsername, player);
    servers[request.server_id].removeCard(playerUsername, card.id);
    servers[request.server_id].drawCard(playerUsername);
    servers[request.server_id].nextPlayer();

    if (servers[request.server_id].length === 0) {
      return this.endGame(request);
    }
    callback({
      success: true,
      message: `Ajout de ${card.value} Kms`,
      data: { actionState: true, player: playerUsername, card },
    });

    console.log("deck", Object.keys(servers[request.server_id].deck).length);
    if (Object.keys(servers[request.server_id].deck).length === 0) {
      return this.endGame(request);
    }

    return request.io
      .to(`server_${request.server_id}`)
      .emit("game:next-round", {
        servers: servers[request.server_id],
        data: {
          type: "borne",
          player: playerUsername,
          card,
        },
      });
  }
};

/**
 * Gère les cartes de type "bonus".
 *
 * @param {object} request - La requête contenant les informations de l'action du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir traité l'action du joueur.
 * @param {object} card - La carte utilisée.
 * @param {string} playerUsername - Le nom d'utilisateur du joueur.
 * @param {object} player - Le joueur.
 */
const handleBonusCard = (request, callback, card, playerUsername, player) => {
  console.log("carte : ", card);

  switch (card.tag) {
    case "infatiguable":
      console.log("application de infatiguable");
      player.bonus.infatiguable = true;
      player.states.fatigue.value = false;
      break;
    case "cartedepolice":
      player.bonus.cartedepolice = true;
      player.states.feurouge.value = false;
      player.states.zonedecontrole.value = false;
      break;
    case "deviation":
      player.bonus.deviation = true;
      player.states.embouteillage.value = false;
      break;
    case "pilote":
      player.bonus.pilote = true;
      player.states.accident.value = false;
      break;
    default:
      break;
  }

  console.log("player update with bonus :", player);

  servers[request.server_id].updatePlayer(playerUsername, player);
  servers[request.server_id].removeCard(playerUsername, card.id);
  servers[request.server_id].drawCard(playerUsername);
  callback({
    success: true,
    message: `Bonus ajouté.`,
    data: { actionState: true, player: playerUsername, card },
  });

  if (Object.keys(servers[request.server_id].deck).length === 0) {
    return this.endGame(request);
  }

  return request.io.to(`server_${request.server_id}`).emit("game:next-round", {
    servers: servers[request.server_id],
    data: {
      type: "bonus",
      player: playerUsername,
      card,
    },
  });
};

/**
 * Permet de compter les tours et de mettre a jour les malus.
 **/
const updateStatesCount = ({ server, playerUsername }) => {
  Object.keys(server.players[playerUsername].states).forEach((stateKey) => {
    let state = server.players[playerUsername].states[stateKey];

    if (state.value) {
      state.count--;

      if (state.count <= 0) {
        state.count = 8;
        state.value = false;
      }
    }
  });
};

/**
 * Supprime une carte d'un joueur.
 *
 * @param {object} request - La requête contenant les informations de la carte et du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir supprimé la carte.
 */
exports.removeCard = (request, callback) => {
  const server = servers[request.server_id];
  const { card } = request;
  const playerUsername = request.user.username;
  if (server.autoRemovePenality) {
    updateStatesCount({ server, playerUsername });
  }

  servers[request.server_id].removeCard(playerUsername, card.id);
  servers[request.server_id].drawCard(playerUsername);
  servers[request.server_id].nextPlayer();

  if (Object.keys(servers[request.server_id].deck).length === 0) {
    return this.endGame(request);
  }
  return request.io.to(`server_${request.server_id}`).emit("game:next-round", {
    servers: servers[request.server_id],
    data: {
      type: "remove",
      player: playerUsername,
      card,
    },
  });
};

/**
 * Termine le jeu sur un serveur.
 *
 * @param {object} request - La requête contenant l'identifiant du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir terminé le jeu.
 */
exports.endGame = (request) => {
  console.log("endGame: Entrée dans la fonction");
  console.log("endGame: Requête", request);
  if (!request) {
    console.log("endGame: Aucune requête");
    return false;
  }
  if (!request.server_id) {
    console.log("endGame: Aucun ID de serveur");
    return false;
  }
  if (!servers[request.server_id]) {
    console.log("endGame: Aucun serveur trouvé");
    return false;
  }

  servers[request.server_id].endGame();
  console.log("endGame: Fin de partie, envoie des données emit game:is-over ");

  if (!request.io) {
    console.log("endGame: io n'est pas dans la requete, envoi impossible");
    return false;
  }
  return request.io
    .to(`server_${request.server_id}`)
    .emit("game:is-over", servers[request.server_id]);
};

/**
 * Retourne un message d'un joueur à l'ensemble des autres joueurs.
 *
 * @param {object} request - La requête.
 * @param {function} callback - La fonction de rappel à exécuter après avoir obtenu la liste des serveurs.
 */
exports.message = (request, callback) => {
  if (!request.user) {
    return callback({
      success: false,
      message: `Aucun utilisateur pour le message`,
    });
  }

  let server = findUserServerByUsername(request.user.username);

  if (!server) {
    return callback({
      success: false,
      message: `Aucun serveur pour le message`,
    });
  }

  if (!request.message) {
    return callback({
      success: false,
      message: `Aucun message`,
    });
  }

  let filteredMessage = censorText(request.message);
  console.log("Message filtré envoyé :", filteredMessage);

  request.io.in(`server_${server}`).emit("game:player-message", {
    username: request.user.username,
    message: filteredMessage.result,
  });

  return callback({
    success: true,
    message: `Message envoyé`,
  });
};
