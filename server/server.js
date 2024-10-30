require("module-alias/register");

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const routes = require("@/routes");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Routes Socket.io
io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);
  routes(io)(socket);
});

server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
