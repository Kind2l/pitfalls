const mysql = require("mysql2");
require("dotenv").config();

// Configuration du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Vérification de la connexion
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Erreur lors de la connexion au pool :", err.message);
  } else {
    console.log("Connexion au pool réussie !");
    connection.release(); // Libérer la connexion après vérification
  }
});

// Exportation du pool avec des promesses pour une utilisation facile avec async/await
const db = pool.promise();

module.exports = { db };
