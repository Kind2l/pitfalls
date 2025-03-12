const { db } = require("./db");

/**
 * Recherche un utilisateur par son nom d'utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur à rechercher.
 * @returns {Promise<object|null>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const databaseFindUserByUsername = async (username) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans databaseFindUserByUsername:", err);
    throw err;
  }
};
/**
 * Supprime un utilisateur par son nom d'utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur à supprimer.
 * @returns {Promise<boolean>} Indique si la suppression a réussi.
 */
const databaseDeleteUserByUsername = async (username) => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM users WHERE username = $1",
      [username]
    );
    return rowCount > 0;
  } catch (err) {
    console.error("Erreur dans databaseDeleteUserByUsername:", err);
    throw err;
  }
};
/**
 * Recherche un utilisateur par son adresse email dans la base de données.
 * @param {string} email - Adresse à rechercher.
 * @returns {Promise<object|null>} Résultat de la requête contenant l'utilisateur correspondant.
 */
const databaseFindUserByEmail = async (email) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(rows);

    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans databaseFindUserByEmail:", err);
    throw err;
  }
};

/**
 * Insère un nouvel utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} hashedPassword - Hash du mot de passe de l'utilisateur.
 * @returns {Promise<number>} Promesse résolue avec l'ID de l'utilisateur inséré.
 */
const databaseInsertUser = async (username, hashedPassword, email) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, email]
    );
    return rows[0].id;
  } catch (err) {
    console.error("Erreur dans databaseInsertUser:", err);
    throw err;
  }
};
/**
 * Met à jour le mot de passe d'un utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} hashedPassword - Nouveau mot de passe hashé.
 * @returns {Promise<boolean>} Indique si la mise à jour a réussi.
 */
const databaseUpdateUserPassword = async (username, hashedPassword) => {
  try {
    const { rowCount } = await db.query(
      "UPDATE users SET password = $1 WHERE username = $2",
      [hashedPassword, username]
    );
    return rowCount > 0;
  } catch (err) {
    console.error("Erreur dans databaseUpdateUserPassword:", err);
    throw err;
  }
};
/**
 * Met à jour le token d'un utilisateur dans la base de données.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} token - Nouveau token à attribuer à l'utilisateur.
 * @returns {Promise<boolean>} Indique si la mise à jour a réussi.
 */
const databaseUpdateUserToken = async (username, token) => {
  try {
    const { rowCount } = await db.query(
      "UPDATE users SET token = $1 WHERE username = $2",
      [token, username]
    );
    return rowCount > 0;
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
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    return rows.length ? rows[0] : null;
  } catch (err) {
    console.error("Erreur dans findUserByIdInDatabase:", err);
    throw err;
  }
};

module.exports = {
  databaseFindUserByUsername,
  databaseDeleteUserByUsername,
  databaseFindUserByEmail,
  databaseInsertUser,
  databaseUpdateUserPassword,
  databaseUpdateUserToken,
  findUserByIdInDatabase,
};
