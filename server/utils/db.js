const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuration de la connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fonction pour créer la table `users` si elle n'existe pas
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      token TEXT
    );
  `;

  try {
    const connection = await pool.getConnection();
    await connection.query(query);
    console.log("Table 'users' vérifiée/créée avec succès.");
    connection.release();
  } catch (err) {
    console.error("Erreur lors de la création de la table 'users' :", err);
  }
};

// Vérification de la connexion et création de la table
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connexion au pool MySQL réussie !");
    connection.release();
    await createUsersTable(); // Vérifier/créer la table après connexion
  } catch (err) {
    console.error("Erreur lors de la connexion au pool MySQL :", err.message);
  }
})();

// Exportation du pool pour utilisation avec async/await
module.exports = { db: pool };
