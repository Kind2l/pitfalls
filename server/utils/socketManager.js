let io = null;

/**
 * Initialise Socket.IO avec l'instance du serveur.
 * @param {object} socketIO - Instance de Socket.IO.
 */
const initSocketManager = (socketIO) => {
  io = socketIO;
};

/**
 * Émet un événement global à tous les clients.
 * @param {string} event - Nom de l'événement.
 * @param {object} data - Données à transmettre.
 */
const emitToAll = (event, data) => {
  if (!io) {
    console.log("Socket.IO n'a pas été initialisé.");
    return;
  }
  io.emit(event, data);
};

/**
 * Émet un événement à une salle spécifique.
 * @param {string} room - Identifiant de la salle.
 * @param {string} event - Nom de l'événement.
 * @param {object} data - Données à transmettre.
 */
const emitToRoom = (room, event, data) => {
  if (!io) {
    console.log("Socket.IO n'a pas été initialisé.");
    return;
  }
  io.to(room).emit(event, data);
};

/**
 * Émet un événement à un client spécifique.
 * @param {string} socketId - Identifiant du socket client.
 * @param {string} event - Nom de l'événement.
 * @param {object} data - Données à transmettre.
 */
const emitToClient = (socketId, event, data) => {
  if (!io) {
    console.log("Socket.IO n'a pas été initialisé.");
    return;
  }
  io.to(socketId).emit(event, data);
};

module.exports = {
  initSocketManager,
  emitToAll,
  emitToRoom,
  emitToClient,
};
