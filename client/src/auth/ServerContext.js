import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./SocketContext"; // Assure-toi que le chemin est correct

const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const { socket } = useAuth();
  const [servers, setServers] = useState([]);

  useEffect(() => {
    socket.on("serverList", (serverList) => {
      setServers(serverList);
    });
    return () => {
      socket.off("serverList");
    };
  }, [socket]);

  const createServer = (name) => {
    socket.emit("createServer", { name }, (response) => {
      if (response.success) {
        console.log("Serveur créé avec succès:", response.serverId);
      } else {
        console.error(response.message);
      }
    });
  };

  const joinServer = (serverId) => {
    socket.emit("joinServer", { serverId });
  };

  const leaveServer = (serverId) => {
    socket.emit("leaveServer", { serverId });
  };

  return (
    <ServerContext.Provider
      value={{ servers, createServer, joinServer, leaveServer }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServers = () => useContext(ServerContext);
