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
const filter = require("leo-profanity");
const frenchBadwordsList = require("french-badwords-list");
filter.clearList();
filter.add(frenchBadwordsList.array);
filter.add([
  "salope",
  "sal0pe",
  "s4lope",
  "salop3",
  "salo.p3",
  "s@lope",
  "s4l0pe",
  "salopee",
  "saloperie",
  "salaupe",
  "salaupeee",
  "chibre",
  "ch1bre",
  "chibree",
  "chib.re",
  "chibr3",
  "ch!bre",
  "chibrou",
  "nazi",
  "naz1",
  "n@zi",
  "n4zi",
  "n@z1",
  "nazie",
  "naz1e",
  "n4zie",
  "n@zie",
  "n4z1e",
  "hitler",
  "h1tler",
  "h!tler",
  "hîtler",
  "hítler",
  "h1tl3r",
  "h!tl3r",
  "h1t1er",
  "h1tlêr",
  "h1t|er",
  "h.tler",
  "h/tler",
  "hît1er",
  "reich",
  "r3ich",
  "rêich",
  "r€ich",
  "r3!ch",
  "r3îch",
  "r3ichh",
  "reych",
  "r-eich",
  "r/ech",
  "thirdreich",
  "3rdreich",
  "fuehrer",
  "fuhrer",
  "fuh_rer",
  "führer",
  "füh_rer",
  "fuhr€r",
  "fuhreeer",
  "fuhr3r",
  "fuh.rer",
  "fu/h_rer",
  "ss",
  "bamboula",
  "bamb0ula",
  "b4mboula",
  "b@mboula",
  "bamb0ul4",
  "bamb0u1a",
  "bamboulah",
  "bamboulaa",
  "bamb.oula",
  "b@mb0ul@",
  "penis",
  "p3nis",
  "pénis",
  "pén1s",
  "pen1s",
  "p3n1s",
  "p3n!s",
  "p.nis",
  "p-nis",
  "p3n1$",
  "peniss",
  "peni$",
  "p3n!$",
  "p3ni5",
  "grospenis",
  "gros-penis",
  "gr0spenis",
  "gr0s-p3n1s",
  "gr0s-p3n!s",
  "gr0sp3n1s",
  "gr0spenis",
  "gro$pen1s",
  "gros_penis",
  "gr0$pen!s",
  "gr0s_p3n1s",
  "gr0s_penis",
  "gr0spenis$",
]);

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
        message: "Le nom du serveur est requis et doit être une chaîne.",
      });
    }

    request.serverName.trim();

    if (request?.serverName.length > 35) {
      console.error("createServer: Nom du serveur invalide ou absent.");
      return callback({
        success: false,
        message: "Nom de serveur trop long (maximum 35 caractères).",
      });
    }

    if (request?.serverName.length < 2) {
      return callback({
        success: false,
        message: "Nom de serveur trop court (minimum 2 caractères).",
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

    console.log(
      "createServer: Paramètres validés, début de la création du serveur."
    );

    const uniqueId = uuidv4();
    let filteredserverName = filter.clean(request.serverName);

    const newServer = new GameModel(
      uniqueId,
      filteredserverName,
      request.user.username,
      request.maxPlayers,
      request.cardCounts || {}
    );

    servers[uniqueId] = newServer;

    if (request.socket) {
      request.socket.join(`server_${uniqueId}`);
      console.log(
        `createServer: ${request.socket.id} s'abonne au serveur server_${uniqueId}`
      );
    }

    console.log(`createServer: Serveur créé avec succès ${uniqueId}`);
    return callback({
      success: true,
      message: "Le serveur est créé avec succès.",
      data: {
        server_id: uniqueId,
      },
    });
  } catch (error) {
    console.error("createServer: Erreur catch:", error);
    return callback({
      success: false,
      message:
        "Une erreur inattendue s'est produite lors de la création du serveur.",
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

    console.log("joinServer: Début de validation des paramètres.");
    // Validation des paramètres requis
    if (!server_id || typeof server_id !== "string") {
      console.error("joinServer: ID du serveur manquant ou invalide.");
      return callback({
        success: false,
        message: "L'ID du serveur est requis et doit être une chaîne.",
      });
    }
    console.log(`joinServer: ID du serveur : ${server_id}`);

    if (!user || !user.username || typeof user.username !== "string") {
      console.error(
        "joinServer: Informations utilisateur manquantes ou invalides."
      );
      return callback({
        success: false,
        message: "Les informations utilisateur sont incomplètes ou invalides.",
      });
    }

    console.log(`joinServer: Joueur souhaitant rejoindre : ${user.username}`);

    const server = servers[server_id];
    if (!server) {
      console.error(`joinServer: Serveur introuvable. ID: ${server_id}`);
      return callback({
        success: false,
        message: "Serveur introuvable.",
      });
    }

    console.log(`joinServer: Serveur trouvé :`, servers[server_id]);

    if (
      Object.keys(server.players).length >= server.maxPlayers ||
      server.start === true
    ) {
      console.error(`joinServer: Serveur complet ou jeu déjà commencé.`);
      return callback({
        success: false,
        message: `Le serveur est complet ou le jeu a déjà commencé.`,
      });
    }

    // // Joindre l'utilisateur au canal Socket.io du serveur
    // if (socket) {
    //   socket.join(server_id);
    //   console.log(`joinServer: L'utilisateur join le canal Socket.io}`);
    // } else {
    //   console.error(
    //     "joinServer: Aucun socket fourni. L'utilisateur n'a pas join le canal."
    //   );
    // }

    console.log(`joinServer: Tentative d'ajout du joueur au serveur.`);
    this.addPlayer(request, (response) => {
      if (!response.success) {
        console.error(
          `joinServer: Échec de l'ajout du joueur. Raison: ${response.message}`
        );
        return callback(response); // Retourne l'erreur de `addPlayer`
      } else if (response.success) {
        console.log(`joinServer: Utilisateur ajouté via AddPlayer.`);
      }

      console.log(
        `joinServer: Joueur ajouté avec succès. Utilisateur: ${user.username}, Serveur: ${server_id}`
      );

      // Mise à jour des abonnés à la liste des serveurs
      const filteredServers = getFilteredServers();
      io.emit("subscription:server-list", { servers: filteredServers });

      // Mise à jour des joueurs du serveur concerné
      console.log(
        `joinServer: Mise à jour des joueurs pour le serveur: ${server_id}`
      );
      io.to(server_id).emit("server:update", servers[server_id]);

      // Mise à jour de l'utilisateur
      updateUser({
        username: user.username,
        update: { current_server: server_id },
      });

      // Retour de succès
      callback({
        success: true,
        message: `L'utilisateur ${user.username} a rejoint le serveur.`,
        data: { server },
      });
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

    // Validation des paramètres requis
    if (!server_id || typeof server_id !== "string") {
      console.error("addPlayer: ID du serveur manquant ou invalide.");
      return callback({
        success: false,
        message: "L'ID du serveur est requis et doit être une chaîne.",
      });
    }

    console.log(`addPlayer: ID Serveur : ${server_id}`);

    if (
      !user ||
      !user.id ||
      !user.username ||
      typeof user.username !== "string"
    ) {
      console.error(
        "addPlayer: Informations utilisateur manquantes ou invalides."
      );
      return callback({
        success: false,
        message: "Les informations utilisateur sont incomplètes ou invalides.",
      });
    }

    console.log(`addPlayer: Nom de l'utilisateur : ${user.username}`);

    // Vérification de l'existence du serveur
    const server = servers[server_id];
    if (!server) {
      console.error(`addPlayer: Serveur introuvable. ID: ${server_id}`);
      return callback({
        success: false,
        message: "Serveur introuvable.",
      });
    }

    console.log(`addPlayer: Serveur trouvé :`, server);

    console.log(
      `addPlayer: utilisation de addPlayer (GameModel) pour ajouter l'utilisateur`
    );
    const playerAdded = server.addPlayer(user.id, user.username);
    if (!playerAdded) {
      console.error(
        `addPlayer: Impossible d'ajouter le joueur. ID: ${server_id}`
      );
      return callback({
        success: false,
        message: "Impossible d'ajouter le joueur.",
      });
    }

    console.log(`addPlayer: ${user.username} ajouté au serveur ${server_id}`);

    // Joindre le joueur au canal Socket.io du serveur
    if (socket) {
      socket.join(server_id);
      console.log(
        `addPlayer: L'utilisateur a rejoint le canal Socket.io: ${server_id}`
      );
    } else {
      console.warn(
        "addPlayer: Aucun socket fourni. L'utilisateur n'a pas rejoint le canal."
      );
    }

    // Retourner les informations de succès
    callback({
      success: true,
      message: `L'utilisateur ${user.username} a été ajouté au serveur.`,
      data: { server },
    });

    // Mise à jour des abonnés à la liste des serveurs
    const filteredServers = getFilteredServers();
    console.log("addPlayer: Emission de la liste des serveurs mise à jour.");
    io.emit("subscription:server-list", { servers: filteredServers });
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
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {object} req - La requête contenant les informations de l'utilisateur.
 * @param {function} callback - La fonction de rappel à exécuter après la suppression de l'utilisateur.
 */
exports.leaveServer = (req, callback) => {
  console.log("leaveServer: Entrée dans la fonction");
  try {
    let username = req.user.username || req.username || null;
    if (!username) {
      return callback({
        success: false,
        message: "Aucun nom d'utilisateur",
      });
    }

    let user = findUserByUsername(username);

    if (!user) {
      return callback({
        success: false,
        message: "Aucun utilisateur dans la requête.",
      });
    }

    let isRemoved = this.removeUserFromServerByUsername(username);

    if (isRemoved) {
      let filteredServers = getFilteredServers();
      req.io.emit("subscription:server-list", { servers: filteredServers });
      req.io
        .to(user.current_server)
        .emit("server:update", servers[user.current_server]);

      if (servers[user.current_server]?.players) {
        if (Object.keys(servers[user.current_server].players).length === 0) {
          delete servers[user.current_server];
          let filteredServers = getFilteredServers();
          io.emit("subscription:server-list", { servers: filteredServers });
        } else if (
          Object.keys(servers[user.current_server]?.players).length === 1 &&
          servers[user.current_server].start === true &&
          servers[user.current_server].gameOver === false
        ) {
          this.endGame(req);
        }
      }
    }

    req.io
      .to(user.current_server)
      .emit("server:update", servers[user.current_server]);

    return callback({
      success: isRemoved,
      message: isRemoved
        ? "Utilisateur retiré du serveur"
        : "Échec du retrait de l'utilisateur",
    });
  } catch (error) {
    console.log("leaveServer: erreur catch:", error);

    return callback({
      success: false,
      message: "Erreur durant le retrait du joueur",
    });
  }
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
    const server_id = request?.server_id;
    if (!server_id) {
      console.error("initServer: Aucun identifiant de serveur fourni.");
      return callback({
        success: false,
        message: "Aucun identifiant de serveur fourni.",
      });
    }

    // Récupération du serveur
    const server = servers[server_id];
    if (!server) {
      console.error(
        `initServer: Le serveur avec l'ID ${server_id} n'existe pas.`
      );
      return callback({
        success: false,
        message: "Le serveur n'existe pas.",
      });
    }

    // Réinitialisation et démarrage du jeu
    console.log(`initServer: Réinitialisation du serveur ${server_id}.`);
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
      `initServer: Notification des clients pour le serveur ${server_id}.`
    );
    request.io.to(server_id).emit("server:update", servers[server_id]);
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
      feurouge: attackedPlayer.bonus.cartedepolice,
      zonedecontrole: attackedPlayer.bonus.cartedepolice,
      accident: attackedPlayer.bonus.pilote,
      fatigue: attackedPlayer.bonus.infatiguable,
      embouteillage: attackedPlayer.bonus.deviation,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "zonedecontrole"
        ? attackedPlayer.states.zonedecontrole
        : ["fatigue", "accident", "feurouge", "embouteillage"].some(
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
      feurouge: plr.bonus.cartedepolice,
      accident: plr.bonus.pilote,
      fatigue: plr.bonus.infatiguable,
      embouteillage: plr.bonus.deviation,
      zonedecontrole: plr.bonus.cartedepolice,
    };

    const isProtectedByBonus = bonusProtectionMap[card.tag];
    const hasBlockingState =
      card.tag === "zonedecontrole"
        ? plr.states.zonedecontrole
        : ["fatigue", "accident", "feurouge", "embouteillage"].some(
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
    findezonedecontrole: player.states.zonedecontrole,
    findembouteillage: player.states.embouteillage,
    repose: player.states.fatigue,
    reparation: player.states.accident,
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
      player.states.feurouge = false;
      break;
    case "findezonedecontrole":
      player.states.zonedecontrole = false;
      break;
    case "findembouteillage":
      player.states.embouteillage = false;
      break;
    case "repose":
      player.states.fatigue = false;
      break;
    case "reparation":
      player.states.accident = false;
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
    player.states.fatigue ||
    player.states.accident ||
    player.states.embouteillage
  ) {
    let message = "Vous ne pouvez plus rouler";
    if (player.states.feurouge) {
      message = "Vous êtes à l'arrêt (Feu rouge)";
    }
    if (player.states.fatigue) {
      message = "Vous êtes à l'arrêt (Fatigue)";
    }
    if (player.states.accident) {
      message = "Vous êtes à l'arrêt (Accident)";
    }
    if (player.states.embouteillage) {
      message = "Vous êtes à l'arrêt (Embouteillage)";
    }
    return callback({
      success: true,
      message,
      data: { actionState: false },
    });
  }

  if (player.states.zonedecontrole && card.value > 50) {
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
    case "infatiguable":
      player.bonus.infatiguable = true;
      player.states.fatigue = false;
      break;
    case "cartedepolice":
      player.bonus.cartedepolice = true;
      player.states.feurouge = false;
      player.states.zonedecontrole = false;
      break;
    case "deviation":
      player.bonus.deviation = true;
      player.states.embouteillage = false;
      break;
    case "pilote":
      player.bonus.pilote = true;
      player.states.accident = false;
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

  console.log("deck", Object.keys(servers[request.server_id].deck).length);
  if (Object.keys(servers[request.server_id].deck).length === 0) {
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

  console.log("deck", Object.keys(servers[request.server_id].deck).length);
  if (Object.keys(servers[request.server_id].deck).length === 0) {
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

  let filteredMessage = filter.clean(request.message);

  request.io.in(server).emit("game:player-message", {
    username: request.user.username,
    message: filteredMessage,
  });

  return callback({
    success: true,
    message: `Message envoyé`,
  });
};
