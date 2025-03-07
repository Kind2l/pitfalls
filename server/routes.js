const { disconnect, afk } = require("./controllers/socketController");

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
  message,
} = require("./controllers/gameController");

module.exports = (io) => (socket) => {
  /**
   * Middleware pour injecter `socket` et `io` dans chaque requête,
   * et enregistrer la requête dans la console.
   */
  const handleRequest = (handler, requestName) => async (req, res) => {
    req.socket = socket;
    req.io = io;
    console.log(`Nouvelle requête : ${requestName}`);
    handler(req, res);
  };

  /** ==============================
   *  🔹 Gestion des utilisateurs 🔹
   *  ============================== */

  socket.on("user:afk-player", handleRequest(afk, "server:afk-player"));

  /** ==============================
   *  🔹 Gestion des serveurs 🔹
   *  ============================== */
  socket.on("server:create", handleRequest(createServer, "server:create"));
  socket.on("server:join", handleRequest(joinServer, "server:join"));
  socket.on("server:add-player", handleRequest(addPlayer, "server:add-player"));
  socket.on("server:get-list", handleRequest(serverList, "server:get-list"));
  socket.on("server:leave", handleRequest(leaveServer, "server:leave"));
  socket.on("server:find", handleRequest(findServer, "server:find"));
  socket.on(
    "server:initalization",
    handleRequest(initServer, "server:initalization")
  );

  /** ==============================
   *  🔹 Gestion du jeu 🔹
   *  ============================== */
  socket.on(
    "game:player-action",
    handleRequest(playerAction, "game:player-action")
  );
  socket.on(
    "game:player-remove-card",
    handleRequest(removeCard, "game:player-remove-card")
  );
  socket.on(
    "game:player-message",
    handleRequest(message, "game:player-message")
  );

  /** ==============================
   *  🔹 Déconnexion 🔹
   *  ============================== */
  socket.on("disconnect", () => disconnect({ socket, io }));
};
