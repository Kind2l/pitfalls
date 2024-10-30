const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const users = require("../utils/users");

exports.login = (req, res) => {
  const username = req.username;
  const password = req.password;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err)
        return res({
          success: false,
          message: "Erreur avec la base de données",
        });
      if (result.length === 0) {
        return res({
          success: false,
          message: "Email et/ou mot de passe incorrect",
        });
      }

      const userFound = result[0];
      const isMatch = await bcrypt.compare(password, userFound.password);
      if (!isMatch) {
        return res({
          success: false,
          message: "Email et/ou mot de passe incorrect",
        });
      }

      const token = jwt.sign(
        { id: userFound.id, username: username },
        process.env.JWT_SECRET
      );

      db.query(
        "UPDATE users SET token = ? WHERE username = ?",
        [token, username],
        (err) => {
          if (err)
            return res({
              success: false,
              message: "Erreur de mise à jour de l'utilisateur",
            });

          users.addUser({
            socketId: req.socketId,
            username: username,
          });
          return res({
            success: true,
            message: "Connexion réussie",
            data: {
              id: userFound.id,
              username: username,
              token: token,
            },
          });
        }
      );
    }
  );
};

exports.register = (req, callback) => {
  const username = req.username;
  const email = req.email;
  const password = req.password;

  db.query(
    "SELECT email, username FROM users WHERE email = ? OR username = ?",
    [email, username],
    async (err, result) => {
      if (err)
        return callback({
          success: false,
          message: "Problème avec la base de données",
        });

      const existingUser = result.find(
        (user) => user.email === email || user.username === username
      );

      if (existingUser) {
        if (existingUser.email === email) {
          return callback({
            success: false,
            message: "Veuillez utiliser une autre adresse email",
          });
        }
        if (existingUser.username === username) {
          return callback({
            success: false,
            message: "Veuillez choisir un autre pseudo",
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 5);
      const uniqueId = uuidv4();
      const token = jwt.sign(
        { id: uniqueId, username: username },
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
          } else
            callback({
              success: true,
              message: `Enregistrement réussi`,
              data: {
                username: username,
                email: email,
                token: token,
              },
            });
        }
      );
    }
  );
};

exports.validateToken = (req, callback) => {
  const { token } = req;

  if (!token) {
    return callback({
      success: false,
      message: "Token manquant",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return callback({
        success: false,
        message: "Token invalide",
      });
    }

    db.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded.id],
      (err, result) => {
        if (err || result.length === 0) {
          return callback({
            success: false,
            message: "Utilisateur non trouvé",
          });
        }

        const userFound = result[0];
        users.addUser({
          socketId: req.socketId,
          username: userFound.username,
        });
        callback({
          success: true,
          data: {
            id: userFound.id,
            username: userFound.username,
          },
        });
      }
    );
  });
};

exports.disconnect = (data) => {
  users.removeUser(data);
};
