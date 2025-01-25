const mysql = require("mysql2");
require("dotenv").config();

// Configuration du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Attendre les connexions disponibles
  connectionLimit: 10, // Nombre maximum de connexions simultanées
  queueLimit: 0, // Aucune limite pour la file d'attente
});

// Exportation du pool avec des promesses pour une utilisation facile avec async/await
const db = pool.promise();

module.exports = { db };
