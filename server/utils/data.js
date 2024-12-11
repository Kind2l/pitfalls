let users = {};
let servers = {};

const addUser = ({ username, id, socket_id }) => {
  if (username && id !== undefined && id !== null && socket_id) {
    users[username] = {
      username: username,
      id: Number(id),
      socket_id: socket_id,
      current_server: null,
      removalTimer: false,
    };
    return true;
  } else {
    return false;
  }
};

const updateUser = ({ username, update }) => {
  let user = findUser({ username: username });

  if (user) {
    if (update.socket_id) {
      users[username].socket_id = update.socket_id;
    }
    if (update.current_server) {
      users[username].current_server = update.current_server;
    }
    return true;
  } else {
    return false;
  }
};

const removeUser = ({ username }) => {
  let user = findUser({ username });
  if (user) {
    if (user.current_server) {
      removeUserFromServer({ username: username });
    }
    delete users[username];
    console.log(`suppression du joueur ${username} `);
    return true;
  }
  return false;
};

const findUser = ({ username, id, socket_id }) => {
  if (username) {
    return users[username] || null;
  }

  if (id) {
    let user = Object.values(users).find((user) => user.id === id);
    if (user) {
      return user;
    }
  }

  if (socket_id) {
    let user = Object.values(users).find(
      (user) => user.socket_id === socket_id
    );
    if (user) {
      return user;
    }
  }

  return null;
};

const setUserTimer = (data) => {
  let username = data.username;
  let activate = data.activate;

  if (!users[username]) {
    return null;
  }

  if (activate) {
    users[username].removalTimer = setTimeout(() => {
      let server_id = users[username].current_server;
      removeUser({ username: username });
    }, 10000); // 10 secondes
  } else {
    if (users[username].removalTimer) {
      clearTimeout(users[username].removalTimer);
      users[username].removalTimer = null;
    } else {
    }
  }
};

const findServerOfUser = ({ username }) => {
  let user = users[username];
  if (user) {
    if (user.current_server) {
      return user.current_server;
    } else {
      return null;
    }
  }
  return null;
};

const removeUserFromServer = ({ username }) => {
  let server_id = findServerOfUser({ username: username });
  if (!server_id) {
    return false;
  }

  const serverPlayers = servers[server_id].players;

  for (const playerId in serverPlayers) {
    if (serverPlayers[playerId].username === username) {
      delete serverPlayers[playerId];
      return true;
    }
  }

  console.error(
    `L'utilisateur ${username} n'a pas été trouvé sur le serveur ${server_id}`
  );
  return false;
};

module.exports = {
  users,
  servers,
  addUser,
  updateUser,
  removeUser,
  findUser,
  setUserTimer,
  findServerOfUser,
  removeUserFromServer,
};
