import { useAuth } from "@Auth/SocketContext";
import Board from "@Components/Board";
import WaitingRoom from "@Components/WaitingRoom";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const GameBoard = () => {
  const { serverId } = useParams();
  const { socket, user } = useAuth();
  const [gameIsStarted, setGameIsStarted] = useState(false);

  useEffect(() => {
    socket.emit("server:find", { user, server_id: serverId }, (response) => {
      if (!response.success) {
        console.error(response);
      } else {
        setGameIsStarted(response.start);
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
