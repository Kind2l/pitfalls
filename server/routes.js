const {
  login,
  register,
  validateToken,
  disconnect,
} = require("@/controllers/socketController");

const {
  createServer,
  joinServer,
  addPlayer,
  serverList,
  findServer,
  initServer,
  playerAction,
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

  socket.on("server:create", handleRequest(createServer));
  socket.on("server:add-player", handleRequest(addPlayer));
  socket.on("server:get-list", handleRequest(serverList));
  socket.on("server:join", handleRequest(joinServer));
  socket.on("server:find", handleRequest(findServer));
  socket.on("server:initalization", handleRequest(initServer));

  socket.on("game:player-action", handleRequest(playerAction));

  // socket.on("leave room", (roomName) => {
  //   socket.leave(roomName);
  // });

  // Disconnect event
  socket.on("disconnect", () => {
    disconnect(socket.id);
    console.log(`${socket.id} is disconnected`);
  });
};
