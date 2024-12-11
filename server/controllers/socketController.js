const db = require("@/utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  users,
  addUser,
  updateUser,
  findUser,
  setUserTimer,
  removeUser,
} = require("@/utils/data");

// Fonction de connexion
exports.login = (req, res) => {
  const { username, password } = req;

  let user = findUser({ username });
  let userIsWaiting = false;
  let server_id = null;

  if (user) {
    if (user.removalTimer === false) {
      return res({
        success: false,
        message: "Connecté sur un autre navigateur.",
      });
    } else {
      userIsWaiting = true;
      server_id = user.current_server;
    }
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) {
        console.error(
          "Erreur avec la base de données lors de la connexion :",
          err
        );
        return res({
          success: false,
          message: "Erreur avec la base de données",
        });
      }
      if (result.length === 0) {
        console.warn(
          "Tentative de connexion avec un nom d'utilisateur non trouvé :",
          username
        );
        return res({
          success: false,
          message: "Email et/ou mot de passe incorrect",
        });
      }

      let userRecord = result[0];
      let isPasswordMatch = await bcrypt.compare(password, userRecord.password);

      if (!isPasswordMatch) {
        console.warn("Mot de passe incorrect pour l'utilisateur :", username);
        return res({
          success: false,
          message: "Email et/ou mot de passe incorrect",
        });
      }

      const token = jwt.sign(
        { id: userRecord.id, username },
        process.env.JWT_SECRET
      );

      db.query(
        "UPDATE users SET token = ? WHERE username = ?",
        [token, username],
        (err) => {
          if (err) {
            console.error(
              "Erreur de mise à jour de l'utilisateur avec le token :",
              err
            );
            return res({
              success: false,
              message: "Erreur de mise à jour de l'utilisateur",
            });
          }

          if (userIsWaiting) {
            updateUser({
              username,
              update: {
                socket_id: req.socket.id,
              },
            });
            setUserTimer({ username, activate: false });
          } else {
            addUser({
              id: userRecord.id,
              username: username,
              socket_id: req.socket.id,
            });
          }

          console.log(`Connexion du joueur ${username}`);

          return res({
            success: true,
            message: "Connexion réussie",
            data: {
              id: userRecord.id,
              username,
              token,
              server_id,
            },
          });
        }
      );
    }
  );
};

exports.register = (req, callback) => {
  const { username, email, password } = req;

  db.query(
    "SELECT email, username FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, result) => {
      if (err) {
        return callback({
          success: false,
          message: "Problème avec la base de données",
        });
      }

      const existingUser = result.find(
        (user) => user.email === email || user.username === username
      );

      if (existingUser) {
        return callback({
          success: false,
          message:
            existingUser.email === email
              ? "Veuillez utiliser une autre adresse email"
              : "Veuillez choisir un autre pseudo",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 5);
      const uniqueId = uuidv4();
      const token = jwt.sign(
        { id: uniqueId, username },
        process.env.JWT_SECRET
      );

      db.query(
        "INSERT INTO users (id, username, email, password, token) VALUES (?, ?, ?, ?, ?)",
        [uniqueId, username, email, hashedPassword, token],
        (err) => {
          if (err) {
            return callback({
              success: false,
              message: "Erreur d'enregistrement",
            });
          }
          callback({
            success: true,
            message: "Enregistrement réussi",
            data: { username, email, token },
          });
        }
      );
    }
  );
};

// Fonction de validation du token
exports.validateToken = (req, res) => {
  const { token } = req;

  if (!token) {
    return res({ success: false, message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res({ success: false, message: "Token invalide" });
    }

    db.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded.id],
      (err, result) => {
        if (err || result.length === 0) {
          return res({ success: false, message: "Utilisateur non trouvé" });
        }

        const userRecord = result[0];
        let existingUser = findUser({ username: userRecord.username });
        let userIsWaiting = false;
        let server_id = null;

        if (existingUser) {
          if (existingUser.removalTimer === false) {
            return res({
              success: false,
              message: "Connecté sur un autre navigateur.",
            });
          } else if (existingUser.removalTimer && existingUser.current_server) {
            userIsWaiting = true;
            server_id = existingUser.current_server;
          }
        }

        if (userIsWaiting) {
          updateUser({
            username: userRecord.username,
            update: { socket_id: req.socket.id },
          });
          setUserTimer({
            username: userRecord.username,
            activate: false,
          });
        } else {
          addUser({
            id: Number(userRecord.id),
            socket_id: req.socket.id,
            username: userRecord.username,
          });
        }

        console.log(
          `Connexion du joueur ${userRecord.username} - ${req.socket.id}`
        );

        res({
          success: true,
          data: {
            id: userRecord.id,
            username: userRecord.username,
            server_id,
          },
        });
      }
    );
  });
};

exports.logout = (req, res) => {
  const { socket, username } = req;
  let user;
  if (username) {
    user = findUser({ username: username });
  } else if (socket) {
    user = findUser({ socket_id: socket.id });
  }

  if (!user) {
    return res({ success: false, message: "Utilisateur non trouvé" });
  }

  let isRemoved = removeUser({ username: user.username });

  if (!isRemoved) {
    return res({
      success: true,
      message: `L'Utilisateur ${user.username} déconnecté avec succès`,
    });
  }

  return res({
    success: true,
    message: `Utilisateur ${user.username} déconnecté avec succès`,
  });
};

// Fonction de déconnexion avec temporisation
exports.disconnect = (req, res) => {
  const { socket_id, username } = req;

  const userKey = socket_id
    ? Object.keys(users).find((key) => users[key].socket_id === socket_id)
    : username;

  const user = findUser({ username: userKey });

  if (!userKey || !user) {
    return res({ success: false, message: "Utilisateur non trouvé" });
  }

  if (user.current_server) {
    setUserTimer({ username: userKey, activate: true });
    return res({
      success: true,
      message: `Compte à rebours de déconnexion démarré pour ${userKey}`,
    });
  } else {
    removeUser({ username: userKey });
    return res({
      success: true,
      message: `Utilisateur ${userKey} déconnecté immédiatement`,
    });
  }
};
