import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/SocketContext";
import Board from "../components/Board";
import WaitingRoom from "../components/WaitingRoom";

const GameBoard = () => {
  const { serverId } = useParams();
  const { socket } = useAuth();
  const [gameIsStarted, setGameIsStarted] = useState(false);

  useEffect(() => {
    socket.emit("server:find", { serverId: serverId }, (response) => {
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
      setGameIsStarted(data.start);
    });
  }, [socket]);

  return (
    <main className="gameboard">
      {!gameIsStarted ? (
        <WaitingRoom setGameIsStarted={setGameIsStarted} />
      ) : (
        <Board setGameIsStarted={setGameIsStarted} />
      )}
    </main>
  );
};

export default GameBoard;
