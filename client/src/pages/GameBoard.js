import Board from "@Components/Board";
import WaitingRoom from "@Components/WaitingRoom";
import { useNotification } from "@Context/NotificationContext";
import { useAuth } from "@Context/SocketContext";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const GameBoard = () => {
  const { serverId } = useParams();
  const { socket, user } = useAuth();
  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [serverInfos, setServerInfos] = useState(null);
  const { addNotification } = useNotification();

  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("server:find", { user, server_id: serverId }, (response) => {
      if (!response.success) {
        addNotification("Impossible de rejoindre le serveur.");
        navigate("/server-list");
      } else {
        if (response.data.isStarted) {
          navigate("/server-list");
          addNotification("La partie a déjà commencé.");
        }
        setServerInfos(response.data);
        socket.emit(
          "server:join",
          { user, server_id: serverId },
          (response) => {
            if (!response.success) {
              addNotification(response.message);
            } else {
              addNotification("Vous avez rejoint la partie.");
            }
          }
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("server:update", (data) => {
      if (data) {
        data.start && setGameIsStarted(data.start);
      }
    });

    return () => {
      socket.emit("server:leave", { user }, (response) => {
        if (!response.success)
          console.error("Impossible de quitter le serveur");
        if (response.success) console.log("L'utilisateur a quitté le serveur");
      });
    };
  }, [socket]);

  return (
    <div className="gameboard">
      {!gameIsStarted ? (
        <WaitingRoom setGameIsStarted={setGameIsStarted} />
      ) : (
        <Board setGameIsStarted={setGameIsStarted} />
      )}
    </div>
  );
};

export default GameBoard;
