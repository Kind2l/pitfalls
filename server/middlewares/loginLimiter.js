const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite de 5 requêtes par IP
  message: {
    success: false,
    message: "Trop de tentatives. Réessayez plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
