const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const {
  addUser,
  findUserByUsername,
  removeUserByUsername,
} = require("../utils/data.js");
const {
  databaseFindUserByUsername,
  databaseInsertUser,
  databaseFindUserByEmail,
  databaseUpdateUserToken,
} = require("../utils/queries.js");
const {
  removeUserFromServerByUsername,
  leaveServer,
} = require("./gameController.js");
const { findUserBySocketId } = require("../utils/data.js");

const registerSchema = Joi.object({
  username: Joi.string()
    .min(4)
    .max(20)
    .pattern(
      new RegExp(
        "^(?=.{4,20}$)(?![_.-])(?!.*[_.-]{2})(?!guest_)(?!Guest_)[a-zA-Z0-9_-]+([^._-])$"
      )
    )
    .required(),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(
      new RegExp("^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,16}$")
    )
    .required(),
  email: Joi.string()
    .max(9)
    .max(40)
    .pattern(
      new RegExp(
        "^(?!.*[.]{2})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      )
    )

    .required(),
});

const loginSchema = Joi.object({
  username: Joi.string()
    .min(4)
    .max(20)
    .pattern(
      new RegExp(
        "^(?=.{4,20}$)(?![_.-])(?!.*[_.-]{2})(?!guest_)(?!Guest_)[a-zA-Z0-9_-]+([^._-])$"
      )
    )
    .required(),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(
      new RegExp("^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,16}$")
    )
    .required(),
});

const guestSchema = Joi.object({
  username: Joi.string()
    .min(2)
    .max(14)
    .pattern(
      new RegExp("^(?=.{2,14}$)(?![_.-])(?!.*[_.-]{2})[a-zA-Z0-9_-]+([^._-])$")
    )
    .required(),
});

/**
 * Inscrit un nouvel utilisateur dans la base de données.
 *
 * @param {Object} req - Les données de la requête contenant username et password.
 * @param {Function} res - Fonction de rappel pour retourner le résultat.
 */
exports.register = async (req, res) => {
  console.log("register: Entrée dans la fonction");

  try {
    const { username, email, password } = req?.body;
    const validate = await registerSchema.validateAsync({
      username,
      email,
      password,
    });

    if (!validate) {
      console.log("validate", validate);
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    let emailToLowerCase = email.toLowerCase();

    const existingUsername = await databaseFindUserByUsername(username);
    const existingEmail = await databaseFindUserByEmail(emailToLowerCase);

    if (existingUsername) {
      return res
        .status(401)
        .json({ message: "Choisissez un autre nom d'utilisateur." });
    }
    if (existingEmail) {
      return res
        .status(401)
        .json({ message: "Choisissez une autre adresse email." });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const isInserted = await databaseInsertUser(
      username,
      hashedPassword,
      emailToLowerCase
    );
    if (!isInserted) {
      return res
        .status(401)
        .json({ message: "Erreur lors de l'enregistrement." });
    }

    const insertedUser = await databaseFindUserByUsername(username);

    if (!insertedUser || insertedUser.length === 0) {
      return res.status(401).json({ message: "Utilisateur non enregistré." });
    }

    return res.status(200).json({
      success: true,
      message: `Enregistrement réussi.`,
    });
  } catch (error) {
    console.error(`register: Erreur`, error);
    return res.status(400).json({ message: "Enregistrement échoué." });
  }
};

/**
 * Connecte un utilisateur.
 *
 * @param {Object} req - Objet contenant les informations de la requête.
 * @param {Function} res - Fonction de rappel pour retourner le résultat.
 *
 * Cette fonction gère les étapes suivantes :
 * - Vérification si l'utilisateur existe en mémoire.
 * - Validation des informations de connexion via la base de données.
 * - Génération d'un token JWT pour l'utilisateur connecté.
 * - Mise à jour des informations de l'utilisateur en mémoire ou ajout si nécessaire.
 *
 * @returns {void} - Utilise la fonction res pour renvoyer le résultat.
 */
exports.login = async (req, res) => {
  console.log("login: Entrée dans la fonction");

  try {
    const { username, password } = req?.body;
    const isGuest = false;
    const validate = await loginSchema.validateAsync({
      username,
      password,
    });

    if (!validate) {
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    const user = await databaseFindUserByUsername(username);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Nom d'utilisateur/Mot de passe incorrect." });
    }
    const userisLogged = findUserByUsername(username);
    console.log("ISLOGGED", userisLogged);
    if (userisLogged) {
      return res.status(401).json({ message: "Vous êtes déjà connecté." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Nom d'utilisateur/Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user.id, username, isGuest: false },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    let isUserUpdated = await databaseUpdateUserToken(username, token);
    if (!isUserUpdated) {
      return res
        .status(401)
        .json({ message: "Mise à jour du token impossible." });
    }

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // Mettre `true` en production (HTTPS obligatoire)
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 an en millisecondes
    });

    res.status(200).json({
      success: true,
      message: "Vous êtes connecté.",
      body: {
        id: user.id,
        username,
        isGuest,
      },
    });
  } catch (error) {
    console.error(`login: Erreur`, error);
    return res.status(400).json({ message: "Connexion échouée." });
  }
};

/**
 * Connecte un utilisateur en mode invité.
 *
 * @param {Object} req - Objet contenant les informations de la requête.
 * @param {Function} res - Fonction de rappel pour retourner le résultat.
 *
 * Cette fonction gère les étapes suivantes :
 * - Vérification si l'utilisateur existe en mémoire.
 * - Validation des informations de connexion via la base de données.
 * - Génération d'un token JWT pour l'utilisateur connecté.
 * - Ajout de l'utilisateur.
 *
 * @returns {void} - Utilise la fonction res pour renvoyer le résultat.
 */

exports.loginAsGuest = async (req, res) => {
  console.log("loginAsGuest: Entrée dans la fonction");

  try {
    let { username } = req?.body;
    if (!username)
      return res.status(401).json({ message: "Insérez un nom d'utilisateur." });

    const guestId = `guest_${Date.now()}`;

    const validate = await guestSchema.validateAsync({
      username,
    });

    console.log("validate", validate);

    if (!validate) {
      return res.status(401).json({ message: "Nom d'utilisateur incorrect." });
    }

    username = "guest_" + username;

    const user = findUserByUsername(username);

    if (user) {
      return res
        .status(401)
        .json({ message: "Choisissez un autre nom d'utilisateur." });
    }

    const token = jwt.sign(
      { id: guestId, username, isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // Mettre `true` en production (HTTPS obligatoire)
      sameSite: "Lax",
      maxAge: 86400000, // 1h
    });

    res.status(200).json({
      success: true,
      message: "Vous êtes connecté.",
      body: {
        id: guestId,
        username,
        isGuest: true,
      },
    });
  } catch (error) {
    console.error(`login: Erreur`, error);
    return res.status(400).json({ message: "Connexion échouée." });
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

  if (!user)
    return callback({ success: false, message: "Utilisateur non trouvé" });

  removeUserByUsername(user.username);

  if (user.current_server) {
    leaveServer(req, callback);
  }

  return callback({
    success: true,
    message: `Utilisateur ${user.username} déconnecté avec succès.`,
  });
};
