let users = {};

const addUser = ({ username, id, socket_id }) => {
  if (username && id !== undefined && id !== null && socket_id) {
    users[username] = {
      username,
      id: Number(id),
      socket_id,
      current_server: null,
      removalTimer: false,
    };
    return true;
  }
  return false;
};

const findUser = ({ username, id, socket_id }) => {
  if (username) return users[username] || null;
  if (id) return Object.values(users).find((user) => user.id === id) || null;
  if (socket_id)
    return (
      Object.values(users).find((user) => user.socket_id === socket_id) || null
    );
  return null;
};

module.exports = { users, addUser, findUser };
