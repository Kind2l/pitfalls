let users = {};
let servers = {};

/**
 * Ajoute un utilisateur à la liste des utilisateurs connectés.
 *
 * @param {object} params - Les paramètres de l'utilisateur à ajouter.
 * @param {string} params.username - Le nom d'utilisateur.
 * @param {number} params.id - L'ID unique de l'utilisateur.
 * @param {string} params.socket_id - Le Socket ID de l'utilisateur.
 * @returns {boolean} - Retourne `true` si l'utilisateur a été ajouté avec succès, sinon `false`.
 *
 */
const addUser = ({ username, id, socket_id, isGuest }) => {
  console.log(`data addPlayer: Entrée dans la fonction`);

  if (!username || !id || !socket_id) {
    return false;
  }

  users[username] = {
    username,
    id: Number(id),
    socket_id,
    current_server: null,
    isGuest,
  };

  console.log("UTILISATEURS - add", users);
  return true;
};

/**
 * Met à jour un utilisateur par son nom d'utilisateur (username).
 * @param {object} param - L'objet contenant le nom d'utilisateur.
 * @param {string} param.username - Le nom d'utilisateur à supprimer.
 * @param {object} param.update - L'élement a mettre à jour.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé, sinon `false`.
 */
const updateUser = ({ username, update }) => {
  if (!users[username]) return false;

  Object.assign(users[username], update);
  return true;
};

/**
 * Supprime un utilisateur par son nom d'utilisateur (username).
 * @param {object} param - L'objet contenant le nom d'utilisateur.
 * @param {string} param.username - Le nom d'utilisateur à supprimer.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé, sinon `false`.
 */
const removeUserByUsername = (username) => {
  if (!username) return false;
  let user = findUserByUsername(username);
  if (!user) return false;
  delete users[username];

  console.log("removeUserByUsername - Suppression de l'utilisateur", username);
  console.log("removeUserByUsername - Liste des utilisateurs", users);

  return true;
};

/**
 * Recherche un utilisateur dans la liste des utilisateurs par son nom d'utilisateur (username).
 *
 * @param {string} username - Le nom d'utilisateur à rechercher.
 * @returns {object|null} - L'utilisateur correspondant s'il est trouvé, sinon `null`.
 *
 */
const findUserByUsername = (username) => {
  if (!username) {
    return null;
  }
  return users[username] || null;
};

/**
 * Trouve un utilisateur à partir de son socket ID.
 *
 * @param {Array} users - Liste des utilisateurs connectés.
 * @param {string} socket_id - L'ID du socket à rechercher.
 * @returns {object|null} - L'utilisateur correspondant ou `null` s'il n'existe pas.
 */ findUserBySocketId = (socket_id) => {
  if (!socket_id) {
    return null;
  }
  return (
    Object.values(users).find((user) => user.socket_id === socket_id) || null
  );
};

// const setUserTimer = (data) => {
//   let username = data.username;
//   let activate = data.activate;

//   if (!users[username]) {
//     return null;
//   }

//   if (activate) {
//     users[username].removalTimer = setTimeout(() => {
//       let server_id = users[username].current_server;
//       removeUser({ username: username });
//     }, 10000); // 10 secondes
//   } else {
//     if (users[username].removalTimer) {
//       clearTimeout(users[username].removalTimer);
//       users[username].removalTimer = null;
//     }
//   }

// };

/**
 * Trouve l'ID du serveur auquel un utilisateur est connecté en utilisant son nom d'utilisateur.
 *
 * @param {object} params - Paramètres pour la recherche de l'utilisateur.
 * @returns {string|null}  - L'ID du serveur auquel l'utilisateur est connecté ou null si l'utilisateur n'est pas connecté à un serveur.
 *
 */
const findUserServerByUsername = (username) => {
  console.log("findUserServerByUsername: Entrée dans la fonction");
  console.log(
    "findUserServerByUsername: Y-a-t'il un nom d'utilisateur ?",
    username
  );
  if (!username) {
    return false;
  }
  let user = users[username];
  console.log("findUserServerByUsername: Y-a-t'il un utilisateur ?", user);

  return user ? user.current_server : null;
};

/**
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {string} username - Le nom d'utilisateur à supprimer du serveur.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé avec succès, sinon `false`.
 *
 */
const removeUserFromServer = (username) => {
  console.log("removeUserFromServer: Entrée dans la fonction");
  console.log(
    "removeUserFromServer: Y-a-t'il un nom d'utilisateur ?",
    username
  );
  if (!username) {
    return false;
  }

  // Récupère l'ID du serveur auquel l'utilisateur appartient
  console.log(
    "removeUserFromServer: Recherche de l'ID serveur de l'utilisateur"
  );
  const serverId = findUserServerByUsername(username);
  console.log(serverId);
  // Vérifie si un serveur est associé à cet utilisateur
  if (!serverId) {
    return false;
  }

  console.log("removeUserFromServer: Vérification de la présence du serveur");
  if (!servers[serverId]) {
    return false;
  }
  // Récupère la liste des joueurs sur le serveur
  // const serverPlayers = getUsersFromServerByServerId(serverId);
  console.log(
    "removeUserFromServer: Vérification de la présence de joueurs dans le serveur"
  );
  if (!servers[serverId].players) {
    return false;
  }
  console.log("removeUserFromServer: Vérification de la présence du joueur");
  if (!servers[serverId].players[username]) {
    return false;
  }
  console.log("removeUserFromServer: Suppression du joueur dans le serveur");
  delete servers[serverId].players[username];
  console.log("removeUserFromServer: Vérification que le joueur soit l'auteur");
  let playerIsOwner = checkIfPlayerIsHost(username);
  console.log(playerIsOwner);
  playerIsOwner && setNewHost(serverId);
  console.log("removeUserFromServer: Nettoyage serveur si inactif");
  cleanupInactiveServer(serverId);

  console.log("UTILISATEURS - rmFromServer", users);

  // Parcourt les joueurs pour trouver et supprimer l'utilisateur
  // for (const playerId in serverPlayers) {
  //   if (serverPlayers[playerId].username === username) {
  //     delete serverPlayers[playerId];
  //     log(`${username} a été supprimé du serveur ${serverId}`);

  //     users[username].current_server = null;
  //     return true;
  //   }
  // }
  return true;
};

/**
 * Supprime un utilisateur d'un serveur en utilisant son nom d'utilisateur.
 *
 * @param {string} username - Le nom d'utilisateur à supprimer du serveur.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé avec succès, sinon `false`.
 *
 */
const getUsersFromServerByServerId = (serverId) => {
  if (!serverId) {
    return null;
  }

  if (servers[serverId]) {
    return servers[serverId].players || null;
    Object.keys(servers);
  } else {
    return false;
  }
};

/**
 * Retourne une version filtrée des serveurs sans inclure les cartes des joueurs ni les cartes restantes.
 *
 * @param {object} servers - Liste des serveurs (clés : server_id, valeurs : GameModel).
 * @returns {object} - Version des serveurs avec les informations essentielles uniquement.
 */
const getFilteredServers = () => {
  // Création d'une copie filtrée des serveurs
  const filteredServers = {};

  for (const [serverId, server] of Object.entries(servers)) {
    filteredServers[serverId] = {
      id: server.id,
      name: server.name,
      host: server.host,
      players: {},
      maxPlayers: server.maxPlayers,
      currentPlayer: server.currentPlayer,
      start: server.start,
      type: server.type,
    };

    // Filtrage des joueurs pour exclure les cartes
    for (const [username, player] of Object.entries(server.players)) {
      filteredServers[serverId].players[username] = {
        id: player.id,
        username: player.username,
        score: player.score,
        bonus: player.bonus,
        states: player.states,
      };
    }
  }

  return filteredServers;
};

/**
 * Retourne une version filtrée d'un serveur sans inclure les cartes des joueurs ni les cartes restantes.
 *
 * @param {string} serverId - ID du serveur à filtrer.
 * @param {object} servers - Liste des serveurs (clés : server_id, valeurs : GameModel).
 * @returns {object|false} - Version du serveur avec les informations essentielles uniquement, ou `false` si le serveur n'existe pas.
 */
const getFilteredServer = (serverId) => {
  if (!servers || typeof servers !== "object") return false; // Vérification si `servers` est valide
  const server = servers[serverId];

  if (!server) return false; // Si le serveur n'existe pas, retourne `false`

  return {
    id: server.id,
    name: server.name,
    host: server.host,
    maxPlayers: server.maxPlayers,
    currentPlayer: server.currentPlayer,
    start: server.start,
    players: Object.fromEntries(
      Object.entries(server.players).map(([username, player]) => [
        username,
        {
          id: player.id,
          username: player.username,
          score: player.score,
          bonus: player.bonus,
          states: player.states,
        },
      ])
    ),
  };
};

/**
 * Supprime le serveur si il n'y a plus de joueurs et que la partie n'a pas démarré.
 *
 * @param {string} serverId - L'ID du serveur à vérifier.
 * @returns {void}
 */
const cleanupInactiveServer = (serverId) => {
  const server = servers[serverId];

  if (!server) {
    console.log(`Aucun serveur trouvé avec l'ID : ${serverId}`);
    return null;
  }

  // Vérifie si le serveur est vide et que la partie n'a pas commencé
  if (Object.keys(server.players).length === 0 && server.start === false) {
    delete servers[serverId];
    console.log(`Serveur ${serverId} supprimé car il est vide et non démarré.`);
    return true;
  }
  console.log(`Encore des joueurs dans le serveur ${serverId}`);

  return false;
};

/**
 * Vérifie si un joueur est le joueur actuel de la partie.
 *
 * @param {string} username - Le nom d'utilisateur à vérifier.
 * @returns {boolean} - Retourne `true` si le joueur est le joueur actuel, sinon `false`.
 */
const checkIfPlayerIsCurrentPlayer = (username) => {
  if (!username) return false;

  const serverId = findUserServerByUsername(username);
  const server = servers[serverId];

  if (!server || !server.players[username]) return false;

  return server.currentPlayer === server.players[username].position;
};

/**
 * Vérifie si un joueur est le propriétaire du serveur auquel il est connecté.
 *
 * @param {string} username - Le nom d'utilisateur du joueur.
 * @returns {boolean} - Retourne `true` si l'utilisateur est propriétaire, sinon `false`.
 */
const checkIfPlayerIsHost = (username) => {
  const user = findUserByUsername(username);

  if (!user?.current_server) return false;

  const server = servers[user.current_server];

  if (!server) return false;

  return server.host === username;
};

/**
 * Définit un nouveau propriétaire parmi les joueurs restants du serveur.
 *
 * @param {string} serverId - L'ID du serveur.
 * @returns {boolean} - Retourne `true` si un nouveau propriétaire a été défini, sinon `false`.
 */
const setNewHost = (serverId) => {
  const server = servers[serverId];

  if (!server || !server.players || typeof server.players !== "object") {
    return false; // Serveur invalide ou vide
  }

  const remainingPlayers = Object.values(server.players).filter(
    ({ username }) => username !== server.host
  );

  if (remainingPlayers.length === 0) {
    return false; // Aucun autre joueur disponible
  }

  // Sélection aléatoire d'un nouveau propriétaire
  const newHost =
    remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]
      .username;

  server.host = newHost;
  return true; // Succès
};

/**
 * Génère de faux serveurs dans data
 */

// function generateRandomString() {
//   const chars = "abcdefghijklmnopqrstuvwxyz ";
//   const length = Math.floor(Math.random() * (9 - 4 + 1)) + 4;
//   let result = "";

//   for (let i = 0; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length));
//   }

//   return result.trim(); // Évite les espaces au début et à la fin
// }

// const createFakeServer = () => {
//   const serverId = `fk-${Date.now()}`;
//   const serverName = generateRandomString();
//   const maxPlayers = 3; // Exemple : fixe à 4 joueurs pour donner l'impression d'être complet

//   servers[serverId] = {
//     id: serverId,
//     name: serverName,
//     author: faker.internet.username(),
//     players: {},
//     maxPlayers: maxPlayers,
//     currentPlayer: null,
//     start: true,
//   };

//   // Ajouter des faux joueurs
//   for (let i = 1; i <= maxPlayers; i++) {
//     const username = `Joueur_${Math.floor(Math.random() * 1000)}`;
//     servers[serverId].players[username] = {
//       id: i,
//       username: username,
//       score: 0,
//       bonus: [],
//       states: [],
//     };
//   }

//   console.log(`Serveur factice créé : ${serverName} (${serverId})`);

//   // Définir la suppression automatique entre 5 et 13 minutes
//   const lifetime = Math.floor(Math.random() * (13 - 5 + 1) + 5) * 60 * 1000;
//   setTimeout(() => {
//     delete servers[serverId];
//     console.log(`Serveur factice supprimé : ${serverName}`);
//   }, lifetime);
// };

// // Créer un serveur factice toutes les 13 minutes
// setInterval(() => {
//   createFakeServer();
// }, 13 * 60 * 1000);

// // Lancer quelques serveurs au démarrage pour qu'il y en ait dès le début
// const initialFakeServers = Math.floor(Math.random() * 5) + 1;
// for (let i = 0; i < initialFakeServers; i++) {
//   createFakeServer();
// }

module.exports = {
  users,
  servers,
  addUser,
  updateUser,
  removeUserByUsername,
  findUserByUsername,
  findUserBySocketId,
  findUserServerByUsername,
  removeUserFromServer,
  getUsersFromServerByServerId,
  getFilteredServers,
  getFilteredServer,
  cleanupInactiveServer,
  checkIfPlayerIsHost,
  checkIfPlayerIsCurrentPlayer,
  setNewHost,
};
