import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();
const socketIo = io("http://localhost:4000");

export const SocketProvider = ({ children }) => {
  const socket = socketIo;
  const [user, setUser] = useState({
    id: null,
    username: null,
    token: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      socket.emit("user:validate-token", { token }, (response) => {
        if (response.success) {
          setUser({
            id: response.data.id,
            username: response.data.username,
            token: token,
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      });
    }
  }, [socket]);

  useEffect(() => {}, [isAuthenticated, user]);

  const login = (data) => {
    if (!data) {
      return;
    }
    localStorage.setItem("token", data.token);
    setUser(data);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser({
      id: null,
      username: null,
      token: null,
    });
    setIsAuthenticated(false);
  };

  return (
    <SocketContext.Provider
      value={{ socket, user, isAuthenticated, login, logout }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useAuth = () => useContext(SocketContext);
