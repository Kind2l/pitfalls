let users = {};

const addUser = (data) => {
  users[data.socketId] = data.username;
};

const removeUser = (id) => {
  delete users[id];
};

const findUser = (id) => {
  return users.hasOwnProperty(id);
};

module.exports = { users, addUser, removeUser, findUser };
