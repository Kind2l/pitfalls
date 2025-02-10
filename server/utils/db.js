const { Pool } = require("pg");
require("dotenv").config();

// Configuration du pool de connexions
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: 5432,
//   max: 10,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

const pool = new Pool({
  connectionString:
    "postgresql://pitfallsdb_user:KqS9TAFnv7wP97e2nb8891Eb3NEUE0tJ@dpg-cugkfmogph6c73a3g3ng-a.frankfurt-postgres.render.com/pitfallsdb",
  ssl: { rejectUnauthorized: false },
});

// Fonction pour créer la table `users` si elle n'existe pas
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      token TEXT
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(query);
    console.log("Table 'users' vérifiée/créée avec succès.");
    client.release();
  } catch (err) {
    console.error("Erreur lors de la création de la table 'users' :", err);
  }
};

// Vérification de la connexion et création de la table
pool
  .connect()
  .then((client) => {
    console.log("Connexion au pool réussie !");
    client.release(); // Libérer immédiatement la connexion
    return createUsersTable(); // Vérifier/créer la table après connexion
  })
  .catch((err) => {
    console.error("Erreur lors de la connexion au pool :", err.message);
  });

// Exportation du pool pour utilisation avec async/await
module.exports = { db: pool };
