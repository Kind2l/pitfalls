import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Création d'un contexte pour la gestion de la connexion via Socket.io
const SocketContext = createContext();
// https://pitfalls.onrender.com
const socketIo = io("http://localhost:3001", {
  reconnection: false,
});

export const SocketProvider = ({ children }) => {
  // Initialisation de la socket et des états d'utilisateur et d'authentification
  const socket = socketIo;
  const [user, setUser] = useState({
    id: null,
    username: null,
    token: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifie la présence d'un token pour réauthentifier l'utilisateur au chargement
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Émet un événement pour valider le jeton auprès du serveur
      socket.emit("user:validate-token", { token }, (response) => {
        if (response?.success) {
          let id = response.data.id;
          let username = response.data.username;
          // Met à jour les informations de l'utilisateur si le jeton est valide
          setUser({
            id,
            username,
            token,
          });
          setIsAuthenticated(true);
        } else {
          // Supprime le jeton en cas d'échec et affiche un message d'erreur
          localStorage.removeItem("token");
          console.info(response?.message || "Token manquant.");
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // Fonction pour connecter un utilisateur et stocker son jeton
  const login = (data) => {
    if (!data || !data.token || typeof data.token !== "string") {
      console.error("Données de connexion manquantes."); // Vérifie si les données sont présentes
      return;
    }
    // Stocke le jeton et met à jour l'état utilisateur
    localStorage.setItem("token", data.token);
    setUser(data);
    setIsAuthenticated(true);
  };

  // Fonction pour déconnecter un utilisateur et réinitialiser l'état
  const logout = () => {
    const username = user.username; // Récupère le nom d'utilisateur actuel
    if (!username) {
      console.error("Aucun utilisateur à déconnecter."); // Vérifie si un utilisateur est connecté
      return;
    }

    // Supprime le jeton stocké dans le navigateur
    localStorage.removeItem("token");

    // Informe le serveur de la déconnexion
    socket.emit("user:logout", { user }, (response) => {
      if (!response.success) {
        console.error(response.message || "Erreur lors de la déconnexion.");
      }
    });

    // Réinitialise l'état utilisateur et l'authentification
    setUser({
      id: null,
      username: null,
      token: null,
    });
    setIsAuthenticated(false);
  };

  // Fournit le contexte aux composants enfants
  return (
    <SocketContext.Provider
      value={{ socket, user, isAuthenticated, login, logout }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => useContext(SocketContext);
