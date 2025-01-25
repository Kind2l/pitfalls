const GameModel = require("../models/GameModel");
const {
  servers,
  getFilteredServers,
  updateUser,
  findUserServerByUsername,
  cleanupInactiveServer,
  checkIfPlayerIsOwner,
  checkIfPlayerIsCurrentPlayer,
  setNewOwner,
} = require("../utils/data");
const { v4: uuidv4 } = require("uuid");
const { findUserByUsername } = require("../utils/data");

/**
 * Crée un nouveau serveur et l'ajoute à la liste des serveurs.
 *
 * @param {object} request - La requête contenant les informations du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après la création du serveur.
 */
const validateServerName = (serverName) => {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9\s\-'!?_]{1,28}[a-zA-Z0-9]$/;
  return regex.test(serverName);
};

const validateRequest = (request) => {
  // Vérifie si toutes les propriétés nécessaires existent et sont valides
  if (!request.serverName || typeof request.serverName !== "string") {
    return {
      success: false,
      message: "Le nom du serveur est requis.",
    };
  }

  if (!validateServerName(request.serverName)) {
    return { success: false, message: "Le nom du serveur est invalide." };
  }

  if (
    !request.user ||
    !request.user.username ||
    typeof request.user.username !== "string"
  ) {
    return {
      success: false,
      message: "Le nom d'utilisateur est requis.",
    };
  }

  if (
    !request.maxPlayers ||
    typeof request.maxPlayers !== "number" ||
    request.maxPlayers <= 0
  ) {
    return {
      success: false,
      message: "Le nombre de joueurs maximum est requis.",
    };
  }

  return { success: true };
};
exports.createServer = (request, callback) => {
  const validation = validateRequest(request);

  // Si la validation échoue, on renvoie un message d'erreur
  if (!validation.success) {
    callback({
      success: false,
      message: validation.message,
    });
    return;
  }

  const uniqueId = uuidv4();
  const newServer = new GameModel(
    uniqueId,
    request.serverName,
    request.user.username,
    request.maxPlayers,
    request.cardCounts
  );

  servers[uniqueId] = newServer;
  request.socket.join(`server_${uniqueId}`);
  console.log(newServer);

  callback({
    success: true,
    message: "Le serveur est créé",
    data: {
      server_id: uniqueId,
    },
  });
};

/**
 * Ajoute un joueur à un serveur.
 *
 * @param {object} request - La requête contenant les informations du joueur et du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après l'ajout du joueur.
 */
exports.addPlayer = (request, callback) => {
  const server = servers[request.server_id];
  if (!server) {
    return callback({
      success: false,
      message: "Serveur introuvable",
    });
  }

  const playerAdded = server.addPlayer(request.user.id, request.user.username);

  if (!playerAdded) {
    return callback({
      success: false,
      message: "Le serveur est plein",
    });
  }

  request.socket.join(request.server_id);
  callback({
    success: true,
    message: `L'utilisateur ${request.user.username} a été ajouté au serveur`,
    data: {
      server: server,
    },
  });

  // Retourne la liste des serveurs (filtrés) aux abonnés de server-list
  let filteredServers = getFilteredServers();
  request.io.emit("subscription:server-list", { servers: filteredServers });
};

/**
 * Rejoint un serveur existant.
 *
 * @param {object} request - La requête contenant les informations du joueur et du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir rejoint le serveur.
 */
exports.joinServer = (request, callback) => {
  const server = servers[request.server_id];

  if (
    Object.keys(server.players).length >= server.maxPlayers ||
    server.start === true
  ) {
    return callback({
      success: false,
      message: `Le serveur est complet ou le jeu a déjà commencé`,
    });
  }

  request.socket.join(request.server_id);

  this.addPlayer(request, callback);

  request.io.emit("subscription:server-list", { servers });
  request.io
    .to(request.server_id)
    .emit("server:update", servers[request.server_id]);
  updateUser({
    username: request.user.username,
    update: { current_server: request.server_id },
  });
};

/**
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {object} req - La requête contenant les informations de l'utilisateur.
 * @param {function} callback - La fonction de rappel à exécuter après la suppression de l'utilisateur.
 */
exports.leaveServer = (req, callback) => {
  console.log("leaveServer: Entrée dans la fonction");
  let username = req.user.username || req.username || null;
  console.log("leaveServer: Y-a-t'il un nom d'utilisateur ? ");
  if (!username) {
    console.log("leaveServer: Aucun nom d'utilisateur");
    return callback({
      success: false,
      message: "Aucun nom d'utilisateur",
    });
  }
  console.log("leaveServer: Nom d'utilisateur", username);

  console.log("leaveServer: Y-a-t'il cet utilisateur dans la liste ? ");
  let user = findUserByUsername(username);
  console.log("leaveServer:", user);

  if (!user) {
    console.log("leaveServer: Aucun utilisateur");
    return callback({
      success: false,
      message: "Aucun utilisateur dans la requête.",
    });
  }

  console.log("leaveServer: Tentative de suppression");
  let isRemoved = this.removeUserFromServerByUsername(username);
  console.log("leaveServer: Tentative de suppression réussie ?", isRemoved);

  // Retourne la liste des serveurs (filtrés) aux abonnés de server-list
  let filteredServers = getFilteredServers();
  isRemoved &&
    req.io.emit("subscription:server-list", { servers: filteredServers });
  req.io
    .to(user.current_server)
    .emit("server:update", servers[user.current_server]);

  return callback({
    success: isRemoved,
    message: isRemoved
      ? "Utilisateur retiré du serveur"
      : "Échec du retrait de l'utilisateur",
  });
};

/**
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {string} username - Le nom d'utilisateur de l'utilisateur à supprimer.
 * @returns {boolean} - Retourne true si l'utilisateur a été supprimé, sinon false.
 */
exports.removeUserFromServerByUsername = (username) => {
  console.log("removeUserFromServerByUsername: Entrée dans la fonction");

  if (!username) {
    console.log("removeUserFromServerByUsername: Aucun nom d'utilisateur");
    return false;
  }

  console.log("removeUserFromServerByUsername: Y-a-t'il un server ID ?");
  let serverId = findUserServerByUsername(username);

  if (!serverId) {
    console.log(
      "removeUserFromServerByUsername: Aucun ID de serveur pour l'utilisateur"
    );
    return false;
  }

  let server = servers[serverId];
  if (!server) {
    console.log(
      "removeUserFromServerByUsername: Aucun serveur pour l'utilisateur"
    );
    return false;
  }

  console.log("removeUserFromServerByUsername: serveur:", server);

  if (!server || !server.players[username]) {
    console.log(
      `removeUserFromServerByUsername: Utilisateur ${username} introuvable`
    );
    return false; // L'utilisateur n'est pas trouvé sur le serveur
  }

  // Vérifie si le joueur est l'auteur du serveur, sinon sélection d'un autre
  let playerIsOwner = checkIfPlayerIsOwner(username);
  console.log(
    `removeUserFromServerByUsername: Utilisateur ${username} est propriétaire ?`,
    playerIsOwner
  );
  playerIsOwner && setNewOwner(serverId);

  let isCurrentPlayer = checkIfPlayerIsCurrentPlayer(username);
  console.log(
    `removeUserFromServerByUsername: Utilisateur ${username} est le joueur actuel ?`,
    isCurrentPlayer
  );
  isCurrentPlayer && server.nextPlayer();

  // Supprime l'utilisateur du serveur
  delete server.players[username];
  console.log(
    `removeUserFromServerByUsername: Utilisateur ${username} supprimé`
  );

  // Réajustement des positions des joueurs restants
  let players = Object.entries(server.players)
    .map(([key, value]) => ({
      username: key,
      position: value.position,
    }))
    .sort((a, b) => a.position - b.position); // Trier par position croissante

  console.log(
    "removeUserFromServerByUsername: Positions avant ajustement:",
    players
  );

  // Réattribuer les positions
  players.forEach((player, index) => {
    server.players[player.username].position = index + 1;
  });

  console.log(
    "removeUserFromServerByUsername: Positions après ajustement:",
    players
  );

  // Supprime le serveur s'il est vide
  cleanupInactiveServer(serverId);

  return true;
};

/**
 * Retourne la liste des serveurs.
 *
 * @param {object} request - La requête.
 * @param {function} callback - La fonction de rappel à exécuter après avoir obtenu la liste des serveurs.
 */
exports.serverList = (request, callback) => {
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

  server.reset();
  server.startGame();

  callback({
    success: true,
    message: `Serveur initialisé`,
    data: server,
  });

  request.io
    .to(request.server_id)
    .emit("server:update", servers[request.server_id]);
};

/**
 * Démarre le jeu sur un serveur existant.
 *
 * @param {object} request - La requête contenant l'identifiant du serveur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir démarré le jeu.
 */
exports.startGame = (request, callback) => {
  const server = servers.find((s) => s.id === parseInt(request.server_id));

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
      feurouge: attackedPlayer.bonus.vehiculeprioritaire,
      crevaison: attackedPlayer.bonus.increvable,
      accident: attackedPlayer.bonus.asduvolant,
      pannedessence: attackedPlayer.bonus.citerne,
      limitedevitesse: attackedPlayer.bonus.vehiculeprioritaire,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "limitedevitesse"
        ? attackedPlayer.states.limitedevitesse
        : ["accident", "crevaison", "feurouge", "pannedessence"].some(
            (state) => attackedPlayer.states[state]
          );

    if (isProtectedByBonus || hasBlockingState) {
      return callback({
        success: false,
        message: `Le joueur ${attackedPlayer.username} est protégé et ne peut pas être attaqué`,
      });
    }

    attackedPlayer.states[card.tag] = true;
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

    return request.io.to(request.server_id).emit("game:next-round", {
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
    if (plr.username === playerUsername) {
      return false;
    }

    const bonusProtectionMap = {
      feurouge: plr.bonus.vehiculeprioritaire,
      crevaison: plr.bonus.increvable,
      accident: plr.bonus.asduvolant,
      pannedessence: plr.bonus.citerne,
      limitedevitesse: plr.bonus.vehiculeprioritaire,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "limitedevitesse"
        ? plr.states.limitedevitesse
        : ["accident", "crevaison", "feurouge", "pannedessence"].some(
            (state) => plr.states[state]
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
    feuvert: player.states.feurouge,
    findelimitedevitesse: player.states.limitedevitesse,
    essence: player.states.pannedessence,
    reparation: player.states.accident,
    rouedesecours: player.states.crevaison,
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
      condition: player.bonus.vehiculeprioritaire,
      message: `Vous êtes déjà immunisé (Véhicule prioritaire)`,
    },
    findelimitedevitesse: {
      condition: player.bonus.vehiculeprioritaire,
      message: `Vous êtes déjà immunisé (Véhicule prioritaire)`,
    },
    essence: {
      condition: player.bonus.citerne,
      message: `Vous êtes déjà immunisé (Citerne)`,
    },
    reparation: {
      condition: player.bonus.asduvolant,
      message: `Vous êtes déjà immunisé (As du volant)`,
    },
    rouedesecours: {
      condition: player.bonus.increvable,
      message: `Vous êtes déjà immunisé (Increvable)`,
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
      player.states.feurouge = false;
      break;
    case "findelimitedevitesse":
      player.states.limitedevitesse = false;
      break;
    case "essence":
      player.states.pannedessence = false;
      break;
    case "reparation":
      player.states.accident = false;
      break;
    case "rouedesecours":
      player.states.crevaison = false;
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

  if (servers[request.server_id].length === 0) {
    return this.endGame(request);
  }
  return request.io.to(request.server_id).emit("game:next-round", {
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
    player.states.feurouge ||
    player.states.accident ||
    player.states.crevaison ||
    player.states.pannedessence
  ) {
    let message = "Vous ne pouvez plus rouler";
    if (player.states.feurouge) {
      message = "Vous êtes à l'arrêt (Feu rouge)";
    }
    if (player.states.accident) {
      message = "Vous êtes à l'arrêt (Accident)";
    }
    if (player.states.crevaison) {
      message = "Vous êtes à l'arrêt (Crevaison)";
    }
    if (player.states.pannedessence) {
      message = "Vous êtes à l'arrêt (Panne d'essence)";
    }
    return callback({
      success: true,
      message,
      data: { actionState: false },
    });
  }

  if (player.states.limitedevitesse && card.value > 50) {
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

    if (servers[request.server_id].length === 0) {
      return this.endGame(request);
    }

    return request.io.to(request.server_id).emit("game:next-round", {
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
  switch (card.tag) {
    case "asduvolant":
      player.bonus.asduvolant = true;
      player.states.accident = false;
      break;
    case "vehiculeprioritaire":
      player.bonus.vehiculeprioritaire = true;
      player.states.feurouge = false;
      player.states.limitedevitesse = false;
      break;
    case "citerne":
      player.bonus.citerne = true;
      player.states.pannedessence = false;
      break;
    case "increvable":
      player.bonus.increvable = true;
      player.states.crevaison = false;
      break;
    default:
      break;
  }

  servers[request.server_id].updatePlayer(playerUsername, player);
  servers[request.server_id].removeCard(playerUsername, card.id);
  servers[request.server_id].drawCard(playerUsername);
  callback({
    success: true,
    message: `Bonus ajouté.`,
    data: { actionState: true, player: playerUsername, card },
  });

  if (servers[request.server_id].length === 0) {
    return this.endGame(request);
  }

  return request.io.to(request.server_id).emit("game:next-round", {
    servers: servers[request.server_id],
    data: {
      type: "bonus",
      player: playerUsername,
      card,
    },
  });
};

/**
 * Supprime une carte d'un joueur.
 *
 * @param {object} request - La requête contenant les informations de la carte et du joueur.
 * @param {function} callback - La fonction de rappel à exécuter après avoir supprimé la carte.
 */
exports.removeCard = (request, callback) => {
  const { card } = request;
  const playerUsername = request.user.username;
  servers[request.server_id].removeCard(playerUsername, card.id);
  servers[request.server_id].drawCard(playerUsername);
  servers[request.server_id].nextPlayer();

  if (servers[request.server_id].length === 0) {
    return this.endGame(request);
  }

  return request.io.to(request.server_id).emit("game:next-round", {
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
    .to(request.server_id)
    .emit("game:is-over", servers[request.server_id]);
};
