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
  console.log(`Nouvelle requête : ${requestName}`);

  // Récupération du token depuis la requête
  const token = req?.user?.token || null;

  // Vérification que le token est fourni
  if (!token) {
    console.error(
      `tokenMiddleware: Aucun token fourni pour la requête ${requestName}.`
    );
    throw {
      success: false,
      message: "Token manquant. L'utilisateur n'est pas authentifié.",
    };
  }

  return new Promise((resolve, reject) => {
    console.log(`tokenMiddleware: Validation du token pour ${requestName}.`);

    validateRequestToken({ token }, (result) => {
      if (!result?.success) {
        // Échec de la validation du token
        console.error(
          `Erreur de validation du token pour la requête ${requestName}:`,
          result
        );
        return reject({
          success: false,
          message:
            result?.message || "Échec de la validation du token. Accès refusé.",
        });
      }

      // Validation réussie
      console.log(`tokenMiddleware: Validation réussie pour ${requestName}.`);
      req.user = result.data; // Met à jour les informations utilisateur
      resolve(true);
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

  socket.on("user:login", handleRequest(login, false, "user:login"));
  socket.on("user:register", handleRequest(register, false, "user:register"));
  socket.on(
    "user:validate-token",
    handleRequest(validateConnectToken, false, "user:validate-token")
  );
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
