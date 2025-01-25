let servers = {};

const findServerOfUser = ({ username, users }) => {
  let user = users[username];
  return user && user.current_server ? user.current_server : null;
};

const removeUserFromServer = ({ username, users }) => {
  let server_id = findServerOfUser({ username, users });
  if (!server_id) {
    console.log(`Serveur non trouvé pour ${username}`);
    return false;
  }

  const serverPlayers = servers[server_id]?.players || {};
  for (const playerId in serverPlayers) {
    if (serverPlayers[playerId].username === username) {
      delete serverPlayers[playerId];
      console.log(`${username} retiré du serveur ${server_id}`);
      return true;
    }
  }

  console.log(`${username} introuvable sur ${server_id}`);
  return false;
};

module.exports = { servers, findServerOfUser, removeUserFromServer };
