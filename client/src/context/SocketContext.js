import { useLoader } from "@Context/LoaderContext";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState({
    id: null,
    username: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { hideLoader, showLoader } = useLoader();

  useEffect(() => {
    showLoader();
    axios
      .get(process.env.REACT_APP_API_ADDRESS + "/check-auth", {
        withCredentials: true,
      })
      .then((res) => {
        hideLoader();

        const { token, id, username } = res.data;

        if (token) {
          const newSocket = io(process.env.REACT_APP_API_ADDRESS, {
            transports: ["websocket"],
            autoConnect: false,
            query: { token },
          });

          newSocket.connect();
          setSocket(newSocket);
          setIsAuthenticated(true);
          if (id && username) {
            setUser({
              id,
              username,
            });
          }
        }
      })
      .catch((err) => {
        hideLoader();
        console.error("Erreur de récupération du token :", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket?.on("error", (error) => {
      setIsAuthenticated(false);
    });
  }, [socket]);

  const handleLogin = () => {
    axios
      .get(process.env.REACT_APP_LOCAL_ADDRESS + "/check-auth", {
        withCredentials: true,
      })
      .then((res) => {
        hideLoader();

        const { token, id, username } = res.data;

        if (token) {
          const newSocket = io(process.env.REACT_APP_LOCAL_ADDRESS, {
            transports: ["websocket"],
            autoConnect: false,
            query: { token },
          });

          newSocket.connect();
          setSocket(newSocket);
          setIsAuthenticated(true);
          if (id && username) {
            setUser({
              id,
              username,
            });
          }
        }
      })
      .catch((err) => console.error("Erreur de récupération du token :", err));
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        process.env.REACT_APP_LOCAL_ADDRESS + "/logout",
        {},
        { withCredentials: true }
      );
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsAuthenticated(false);
      setUser({
        id: null,
        username: null,
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const handleGuestLogin = async (username) => {
    axios
      .get(process.env.REACT_APP_LOCAL_ADDRESS + "/check-auth", {
        withCredentials: true,
      })
      .then((res) => {
        hideLoader();

        const { token, id, username } = res.data;

        if (token) {
          const newSocket = io(process.env.REACT_APP_LOCAL_ADDRESS, {
            transports: ["websocket"],
            autoConnect: false,
            query: { token },
          });

          newSocket.connect();
          setSocket(newSocket);
          setIsAuthenticated(true);
          if (id && username) {
            setUser({
              id,
              username,
            });
          }
        }
      })
      .catch((err) => console.error("Erreur de récupération du token :", err));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        user,
        isAuthenticated,
        handleLogin,
        handleLogout,
        handleGuestLogin,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte d'authentification
export const useAuth = () => useContext(SocketContext);
