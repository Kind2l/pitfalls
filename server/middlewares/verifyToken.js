const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.auth_token; // Récupère le token depuis les cookies
  if (!token) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
