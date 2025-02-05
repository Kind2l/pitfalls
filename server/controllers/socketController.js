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
  findUserByIdInDatabase,
  insertUserInDatabase,
  updateUserTokenInDatabase,
} = require("../utils/queries");
const { endGame, removeUserFromServerByUsername } = require("./gameController");
const { servers, findUserBySocketId } = require("../utils/data.js");

// Regex patterns to check for dangerous characters and validate inputs

// Validation des entrées utilisateur
const validateUsername = (username) => {
  if (!username) {
    return "Aucun nom d'utilisateur fourni.";
  }

  if (username.length < 4) {
    return "Le nom d'utilisateur doit contenir 4 caractères minimum.";
  }

  if (username.length > 20) {
    return "Le nom d'utilisateur doit contenir 20 caractères maximum.";
  }

  // Regex autorisant lettres, chiffres, accents et caractères spéciaux définis
  const usernameRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ!@#$%^&*\-_=+?]+$/;

  if (!usernameRegex.test(username)) {
    return "Le nom d'utilisateur contient des caractères non autorisés.";
  }

  return false;
};

const validatePassword = (password) => {
  if (!password) {
    return "Aucun mot de passe fourni.";
  }

  if (password.length < 4) {
    return "Le mot de passe doit contenir 4 caractères minimum.";
  }

  if (password.length > 20) {
    return "Le mot de passe doit contenir 20 caractères maximum.";
  }

  // Regex autorisant lettres, chiffres, accents et caractères spéciaux définis
  const passwordRegex = /^[a-zA-Z0-9À-ÖØ-öø-ÿ!@#$%^&*\-_=+?]+$/;

  if (!passwordRegex.test(password)) {
    return "Le mot de passe contient des caractères non autorisés.";
  }

  return false;
};

const validateToken = (token) => {
  if (!token || typeof token !== "string") {
    return "Token manquant ou invalide";
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
  console.log("login: Entrée dans la fonction");

  const { username, password } = req;

  console.log(
    `login: Données reçues - username: ${username}, password: [masqué]`
  );

  // Validation des entrées
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (usernameError) {
    console.log(
      `login: Erreur de validation - usernameError: ${usernameError}`
    );
    return callback({
      success: false,
      message: usernameError,
    });
  }

  if (passwordError) {
    console.log(
      `login: Erreur de validation - passwordError: ${passwordError}`
    );
    return callback({
      success: false,
      message: passwordError,
    });
  }

  username.trim();
  password.trim();

  try {
    // Vérifie si l'utilisateur est déjà connecté
    console.log(
      `login: Vérification de l'utilisateur en mémoire - username: ${username}`
    );
    const existingUser = findUserByUsername(username);

    if (existingUser) {
      console.log(
        `login: Utilisateur déjà connecté sur un autre navigateur - username: ${username}`
      );
      return callback({
        success: false,
        message: "Connecté sur un autre navigateur.",
      });
    }

    // Recherche de l'utilisateur dans la base de données
    console.log(
      `login: Recherche de l'utilisateur dans la base de données - username: ${username}`
    );
    const userRecords = await findUserByUsernameInDatabase(username);

    if (userRecords?.length === 0) {
      console.log(
        `login: Aucun utilisateur trouvé pour - username: ${username}`
      );
      return callback({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    const userRecord = userRecords[0];
    console.log(
      `login: Utilisateur trouvé - ID: ${userRecord.id}, username: ${userRecord.username}`
    );

    // Vérification du mot de passe
    console.log(
      `login: Vérification du mot de passe pour - username: ${username}`
    );
    const isPasswordValid = await bcrypt.compare(password, userRecord.password);

    if (!isPasswordValid) {
      console.log(`login: Mot de passe incorrect pour - username: ${username}`);
      return callback({
        success: false,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }

    // Génération d'un token JWT
    console.log(`login: Génération du token JWT pour - username: ${username}`);
    const token = jwt.sign(
      { id: userRecord.id, username, isGuest: false },
      process.env.JWT_SECRET
    );

    // Mise à jour du token dans la base de données
    console.log(
      `login: Mise à jour du token dans la base de données pour - username: ${username}`
    );
    await updateUserTokenInDatabase(username, token);

    // Mise à jour ou ajout de l'utilisateur en mémoire
    console.log(
      `login: Ajout ou mise à jour de l'utilisateur en mémoire - username: ${username}`
    );
    addUser({
      id: userRecord.id,
      username,
      socket_id: req.socket.id,
      isGuest: false,
    });

    console.log(
      `login: Connexion réussie pour l'utilisateur - username: ${username}`
    );

    // Succès de la connexion
    return callback({
      success: true,
      message: "Connexion réussie",
      data: {
        id: userRecord.id,
        username,
        token,
        isGuest: false,
      },
    });
  } catch (err) {
    // Gestion des erreurs
    console.error("login: Erreur lors de la tentative de connexion :", err);
    return callback({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Connecte un utilisateur en mode invité.
 *
 * @param {Object} req - Objet contenant les informations de la requête.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 *
 * Cette fonction gère les étapes suivantes :
 * - Vérification si l'utilisateur existe en mémoire.
 * - Validation des informations de connexion via la base de données.
 * - Génération d'un token JWT pour l'utilisateur connecté.
 * - Ajout de l'utilisateur.
 *
 * @returns {void} - Utilise la fonction callback pour renvoyer le résultat.
 */
exports.loginAsGuest = async (req, callback) => {
  console.log("loginAsGuest: Entrée dans la fonction");

  // Génération d'un pseudo aléatoire
  const currentDate = Date.now();
  const gestNumber = currentDate.toString().slice(-5);
  const id = currentDate.toString().slice(-6);
  const guestUsername = `Guest_${gestNumber}`;

  const token = jwt.sign(
    { id: id, username: guestUsername, isGuest: true },
    process.env.JWT_SECRET,
    {
      expiresIn: "12h",
    }
  );

  try {
    // Ajout de l'utilisateur invité en mémoire
    console.log(
      `loginAsGuest: Ajout de l'utilisateur invité en mémoire - username: ${guestUsername}`
    );
    addUser({
      id: id,
      username: guestUsername,
      socket_id: req.socket.id,
      isGuest: true,
    });

    console.log(
      `loginAsGuest: Ajout de l'utilisateur pour l'utilisateur invité - username: ${guestUsername}`
    );

    // Succès de la connexion
    return callback({
      success: true,
      message: "Connexion en tant qu'invité réussie",
      data: {
        id: id,
        username: guestUsername,
        token: token,
        isGuest: true,
      },
    });
  } catch (err) {
    // Gestion des erreurs
    console.error(
      "loginAsGuest: Erreur lors de la tentative de connexion :",
      err
    );
    return callback({
      success: false,
      message: "Erreur interne du serveur",
    });
  }
};

/**
 * Inscrit un nouvel utilisateur dans la base de données.
 *
 * @param {Object} req - Les données de la requête contenant username et password.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 */
exports.register = async (req, callback) => {
  console.log("register: Entrée dans la fonction");
  const { username, password } = req;

  // Vérification des données reçues
  if (!username || !password) {
    console.log("register: Données manquantes -", { username, password });
    return callback({
      success: false,
      message: "Données non complétées",
    });
  }

  // Validation des données
  const usernameError = validateUsername(username);
  const passwordError = validatePassword(password);
  console.log(username);

  if (usernameError) {
    console.log("register: Erreur de validation du username :", usernameError);
    return callback({
      success: false,
      message: usernameError,
    });
  }

  if (passwordError) {
    console.log(
      "register: Erreur de validation du mot de passe :",
      passwordError
    );
    return callback({
      success: false,
      message: passwordError,
    });
  }

  username.trim();
  password.trim();

  try {
    console.log("register: Vérification des utilisateurs existants");

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await findUserByUsernameInDatabase(username);
    if (existingUsername?.length > 0) {
      console.log(`register: Nom d'utilisateur déjà pris - ${username}`);
      return callback({
        success: false,
        message: "Nom d'utilisateur non valide",
      });
    }

    console.log("register: Hachage du mot de passe");
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 5);

    console.log("register: Insertion de l'utilisateur dans la base de données");
    // Insérer l'utilisateur dans la base de données
    const user = await insertUserInDatabase(username, hashedPassword);
    if (!user) {
      console.log(`register: Erreur lors de l'insertion en base (${username})`);
      return callback({
        success: false,
        message: "Erreur lors de l'enregistrement",
      });
    }

    console.log("register: Récupération de l'utilisateur inséré");
    // Trouver l'utilisateur
    const insertedUser = await findUserByUsernameInDatabase(username);
    if (!insertedUser || insertedUser.length === 0) {
      console.log(
        `register: Utilisateur non trouvé après insertion (${username})`
      );
      return callback({
        success: false,
        message: "Utilisateur non trouvé après l'enregistrement",
      });
    }

    console.log("register: Création du token JWT");
    // Créer un token JWT
    const userId = insertedUser[0].id;
    const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log(`register: Enregistrement réussi pour ${username}`);
    // Retourner les données utilisateur et le token
    return callback({
      success: true,
      message: `Enregistrement réussi pour ${username}`,
      data: { id: userId, username, token },
    });
  } catch (error) {
    console.error(
      `register: Erreur lors de l'enregistrement pour ${username}`,
      error
    );
    return callback({
      success: false,
      message: "Erreur lors de l'enregistrement",
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
  const { token } = req;

  // Validation du token
  console.log("validateConnectToken: Validation du token", token);
  const tokenError = validateToken(token);
  if (tokenError) {
    console.log(
      "validateConnectToken: Erreur de validation du token",
      tokenError
    );
    return callback({
      success: false,
      message: tokenError,
    });
  }

  // Vérification du JWT
  console.log("validateConnectToken: Vérification du token avec jwt");
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("validateConnectToken: Erreur de vérification JWT :", err);
      return callback({ success: false, message: "Token invalide" });
    }

    // Récupération de l'utilisateur depuis la base de données
    console.log("validateConnectToken: Décodage du token réussi", decoded);
    try {
      if (decoded?.isGuest === false) {
        console.log("validateConnectToken: L'utilisateur n'est pas un invité");

        const userRecord = await findUserByIdInDatabase(decoded.id);
        console.log(
          "validateConnectToken: Recherche du joueur dans la base de données",
          userRecord
        );

        if (userRecord.length === 0) {
          console.log("validateConnectToken: Utilisateur non trouvé");
          return callback({
            success: false,
            message: "Utilisateur non trouvé",
          });
        }
      }

      // Vérification de l'existence de l'utilisateur
      const existingUser = findUserByUsername(decoded.username);

      console.log(
        "validateConnectToken: Vérification de l'utilisateur existant",
        existingUser
      );

      let userIsWaiting = false;
      let server_id = null;

      // Si l'utilisateur est déjà connecté
      if (existingUser) {
        console.log(
          "validateConnectToken: Utilisateur existant trouvé",
          existingUser
        );
        if (existingUser.removalTimer === false) {
          console.log(
            "validateConnectToken: Utilisateur connecté sur un autre navigateur"
          );
          return callback({
            success: false,
            message: "Connecté sur un autre navigateur.",
          });
        } else if (existingUser.removalTimer && existingUser.current_server) {
          userIsWaiting = true;
          server_id = existingUser.current_server;
          console.log(
            "validateConnectToken: Utilisateur en attente sur un serveur",
            server_id
          );
        }
      }

      // Mise à jour ou ajout de l'utilisateur
      if (userIsWaiting) {
        console.log(
          "validateConnectToken: Mise à jour de l'utilisateur en attente"
        );
        updateUser({
          username: decoded.username,
          update: { socket_id: req.socket.id },
        });
        setUserTimer({
          username: decoded.username,
          activate: false,
        });
      } else {
        console.log("validateConnectToken: Ajout de l'utilisateur");
        addUser({
          id: Number(decoded.id),
          socket_id: req.socket.id,
          username: decoded.username,
        });
      }

      // Réponse avec les données utilisateur
      console.log(
        `validateConnectToken: Connexion du joueur ${decoded.username} - ${req.socket.id}`
      );
      callback({
        success: true,
        data: {
          id: decoded.id,
          username: decoded.username,
          server_id,
          isGuest: decoded.isGuest,
        },
      });
    } catch (error) {
      console.log(
        "validateConnectToken: Erreur lors de la validation du token :",
        error
      );
      return callback({
        success: false,
        message: "Erreur lors de validation du token",
      });
    }
  });
};

/**
 * Vérifie le token pour les requêtes des utilisateurs.
 *
 * @param {Object} req - Les données de la requête contenant le token.
 * @param {Function} callback - Fonction de rappel pour retourner le résultat.
 */
exports.validateRequestToken = async (req, callback) => {
  console.log("validateRequestToken: Entrée dans la fonction");
  const { token } = req;
  let existingUser = false;

  // Validation du token
  console.log("validateRequestToken: Validation du token", token);
  const tokenError = validateToken(token);
  if (tokenError) {
    console.log(
      "validateRequestToken: Erreur de validation du token",
      tokenError
    );
    return callback({
      success: false,
      message: tokenError,
    });
  }

  // Vérification du JWT
  console.log("validateRequestToken: Vérification du token avec jwt");
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("validateRequestToken: Erreur de vérification JWT :", err);
      return callback({
        success: false,
        message: "Token invalide pour la requête",
      });
    }

    // Décodage réussi, on récupère l'utilisateur
    console.log("validateRequestToken: Décodage du token réussi", decoded);

    try {
      if (decoded?.isGuest === false) {
        console.log("validateRequestToken: L'utilisateur n'est pas un invité");
        const userRecord = await findUserByIdInDatabase(decoded.id);
        console.log(
          "validateRequestToken: Résultat de findUserByIdInDatabase",
          userRecord
        );

        if (userRecord.length === 0) {
          console.log("validateRequestToken: Utilisateur non trouvé");
          return callback({
            success: false,
            message: "Utilisateur non trouvé",
          });
        }
      }

      existingUser = findUserByUsername(decoded.username);

      // Réponse de succès avec les données de l'utilisateur
      console.log(
        "validateRequestToken: Validation réussie, utilisateur trouvé",
        decoded.username
      );
      return callback({
        success: true,
        message: "Token correct, la requête peut poursuivre",
        data: {
          id: decoded.id,
          username: decoded.username,
        },
      });
    } catch (error) {
      console.log(
        "validateRequestToken: Erreur lors de la validation du token pour la requête :",
        error
      );
      return callback({
        success: false,
        message: "Erreur lors de la validation du token pour la requête",
      });
    }
  });
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
 * Exemple d'utilisation :
 * logout({ username: "Player123" }, (response) => console.log(response));
 */
exports.logout = (req, callback) => {
  console.log("logout: Entrée dans la fonction");

  const { socket, username } = req;
  let user;

  // Trouve l'utilisateur par username ou socket.id
  if (username) {
    console.log(
      `logout: Recherche de l'utilisateur par username - ${username}`
    );
    user = findUserByUsername(username);
  } else if (socket) {
    console.log(
      `logout: Recherche de l'utilisateur par socket.id - ${socket.id}`
    );
    user = findUserBySocketId(socket.id);
  }

  // Si l'utilisateur n'existe pas, renvoie une erreur
  if (!user) {
    console.log("logout: Utilisateur non trouvé");
    return callback({ success: false, message: "Utilisateur non trouvé" });
  }

  console.log(`logout: Utilisateur trouvé - ${user.username}`);

  // Retire l'utilisateur du serveur
  console.log(`logout: Retrait de l'utilisateur du serveur - ${user.username}`);
  removeUserFromServerByUsername(user.username);

  // Supprime l'utilisateur de la liste des utilisateurs
  console.log(
    `logout: Suppression de l'utilisateur de la liste des utilisateurs - ${user.username}`
  );
  const removedFromListOfUsers = removeUserByUsername(user.username);

  // Vérifie si la suppression a échoué
  if (!removedFromListOfUsers) {
    console.log(
      `logout: Échec de la suppression complète pour ${user.username}`
    );
    return callback({
      success: false,
      message: `L'utilisateur ${user.username} n'a pas pu être entièrement déconnecté.`,
    });
  }

  // Retourne un succès si tout s'est bien passé
  console.log(`logout: Utilisateur ${user.username} déconnecté avec succès`);
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
 * Exemple d'utilisation :
 * disconnect({ socket: socketInstance, io: ioInstance }, (response) => console.log(response));
 */
exports.disconnect = (req, callback) => {
  console.log("disconnect: Entrée dans la fonction");
  const { socket, io } = req;
  let user = findUserBySocketId(socket.id);
  console.log("disconnect: Est-ce-que l'utilisateur existe ?", user);

  // Si l'utilisateur n'existe pas, renvoie une erreur
  if (!user) {
    console.log(`disconnect: L'utilisateur n'éxiste pas`);
    return callback({ success: false, message: "Utilisateur non trouvé" });
  }

  // Vérifie si l'utilisateur est sur un serveur
  console.log(
    `disconnect: L'utilisateur ${
      user.current_server ? "est dans un serveur" : "n'est pas dans un serveur"
    }`
  );
  if (user.current_server) {
    let serverId = user.current_server;
    req.server_id = serverId;
    // Retire l'utilisateur du serveur
    console.log(
      "disconnect: Tentative de suppression via removeUserFromServerByUsername"
    );
    removeUserFromServerByUsername(user.username);
    console.log(
      "disconnect: Utilisateur supprimé via removeUserFromServerByUsername"
    );

    console.log("disconnect: Vérification que le serveur est vide");
    if (servers[serverId]) {
      if (servers[serverId].players) {
        if (Object.keys(servers[serverId].players).length === 0) {
          let filteredServers = getFilteredServers();
          io.emit("subscription:server-list", { servers: filteredServers });
          delete servers[serverId];
        } else if (
          Object.keys(servers[serverId]?.players).length === 1 &&
          servers[serverId].start === true &&
          servers[serverId].gameOver === false
        ) {
          endGame(req);
        }
      }
      io.to(serverId).emit("server:update", servers[serverId]);
    }
  }

  // Supprime l'utilisateur de la liste des utilisateurs
  console.log("disconnect: Tentative de suppression via removeUserByUsername");
  const removedFromListOfUsers = removeUserByUsername(user.username);
  console.log("disconnect: Utilisateur supprimé via removeUserByUsername");

  // Met à jour la liste des serveurs filtrés
  let filteredServers = getFilteredServers();
  console.log(
    "disconnect: Envoie des informations via emit subscription:server-list "
  );
  io.emit("subscription:server-list", { servers: filteredServers });

  // Vérifie si la suppression a échoué
  if (!removedFromListOfUsers) {
    console.log("disconnect: L'utilisateur n'a pas pu être retiré de users ");
    return callback({
      success: false,
      message: `L'utilisateur ${user.username} n'a pas pu être entièrement déconnecté.`,
    });
  }

  // Retourne un succès si tout s'est bien passé
  console.log(
    `disconnect: Utilisateur ${user.username} déconnecté avec succès`
  );
  return callback({
    success: true,
    message: `Utilisateur ${user.username} déconnecté avec succès.`,
  });
};
