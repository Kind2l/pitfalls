import { useLoader } from "@Context/LoaderContext";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
const socketIo = io(process.env.REACT_APP_API_ADDRESS, {
  transports: ["websocket"],
  reconnection: true,
});

export const SocketProvider = ({ children }) => {
  const socket = socketIo;
  const [user, setUser] = useState({
    id: null,
    username: null,
    token: null,
    isGuest: false,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { hideLoader, showLoader } = useLoader();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      showLoader();
      socket.emit("user:validate-token", { token }, (response) => {
        hideLoader();
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
          hideLoader();
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
      isGuest: false,
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
