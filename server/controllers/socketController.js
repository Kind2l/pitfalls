const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  addUser,
  updateUser,
  findUserByUsername,
  setUserTimer,
  removeUserByUsername,
  getFilteredServers,
} = require("../utils/data");
const {
  findUserByUsernameInDatabase,
  findUserByEmailInDatabase,
  findUserByIdInDatabase,
  insertUserInDatabase,
  updateUserTokenInDatabase,
} = require("../utils/queries");
const { endGame, removeUserFromServerByUsername } = require("./gameController");
const { servers, findUserBySocketId } = require("../utils/data.js");

// Regex patterns to check for dangerous characters and validate inputs
const dangerousCharsRegex = /[<>{}()[\]"';]/;
const usernameRegex = /^[a-zA-Z0-9_-]{4,13}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validation functions
const validateUsername = (username) => {
  if (username.length < 4) {
    return "Le nom d'utilisateur doit faire au minimum 4 caractères";
  }
  if (username.length > 13) {
    return "Le nom d'utilisateur doit faire 13 caractères maximum";
  }
  if (!usernameRegex.test(username)) {
    return "Le nom d'utilisateur peut contenir les caractères spéciaux: - _";
  }
  if (dangerousCharsRegex.test(username)) {
    return "Caractères interdits";
  }
  return false;
};

const validateEmail = (email) => {
  if (!emailRegex.test(email)) {
    return "Email invalide";
  }
  if (dangerousCharsRegex.test(email)) {
    return "Caractères interdits";
  }
  return false;
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return "Le mot de passe trop court doit faire au minimum 8 caractères";
  }
  if (password.length > 20) {
    return "Le mot de passe trop court doit faire 20 caractères maximum";
  }
  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/\d/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  if (/[^a-zA-Z0-9$/\!?:#+]/.test(password)) {
    return "Le mot de passe peut contenir les caractères spéciaux: $ / ! ? : # +";
  }
  if (dangerousCharsRegex.test(password)) {
    return "Caractères interdits";
  }
  return false;
};

const validateToken = (token) => {
  if (!token || typeof token !== "string") {
    return "Token manquant ou invalide";
  }
  if (dangerousCharsRegex.test(token)) {
    return "Token interdit";
  }
  return false;
};

/**
 * Connecte un utilisateur.
 *
 * @param {Object} req - Objet contenant les informations de la requête.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 *
 * Cette fonction gère les étapes suivantes :
 * - Vérification si l'utilisateur existe en mémoire.
 * - Validation des informations de connexion via la base de données.
 * - Génération d'un token JWT pour l'utilisateur connecté.
 * - Mise à jour des informations de l'utilisateur en mémoire ou ajout si nécessaire.
 *
 * @returns {void} - Utilise la fonction callback pour renvoyer le résultat.
 */
exports.login = async (req, callback) => {
  try {
    console.log("login: Entrée dans la fonction");

    if (!req || typeof req !== "object") {
      return callback({ success: false, message: "Requête invalide" });
    }

    const { username, password } = req;
    if (!username || !password) {
      return callback({
        success: false,
        message: "Nom d'utilisateur et mot de passe requis",
      });
    }

    console.log(
      `login: Données reçues - username: ${username}, password: [masqué]`
    );

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError) {
      return callback({ success: false, message: usernameError });
    }

    if (passwordError) {
      return callback({ success: false, message: passwordError });
    }

    console.log(
      `login: Vérification de l'utilisateur en mémoire - username: ${username}`
    );
    const existingUser = findUserByUsername(username);
    if (existingUser) {
      return callback({
        success: false,
        message: "Connecté sur un autre navigateur.",
      });
    }

    console.log(
      `login: Recherche de l'utilisateur dans la base de données - username: ${username}`
    );
    const userRecords = await findUserByUsernameInDatabase(username);

    if (!Array.isArray(userRecords) || userRecords.length === 0) {
      return callback({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    const userRecord = userRecords[0];
    console.log(
      `login: Utilisateur trouvé - ID: ${userRecord.id}, username: ${userRecord.username}`
    );

    console.log(
      `login: Vérification du mot de passe pour - username: ${username}`
    );
    const isPasswordValid = await bcrypt.compare(password, userRecord.password);

    if (!isPasswordValid) {
      return callback({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    console.log(`login: Génération du token JWT pour - username: ${username}`);
    const token = jwt.sign(
      { id: userRecord.id, username },
      process.env.JWT_SECRET
    );

    console.log(
      `login: Mise à jour du token dans la base de données pour - username: ${username}`
    );
    const tokenUpdated = await updateUserTokenInDatabase(username, token);
    if (!tokenUpdated) {
      return callback({
        success: false,
        message: "Impossible de mettre à jour le token",
      });
    }

    if (!req.socket || !req.socket.id) {
      return callback({
        success: false,
        message: "Erreur avec la connexion Socket.io",
      });
    }

    console.log(
      `login: Ajout ou mise à jour de l'utilisateur en mémoire - username: ${username}`
    );
    addUser({ id: userRecord.id, username, socket_id: req.socket.id });

    console.log(
      `login: Connexion réussie pour l'utilisateur - username: ${username}`
    );
    return callback({
      success: true,
      message: "Connexion réussie",
      data: { id: userRecord.id, username, token },
    });
  } catch (err) {
    console.error("login: Erreur lors de la tentative de connexion :", err);
    return callback({ success: false, message: "Erreur interne du serveur" });
  }
};

/**
 * Inscrit un nouvel utilisateur dans la base de données.
 *
 * @param {Object} req - Les données de la requête contenant username, email, et password.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 */
exports.register = async (req, callback) => {
  console.log("register: Entrée dans la fonction avec les données reçues.");

  try {
    // Vérification de la présence des données
    if (!req || typeof req !== "object") {
      console.log("register: Requête invalide.");
      return callback({ success: false, message: "Requête invalide." });
    }

    const { username, email, password } = req;

    if (!username || !email || !password) {
      console.log("register: Données manquantes.");
      return callback({
        success: false,
        message: "Tous les champs doivent être remplis.",
      });
    }

    // Validation des entrées
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (usernameError) {
      console.log(`register: Erreur validation username: ${usernameError}`);
      return callback({ success: false, message: usernameError });
    }
    if (emailError) {
      console.log(`register: Erreur validation email: ${emailError}`);
      return callback({ success: false, message: emailError });
    }
    if (passwordError) {
      console.log(`register: Erreur validation password: ${passwordError}`);
      return callback({ success: false, message: passwordError });
    }

    console.log("register: Vérification de l'existence du username et email.");

    // Vérifier si l'utilisateur ou l'email existent déjà
    const existingUsername = await findUserByUsernameInDatabase(username);
    if (Array.isArray(existingUsername) && existingUsername.length > 0) {
      console.log(`register: Username déjà pris: ${username}`);
      return callback({
        success: false,
        message: "Nom d'utilisateur déjà utilisé.",
      });
    }

    const existingEmail = await findUserByEmailInDatabase(email);
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      console.log(`register: Email déjà utilisé: ${email}`);
      return callback({
        success: false,
        message: "Email déjà utilisé.",
      });
    }

    console.log("register: Hachage du mot de passe.");
    const hashedPassword = await bcrypt.hash(password, 10); // Augmenter le sel pour plus de sécurité

    console.log(
      "register: Insertion de l'utilisateur dans la base de données."
    );
    const user = await insertUserInDatabase(username, email, hashedPassword);
    if (!user) {
      console.log("register: Échec de l'insertion en base.");
      return callback({
        success: false,
        message: "Échec de l'enregistrement. Veuillez réessayer.",
      });
    }

    console.log(
      "register: Récupération de l'utilisateur nouvellement inscrit."
    );
    const insertedUser = await findUserByEmailInDatabase(email);
    if (!Array.isArray(insertedUser) || insertedUser.length === 0) {
      console.log("register: Utilisateur non trouvé après insertion.");
      return callback({
        success: false,
        message: "Erreur interne. Impossible de récupérer l'utilisateur.",
      });
    }

    console.log("register: Création du token JWT.");
    const userId = insertedUser[0].id;
    const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log(`register: Inscription réussie pour ${username}`);
    return callback({
      success: true,
      message: "Inscription réussie.",
      data: { id: userId, username, email, token },
    });
  } catch (error) {
    console.error("register: Erreur lors de l'inscription:", error);
    return callback({
      success: false,
      message: "Une erreur est survenue lors de l'inscription.",
    });
  }
};

/**
 * Vérifie le token pour connecter directement l'utilisateur.
 *
 * @param {Object} req - Les données de la requête contenant le token.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 */
exports.validateConnectToken = async (req, callback) => {
  console.log("validateConnectToken: Entrée dans la fonction");

  // Vérification de la présence du token
  if (!req || typeof req !== "object" || !req.token) {
    console.log("validateConnectToken: Requête invalide ou token manquant.");
    return callback({ success: false, message: "Requête invalide." });
  }

  const { token } = req;

  // Validation du token
  console.log("validateConnectToken: Validation du token reçu.");
  const tokenError = validateToken(token);
  if (tokenError) {
    console.log("validateConnectToken: Token invalide", tokenError);
    return callback({ success: false, message: tokenError });
  }

  try {
    // Vérification du token JWT
    console.log("validateConnectToken: Vérification du token JWT.");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      console.log("validateConnectToken: Token invalide ou corrompu.");
      return callback({ success: false, message: "Token invalide." });
    }

    console.log("validateConnectToken: Décodage réussi", decoded);

    // Récupération de l'utilisateur depuis la base de données
    const userRecord = await findUserByIdInDatabase(decoded.id);

    if (!userRecord || userRecord.length === 0) {
      console.log("validateConnectToken: Utilisateur introuvable.");
      return callback({ success: false, message: "Utilisateur non trouvé." });
    }

    const user = userRecord[0];
    console.log(`validateConnectToken: Utilisateur trouvé: ${user.username}`);

    // Vérification de l'utilisateur dans le système actif
    const existingUser = await findUserByUsername(user.username);
    console.log(
      "validateConnectToken: Vérification de l'utilisateur existant.",
      existingUser
    );

    let userIsWaiting = false;
    let server_id = null;

    if (existingUser) {
      console.log(
        "validateConnectToken: Utilisateur trouvé dans la session active."
      );
      if (!existingUser.removalTimer) {
        console.log(
          "validateConnectToken: Utilisateur déjà connecté ailleurs."
        );
        return callback({
          success: false,
          message: "Connecté sur un autre navigateur.",
        });
      } else if (existingUser.removalTimer && existingUser.current_server) {
        userIsWaiting = true;
        server_id = existingUser.current_server;
        console.log(
          "validateConnectToken: Utilisateur en attente sur un serveur.",
          server_id
        );
      }
    }

    // Mise à jour ou ajout de l'utilisateur dans la liste des sessions actives
    if (userIsWaiting) {
      console.log(
        "validateConnectToken: Mise à jour de l'utilisateur en attente."
      );
      await updateUser({
        username: user.username,
        update: { socket_id: req.socket.id },
      });
      await setUserTimer({ username: user.username, activate: false });
    } else {
      console.log("validateConnectToken: Ajout de l'utilisateur.");
      await addUser({
        id: Number(user.id),
        socket_id: req.socket.id,
        username: user.username,
      });
    }

    console.log(
      `validateConnectToken: Connexion réussie pour ${user.username}.`
    );

    return callback({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        server_id,
      },
    });
  } catch (error) {
    console.error(
      "validateConnectToken: Erreur lors de la validation du token:",
      error
    );
    return callback({
      success: false,
      message: "Erreur lors de la validation du token.",
    });
  }
};

/**
 * Vérifie le token pour les requêtes des utilisateurs.
 *
 * @param {Object} req - Les données de la requête contenant le token.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 */
exports.validateRequestToken = async (req, callback) => {
  console.log("validateRequestToken: Début de la validation");

  // Vérification de la requête et du token
  if (!req || typeof req !== "object" || !req.token) {
    console.log("validateRequestToken: Requête invalide ou token manquant.");
    return callback({ success: false, message: "Requête invalide." });
  }

  const { token } = req;

  // Validation syntaxique du token
  console.log("validateRequestToken: Vérification du format du token.");
  const tokenError = validateToken(token);
  if (tokenError) {
    console.log("validateRequestToken: Token invalide.", tokenError);
    return callback({ success: false, message: tokenError });
  }

  try {
    // Vérification et décodage du token JWT
    console.log("validateRequestToken: Vérification du token JWT.");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      console.log("validateRequestToken: Token invalide ou corrompu.");
      return callback({
        success: false,
        message: "Token invalide pour la requête.",
      });
    }

    console.log("validateRequestToken: Token JWT décodé avec succès.", decoded);

    // Récupération de l'utilisateur depuis la base de données
    const userRecord = await findUserByIdInDatabase(decoded.id);

    if (!userRecord || userRecord.length === 0) {
      console.log("validateRequestToken: Utilisateur non trouvé.");
      return callback({
        success: false,
        message: "Utilisateur non trouvé pour la requête.",
      });
    }

    const user = userRecord[0];
    console.log(`validateRequestToken: Utilisateur validé - ${user.username}`);

    return callback({
      success: true,
      message: "Token correct, la requête peut poursuivre.",
      data: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(
      "validateRequestToken: Erreur lors de la validation du token:",
      error
    );
    return callback({
      success: false,
      message: "Erreur lors de la validation du token.",
    });
  }
};

/**
 * Déconnecte un utilisateur du système.
 *
 * @param {Object} req - Objet contenant les informations de requête.
 * @param {Object} req.socket - Socket associé à l'utilisateur (facultatif).
 * @param {string} req.username - Nom d'utilisateur (facultatif).
 * @param {Function} callback - Fonction callback pour retourner le résultat.
 *
 * @returns {void} Appelle le callback avec un objet `success` et un `message`.
 *
 */
exports.logout = (req, callback) => {
  console.log("logout: Début de la déconnexion");

  // Vérification de la requête
  if (!req || typeof req !== "object") {
    console.log("logout: Requête invalide.");
    return callback({ success: false, message: "Requête invalide." });
  }

  const { socket, username } = req;

  // Vérification des paramètres nécessaires
  if (!socket && !username) {
    console.log("logout: Aucun identifiant fourni (socket ou username).");
    return callback({
      success: false,
      message:
        "Un identifiant (socket ou username) est requis pour la déconnexion.",
    });
  }

  // Trouver l'utilisateur par username ou socket.id
  let user = username
    ? findUserByUsername(username)
    : findUserBySocketId(socket?.id);

  if (!user) {
    console.log("logout: Utilisateur introuvable.");
    return callback({ success: false, message: "Utilisateur non trouvé." });
  }

  console.log(`logout: Utilisateur identifié - ${user.username}`);

  // Retirer l'utilisateur du serveur s'il en a un
  if (user.current_server) {
    console.log(
      `logout: Retrait de ${user.username} du serveur ${user.current_server}`
    );
    removeUserFromServerByUsername(user.username);
  }

  // Supprimer l'utilisateur de la liste globale des utilisateurs
  const removedFromList = removeUserByUsername(user.username);

  if (!removedFromList) {
    console.log(`logout: Échec de la suppression de ${user.username}.`);
    return callback({
      success: false,
      message: `Impossible de déconnecter ${user.username}.`,
    });
  }

  console.log(`logout: ${user.username} déconnecté avec succès.`);
  return callback({
    success: true,
    message: `Utilisateur ${user.username} déconnecté avec succès.`,
  });
};

/**
 * Déconnecte un utilisateur du système en utilisant uniquement le socket.
 *
 * @param {Object} req - Objet contenant les informations de requête.
 * @param {Object} req.socket - Socket associé à l'utilisateur.
 * @param {Object} req.io - Instance de l'objet io.
 * @param {Function} callback - Fonction callback pour retourner le résultat.
 *
 * @returns {void} Appelle le callback avec un objet `success` et un `message`.
 *
 */

exports.disconnect = (req, callback) => {
  console.log("disconnect: Début de la déconnexion");

  // Vérification de la requête et des paramètres
  if (!req || typeof req !== "object" || !req.socket || !req.io) {
    console.log("disconnect: Requête invalide.");
    return callback({ success: false, message: "Requête invalide." });
  }

  const { socket, io } = req;
  const user = findUserBySocketId(socket.id);
  console.log("disconnect: Utilisateur trouvé ?", user ? user.username : "Non");

  if (!user) {
    console.log("disconnect: Utilisateur introuvable.");
    return callback({ success: false, message: "Utilisateur non trouvé." });
  }

  // Vérification et gestion du serveur
  if (user.current_server) {
    const serverId = user.current_server;
    console.log(
      `disconnect: Utilisateur dans le serveur ${serverId}, suppression en cours.`
    );

    // Retirer l'utilisateur du serveur
    removeUserFromServerByUsername(user.username);

    // Vérifier si le serveur est vide
    if (
      servers[serverId] &&
      Object.keys(servers[serverId].players).length === 0
    ) {
      console.log(`disconnect: Serveur ${serverId} vide, suppression.`);
      delete servers[serverId];
    }
    // Vérifier si un seul joueur reste et que le jeu est en cours
    else if (
      servers[serverId] &&
      Object.keys(servers[serverId].players).length === 1 &&
      servers[serverId].start === true &&
      !servers[serverId].gameOver
    ) {
      console.log(
        `disconnect: Dernier joueur restant dans ${serverId}, fin de partie.`
      );
      endGame(req);
    }

    // Mettre à jour le serveur restant
    if (servers[serverId]) {
      console.log(`disconnect: Mise à jour du serveur ${serverId}.`);
      io.to(serverId).emit("server:update", servers[serverId]);
    }
  }

  // Supprimer l'utilisateur de la liste des utilisateurs
  console.log(
    `disconnect: Suppression de ${user.username} de la liste des utilisateurs.`
  );
  const removedFromListOfUsers = removeUserByUsername(user.username);

  // Mettre à jour la liste des serveurs disponibles
  io.emit("subscription:server-list", { servers: getFilteredServers() });

  if (!removedFromListOfUsers) {
    console.log(`disconnect: Échec de la suppression de ${user.username}.`);
    return callback({
      success: false,
      message: `Impossible de déconnecter ${user.username}.`,
    });
  }

  console.log(
    `disconnect: Utilisateur ${user.username} déconnecté avec succès.`
  );
  return callback({
    success: true,
    message: `Utilisateur ${user.username} déconnecté avec succès.`,
  });
};
