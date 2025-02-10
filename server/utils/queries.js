const { db } = require("./db");

/**
 * Recherche un utilisateur par son nom d'utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur à rechercher.
 * @returns {Promise<object|null>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByUsernameInDatabase = async (username) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans findUserByUsernameInDatabase:", err);
    throw err;
  }
};

/**
 * Recherche un utilisateur par son adresse email dans la base de données.
 * @param {string} email - Adresse à rechercher.
 * @returns {Promise<object|null>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByEmailInDatabase = async (email) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans findUserByEmailInDatabase:", err);
    throw err;
  }
};

/**
 * Insère un nouvel utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} hashedPassword - Hash du mot de passe de l'utilisateur.
 * @returns {Promise<number>} Promesse résolue avec l'ID de l'utilisateur inséré.
 */
const insertUserInDatabase = async (username, hashedPassword) => {
  try {
    const [result] = await db.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    return result.insertId;
  } catch (err) {
    console.error("Erreur dans insertUserInDatabase:", err);
    throw err;
  }
};

/**
 * Met à jour le token d'un utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} token - Nouveau token à attribuer à l'utilisateur.
 * @returns {Promise<boolean>} Indique si la mise à jour a réussi.
 */
const updateUserTokenInDatabase = async (username, token) => {
  try {
    const [result] = await db.execute(
      "UPDATE users SET token = ? WHERE username = ?",
      [token, username]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Erreur dans updateUserTokenInDatabase:", err);
    return false;
  }
};

/**
 * Recherche un utilisateur par son ID dans la base de données.
 * @param {number} userId - ID de l'utilisateur à rechercher.
 * @returns {Promise<object|null>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const findUserByIdInDatabase = async (userId) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans findUserByIdInDatabase:", err);
    throw err;
  }
};

module.exports = {
  findUserByUsernameInDatabase,
  findUserByEmailInDatabase,
  insertUserInDatabase,
  updateUserTokenInDatabase,
  findUserByIdInDatabase,
};
