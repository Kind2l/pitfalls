const { faker } = require("@faker-js/faker");

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
const addUser = ({ username, id, socket_id }) => {
  // Vérifie si tous les paramètres requis sont fournis et valides
  if (!username || id === undefined || id === null || !socket_id) {
    console.log("Échec de l'ajout de l'utilisateur : paramètres invalides", {
      username,
      id,
      socket_id,
    });
    return false;
  }

  // Ajoute l'utilisateur à la liste
  users[username] = {
    username,
    id: Number(id),
    socket_id,
    current_server: null, // L'utilisateur n'est connecté à aucun serveur par défaut
    removalTimer: false, // Indique si un compte à rebours de suppression est actif
  };

  console.log(`Utilisateur ${username} ajouté avec succès`);
  console.log(`Liste des utilisateurs :`, users);
  return true;
};

const updateUser = ({ username, update }) => {
  let user = findUserByUsername(username);
  if (!user) {
    return false;
  }
  if (update.socket_id) {
    users[username].socket_id = update.socket_id;
  }
  if (update.current_server) {
    users[username].current_server = update.current_server;
  }
  return true;
};

/**
 * Supprime un utilisateur par son nom d'utilisateur (username).
 * @param {object} param - L'objet contenant le nom d'utilisateur.
 * @param {string} param.username - Le nom d'utilisateur à supprimer.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé, sinon `false`.
 */
const removeUserByUsername = (username) => {
  let user = findUserByUsername(username);
  if (user) {
    if (user.current_server) {
      removeUserFromServer(username);
    }
    delete users[username];
    console.log(`Suppression du joueur ${username}`);
    return true;
  }
  console.log("État des utilisateurs:", users);
  console.log("État des serveurs:", servers);
  return false;
};

/**
 * Supprime un utilisateur par son SocketId.
 * @param {object} param - L'objet contenant le SocketId de l'utilisateur.
 * @param {string} param.socketId - Le SocketId de l'utilisateur à supprimer.
 * @returns {boolean} Retourne `true` si l'utilisateur a été supprimé, sinon `false`.
 *
 */
const removeUserBySocketId = (socketId) => {
  // Trouver l'utilisateur par son socketId
  const user = Object.values(users).find((u) => u.socketId === socketId);

  if (user) {
    if (user.current_server) {
      removeUserFromServer({ username: user.username });
    }
    delete users[user.username];
    console.log(`Suppression du joueur avec SocketId ${socketId}`);
    return true;
  }
  console.log("État des utilisateurs:", users);
  console.log("État des serveurs:", servers);
  return false;
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
 * Recherche un utilisateur dans la liste des utilisateurs par son identifiant de socket (socket_id).
 *
 * @param {string} socket_id - L'identifiant de socket à rechercher.
 * @returns {object|null} - L'utilisateur correspondant s'il est trouvé, sinon `null`.
 *
 */
const findUserBySocketId = (socket_id) => {
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
  let playerIsOwner = checkIfPlayerIsOwner(username);
  console.log(playerIsOwner);
  playerIsOwner && setNewOwner(serverId);
  console.log("removeUserFromServer: Nettoyage serveur si inactif");
  cleanupInactiveServer(serverId);

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
  } else {
    console.log(`Serveur ${serverId} introuvable`);
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
      author: server.author,
      players: {},
      maxPlayers: server.maxPlayers,
      currentPlayer: server.currentPlayer,
      start: server.start,
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
 * Vérifie si un joueur est le joueur actuel de la partie
 *
 * @param {string} username - Le nom d'utilisateur à vérifier.
 * @returns {boolean} - Retourne `true` si le joueur est le propriétaire, sinon `false`.
 */
const checkIfPlayerIsCurrentPlayer = (username) => {
  if (!username) {
    return false;
  }

  const serverId = findUserServerByUsername(username);

  if (!serverId) {
    return false;
  }

  const server = servers[serverId];
  if (!server) {
    return false;
  }
  console.log(server.players[username].position);

  return server.currentPlayer === server.players[username].position;
};

/**
 * Vérifie si un joueur est le propriétaire du serveur dans lequel il se trouve.
 *
 * @param {string} username - Le nom d'utilisateur à vérifier.
 * @returns {boolean} - Retourne `true` si le joueur est le propriétaire, sinon `false`.
 */
const checkIfPlayerIsOwner = (username) => {
  const user = findUserByUsername(username);

  if (!user) {
    console.log(`Utilisateur ${username} non trouvé`);
    return false;
  }

  const serverId = user.current_server;

  if (!serverId) {
    console.log(`L'utilisateur ${username} n'est connecté à aucun serveur`);
    return false;
  }

  const server = servers[serverId];

  if (!server) {
    console.log(`Aucun serveur trouvé avec l'ID : ${serverId}`);
    return false;
  }

  return server.author === username;
};

/**
 * Définit un nouveau propriétaire parmi les joueurs qui sont dans le serveur.
 *
 * @param {string} serverId - L'ID du serveur.
 * @returns {boolean} - Retourne `true` si le nouveau propriétaire a été défini, sinon `false`.
 */
const setNewOwner = (serverId) => {
  const server = servers[serverId];

  if (!server) {
    console.log(`Aucun serveur trouvé avec l'ID : ${serverId}`);
    return false;
  }

  const currentOwner = server.author;
  const remainingPlayers = Object.values(server.players).filter(
    (player) => player.username !== currentOwner
  );

  if (remainingPlayers.length === 0) {
    console.log(
      `Aucun joueur restant pour devenir le nouveau propriétaire du serveur ${serverId}`
    );
    return false;
  }

  // Sélectionner un nouveau propriétaire au hasard parmi les joueurs restants
  const randomIndex = Math.floor(Math.random() * remainingPlayers.length);
  const newOwner = remainingPlayers[randomIndex];
  server.author = newOwner.username;

  console.log(
    `Nouveau propriétaire du serveur ${serverId} : ${newOwner.username}`
  );
  return true;
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
  removeUserBySocketId,
  removeUserByUsername,
  findUserByUsername,
  findUserBySocketId,
  findUserServerByUsername,
  removeUserFromServer,
  getUsersFromServerByServerId,
  getFilteredServers,
  cleanupInactiveServer,
  checkIfPlayerIsOwner,
  checkIfPlayerIsCurrentPlayer,
  setNewOwner,
};
