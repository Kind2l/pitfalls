const {
  login,
  logout,
  disconnect,
  register,
  validateConnectToken,
  validateRequestToken,
} = require("./controllers/socketController");

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
} = require("./controllers/gameController");

const tokenMiddleware = async (req, requestName) => {
  const token = req.user ? req.user.token : null;
  console.log(`Nouvelle requête : ${requestName}`);

  return new Promise((resolve, reject) => {
    validateRequestToken({ token }, (result) => {
      if (!result.success) {
        console.log(
          `Erreur de validation de token pour la requête ${requestName}`,
          result
        );
        reject(result);
      } else {
        console.log(`La requête ${requestName} peut poursuivre`);
        req.user = result.data;
        resolve(true);
      }
    });
  });
};

module.exports = (io) => (socket) => {
  const handleRequest =
    (handler, useTokenMiddleware = false, requestName) =>
    async (req, res) => {
      req.socket = socket;
      req.io = io;
      console.log(`Nouvelle requete ${requestName}`);
      if (useTokenMiddleware) {
        try {
          await tokenMiddleware(req, requestName);
          handler(req, res);
        } catch (error) {
          console.log(
            `Problème avec le middleware pour la requête ${requestName}`
          );
          console.log(error);
        }
      } else {
        handler(req, res);
      }
    };

  socket.on("user:login", handleRequest(login));
  socket.on("user:register", handleRequest(register));
  socket.on("user:validate-token", handleRequest(validateConnectToken));
  socket.on("user:logout", handleRequest(logout, true, "user:logout"));

  socket.on(
    "server:create",
    handleRequest(createServer, true, "server:create")
  );
  socket.on(
    "server:add-player",
    handleRequest(addPlayer, true, "server:add-player")
  );
  socket.on(
    "server:get-list",
    handleRequest(serverList, true, "server:get-list")
  );
  socket.on("server:join", handleRequest(joinServer, true, "server:join"));
  socket.on("server:leave", handleRequest(leaveServer, true, "server:leave"));
  socket.on("server:find", handleRequest(findServer, true, "server:find"));
  socket.on(
    "server:initalization",
    handleRequest(initServer, true, "server:initalization")
  );

  socket.on(
    "game:player-action",
    handleRequest(playerAction, true, "game:player-action")
  );
  socket.on(
    "game:player-remove-card",
    handleRequest(removeCard, true, "game:player-remove-card")
  );

  socket.on("disconnect", () => {
    disconnect({ socket, io }, (res) => {});
    console.log(`${socket.id} is disconnected`);
  });
};
