let users = {};
let servers = {};

const addUser = ({ username, id, socket_id }) => {
  if (username && id && socket_id) {
    users[username] = {
      id: id,
      socket_id: socket_id,
      current_server: null,
      removalTimer: false,
    };
    console.log(`data : Utilisateur ajouté : ${username}`, users[username]);
    return true;
  } else {
    console.error(`data : Impossible d'ajouter un nouvel utilisateur`);
    return false;
  }
};

const updateUser = ({ username, update }) => {
  let user = findUser(username);

  if (user) {
    if (update.socket_id) {
      user.socket_id = update.socket_id;
      console.log(
        `data : Socket ID mis à jour pour l'utilisateur : ${username}`
      );
    }
    if (update.current_server) {
      user.current_server = update.current_server;
      console.log(
        `data : Server ID mis à jour pour l'utilisateur : ${username}`
      );
    }
    return true;
  } else {
    console.error(
      `data : Utilisateur non trouvé pour la mise à jour : ${username}`
    );
    return false;
  }
};

const removeUser = ({ username }) => {
  let user = findUser(username);
  if (user) {
    if (user.current_server) {
      const serverPlayers = servers[user.current_server].players;
      servers[user.current_server].players = serverPlayers.filter(
        (player) => player.username !== username
      );
    }
    delete users[username];
    console.log(`Utilisateur ${username} supprimé.`);
    return true;
  }
  console.error(
    `Tentative de suppression échouée : utilisateur non trouvé (${username})`
  );
  return false;
};

const findUser = ({ username, id, socket_id }) => {
  if (username) {
    return users[username] || null;
  }

  if (id) {
    let user = Object.values(users).find((user) => user.id === id);
    if (user) {
      console.log(`Utilisateur trouvé par ID : ${id}`);
      return user;
    }
  }

  if (socket_id) {
    let user = Object.values(users).find(
      (user) => user.socket_id === socket_id
    );
    if (user) {
      console.log(`Utilisateur trouvé par Socket ID : ${socket_id}`);
      return user;
    }
  }

  console.error("Aucun utilisateur trouvé avec les critères donnés :", data);
  return null;
};

const setUserTimer = (data) => {
  console.log("activation du removal timer");
  let username = data.username;
  let activate = data.activate;

  if (!users[username]) {
    console.error(
      `Impossible de démarrer le timer : utilisateur non trouvé (${username})`
    );
    return null;
  }

  if (activate) {
    console.log(`Compte à rebours de suppression démarré pour ${username}.`);
    users[username].removalTimer = setTimeout(() => {
      let server_id = users[username].current_server;
      removeUser({ username: username });
      // servers[server_id].player;
      console.log(servers[server_id].players);
      console.log(`Utilisateur ${username} supprimé après le délai.`);
    }, 10000); // 10 secondes
  } else {
    if (users[username].removalTimer) {
      clearTimeout(users[username].removalTimer);
      users[username].removalTimer = null;
      console.log(`Compte à rebours annulé pour ${username}.`);
    } else {
      console.log(`Aucun compte à rebours en cours pour ${username}.`);
    }
  }
};

const findUserServer = ({ username }) => {
  let userServer = users[username].current_server;
  if (userServer) {
    return userServer;
  } else {
    return null;
  }
};

module.exports = {
  users,
  servers,
  addUser,
  updateUser,
  removeUser,
  findUser,
  setUserTimer,
  findUserServer,
};
