const { db } = require("./db");

/**
 * Recherche un utilisateur par son nom d'utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur à rechercher.
 * @returns {Promise<object[]>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByUsernameInDatabase = (username) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

/**
 * Recherche un utilisateur par son adresse email dans la base de données.
 * @param {string} email - Adresse à rechercher.
 * @returns {Promise<object[]>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByEmailInDatabase = (email) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

/**
 * Insère un nouvel utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} email - Email de l'utilisateur.
 * @param {string} hashedPassword - Hash du mot de passe de l'utilisateur.
 * @returns {Promise<number>} Promesse résolue avec l'ID de l'utilisateur inséré.
 */
const insertUserInDatabase = (username, email, hashedPassword) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results.insertId);
      }
    );
  });
};

/**
 * Met à jour le token d'un utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} token - Nouveau token à attribuer à l'utilisateur.
 * @returns {Promise<void>} Promesse résolue si la mise à jour est réussie.
 */
const updateUserTokenInDatabase = (username, token) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET token = ? WHERE username = ?",
      [token, username],
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

/**
 * Recherche un utilisateur par son ID dans la base de données.
 * @param {number} userId - ID de l'utilisateur à rechercher.
 * @returns {Promise<object[]>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByIdInDatabase = (userId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE id = ?", [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = {
  findUserByUsernameInDatabase,
  findUserByEmailInDatabase,
  insertUserInDatabase,
  updateUserTokenInDatabase,
  findUserByIdInDatabase,
};
