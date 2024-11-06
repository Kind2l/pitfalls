const {
  login,
  logout,
  register,
  validateToken,
  disconnect,
} = require("@/controllers/socketController");

const {
  createServer,
  joinServer,
  leaveServer,
  addPlayer,
  serverList,
  findServer,
  initServer,
  playerAction,
  removeCard,
} = require("@/controllers/gameController");

module.exports = (io) => (socket) => {
  const handleRequest = (handler) => (req, res) => {
    req.socket = socket;
    req.io = io;
    handler(req, res);
  };

  socket.on("user:login", handleRequest(login));
  socket.on("user:register", handleRequest(register));
  socket.on("user:validate-token", handleRequest(validateToken));
  socket.on("user:logout", handleRequest(logout));

  socket.on("server:create", handleRequest(createServer));
  socket.on("server:add-player", handleRequest(addPlayer));
  socket.on("server:get-list", handleRequest(serverList));
  socket.on("server:join", handleRequest(joinServer));
  socket.on("server:leave-server", handleRequest(leaveServer));
  socket.on("server:find", handleRequest(findServer));
  socket.on("server:initalization", handleRequest(initServer));

  socket.on("game:player-action", handleRequest(playerAction));
  socket.on("game:player-remove-card", handleRequest(removeCard));
  socket.on("disconnect", () => {
    disconnect({ socket_id: socket.id }, (res) => {
      console.log(res);
    });
    console.log(`${socket.id} is disconnected`);
  });
};
