require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const http = require("http");
const socketIo = require("socket.io");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3000;
const {
  register,
  login,
  loginAsGuest,
} = require("./controllers/userController.js");
const loginLimiter = require("./middlewares/loginLimiter.js");
const { addUser, findUserByUsername } = require("./utils/data.js");
const allowedOrigins = process.env.ORIGINS.split(",");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Configure Express to trust proxies
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    next();
  });
});
app.get("/ping", (req, res) => {
  console.log("Ping reçu");
  res.send("pong");
});
app.post("/register", register);
app.post("/login", loginLimiter, login);
app.post("/guest-login", loginAsGuest);
app.get("/check-auth", (req, res) => {
  try {
    let token = req.cookies.auth_token;
    console.log("Token reçu :", token);

    if (!token) {
      return res.status(400).json({ message: "Aucun token." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.clearCookie("auth_token", {
          httpOnly: true,
          secure: process.env.SECURE, // Mettre `true` en production (HTTPS obligatoire)
          sameSite: "None",
          path: "/",
        });
        return res.status(400).json({ message: "Erreur d'authentification." });
      }

      return res
        .status(200)
        .json({ token, id: decoded.id, username: decoded.username });
    });
  } catch (error) {
    console.error(error);
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.SECURE, // Mettre `true` en production (HTTPS obligatoire)
      sameSite: "None",
      path: "/",
    });
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.SECURE, // Mettre `true` en production (HTTPS obligatoire)
    sameSite: "None",
    path: "/",
  });

  return res.json({ success: true, message: "Déconnexion réussie." });
});

io.on("connection", (socket) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) {
      console.error("Aucun token pour la connexion");
      socket.emit("error", { message: "Aucun token pour la connexion" });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Impossible de décoder le token");
        socket.emit("error", { message: "Impossible de décoder le token" });
        return;
      }
      const { id, username, isGuest } = decoded;
      const userisLogged = findUserByUsername(username);

      if (userisLogged) {
        console.error("Déjà connecté");
        socket.emit("error", { message: "Déjà connecté" });
        return;
      }
      addUser({
        id,
        username,
        socket_id: socket.id,
        isGuest,
      });

      console.log(`${socket.id} is connected`);
      routes(io)(socket);
    });
  } catch (error) {
    console.error("Erreur lors de la connexion", error);
    socket.emit("error", { message: "Erreur lors de la connexion" });
  }
});

server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
