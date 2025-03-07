const {
  findUserServerByUsername,
  getFilteredServers,
  removeUserByUsername,
} = require("../utils/data");

const {
  leaveServer,
  removeUserFromServerByUsername,
  leaveAllServerRooms,
} = require("./gameController.js");
const { servers, findUserBySocketId } = require("../utils/data.js");
const filter = require("leo-profanity");
const frenchBadwordsList = require("french-badwords-list");
filter.clearList();
filter.add(frenchBadwordsList.array);
filter.add([
  "salope",
  "sal0pe",
  "s4lope",
  "salop3",
  "salo.p3",
  "s@lope",
  "s4l0pe",
  "salopee",
  "saloperie",
  "salaupe",
  "salaupeee",
  "chibre",
  "ch1bre",
  "chibree",
  "chib.re",
  "chibr3",
  "ch!bre",
  "chibrou",
  "nazi",
  "naz1",
  "n@zi",
  "n4zi",
  "n@z1",
  "nazie",
  "naz1e",
  "n4zie",
  "n@zie",
  "n4z1e",
  "hitler",
  "h1tler",
  "h!tler",
  "hîtler",
  "hítler",
  "h1tl3r",
  "h!tl3r",
  "h1t1er",
  "h1tlêr",
  "h1t|er",
  "h.tler",
  "h/tler",
  "hît1er",
  "reich",
  "r3ich",
  "rêich",
  "r€ich",
  "r3!ch",
  "r3îch",
  "r3ichh",
  "reych",
  "r-eich",
  "r/ech",
  "thirdreich",
  "3rdreich",
  "fuehrer",
  "fuhrer",
  "fuh_rer",
  "führer",
  "füh_rer",
  "fuhr€r",
  "fuhreeer",
  "fuhr3r",
  "fuh.rer",
  "fu/h_rer",
  "ss",
  "bamboula",
  "bamb0ula",
  "b4mboula",
  "b@mboula",
  "bamb0ul4",
  "bamb0u1a",
  "bamboulah",
  "bamboulaa",
  "bamb.oula",
  "b@mb0ul@",
  "penis",
  "p3nis",
  "pénis",
  "pén1s",
  "pen1s",
  "p3n1s",
  "p3n!s",
  "p.nis",
  "p-nis",
  "p3n1$",
  "peniss",
  "peni$",
  "p3n!$",
  "p3ni5",
  "pd",
  "pds",
  "fdp",
  "fdps",
  "LesNezGros",
  "LesNegros",
  "Lesnegros",
  "negritude",
  "grospenis",
  "gros-penis",
  "trouduc",
  "gr0spenis",
  "gr0s-p3n1s",
  "gr0s-p3n!s",
  "gr0sp3n1s",
  "gr0spenis",
  "gro$pen1s",
  "gros_penis",
  "gr0$pen!s",
  "gr0s_p3n1s",
  "gr0s_penis",
  "gr0spenis$",
]);

/**
 * Gère la déconnexion d'un utilisateur.
 *
 * @param {object} socket - L'instance du socket de l'utilisateur déconnecté.
 * @param {object} io - L'instance de Socket.io pour la communication en temps réel.
 */
exports.disconnect = (req) => {
  console.log("🔌 disconnect: Un utilisateur s'est déconnecté");

  const { io, socket } = req;

  try {
    if (!socket?.id) {
      console.warn("⚠️ disconnect: Aucun socket ID fourni.");
      return;
    }

    // Trouver l'utilisateur via son socket ID
    const user = findUserBySocketId(socket.id);
    if (!user) {
      console.warn(
        `⚠️ disconnect: Aucun utilisateur trouvé pour le socket ${socket.id}.`
      );
      return;
    }

    const { username } = user;
    console.log(`👤 disconnect: Tentative de retrait de ${username}`);

    // Vérifier si l'utilisateur est dans un serveur
    const serverId = findUserServerByUsername(username);
    if (serverId) {
      const isRemoved = removeUserFromServerByUsername(username);
      if (!isRemoved) {
        console.error(
          `❌ disconnect: Échec de la suppression de ${username} du serveur ${serverId}.`
        );
        return;
      }
    }

    const isRemovedFromUsers = removeUserByUsername(username);
    if (!isRemovedFromUsers) {
      console.error(
        `❌ disconnect: Échec de la suppression de ${username} de la liste des utilisateurs.`
      );
      return;
    }

    // Vérifier s'il reste des joueurs dans le serveur
    const server = servers[serverId];

    if (server) {
      const totalPlayers = Object.keys(server.players).length;

      if (totalPlayers === 0) {
        console.log(
          `🗑️ disconnect: Suppression du serveur ${serverId}, plus de joueurs.`
        );
        delete servers[serverId];
      } else if (totalPlayers === 1 && server.start && !server.gameOver) {
        console.log(
          `🏁 disconnect: Fin de partie forcée sur ${serverId}, un seul joueur restant.`
        );
        this.endGame({ socket, io, user });
      } else {
        console.log(
          `📡 disconnect: Mise à jour du serveur ${serverId} après déconnexion.`
        );
        socket.to("server_" + serverId).emit("server:update", server);
        leaveAllServerRooms(socket);
      }
    }

    // Mettre à jour la liste des serveurs pour tous les clients
    io.emit("subscription:server-list", { servers: getFilteredServers() });

    console.log(`✅ disconnect: ${username} déconnecté avec succès.`);
  } catch (error) {
    console.error(
      "❌ disconnect: Erreur lors du traitement de la déconnexion",
      error
    );
  }
};

exports.afk = (req, callback) => {
  console.log("afk: Entrée dans la fonction");
  const { socket, io } = req;
  let user = findUserBySocketId(socket.id);
  console.log("afk: Est-ce-que l'utilisateur existe ?", user);

  // Si l'utilisateur n'existe pas, renvoie une erreur
  if (!user) {
    console.log(`afk: L'utilisateur n'éxiste pas`);
    return callback({ success: false, message: "Utilisateur non trouvé" });
  }

  // Vérifie si l'utilisateur est sur un serveur
  console.log(
    `afk: L'utilisateur ${
      user.current_server ? "est dans un serveur" : "n'est pas dans un serveur"
    }`
  );
  if (user.current_server) {
    let serverId = user.current_server;
    if (servers[serverId]) {
      io.to(serverId).emit("server:afk-player", user.username);
      this.disconnect(req, callback);
      return callback({ success: true, message: "Utilisateur afk deconnecté" });
    }
  }
  return callback({
    success: false,
    message: "Serveur du joueur afk non trouvé",
  });
};
