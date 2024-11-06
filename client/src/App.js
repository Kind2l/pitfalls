import { SocketProvider } from "@Auth/SocketContext";
import ProtectedRoute from "@Components/ProtectedRoute";
import Connection from "@Pages/Connection";
import CreateServer from "@Pages/CreateServer";
import Error from "@Pages/Error";
import GameBoard from "@Pages/GameBoard";
import Home from "@Pages/Home";
import ServerSelection from "@Pages/ServerSelection";
import "@Styles/App.scss";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create-server",
        element: <CreateServer />,
      },
      {
        path: "/server-list",
        element: <ServerSelection />,
      },
      {
        path: "/game/:serverId",
        element: <GameBoard />,
      },
    ],
    errorElement: <Error />,
  },
  {
    path: "/connection",
    element: <Connection />,
  },
]);

function App() {
  return (
    <SocketProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </SocketProvider>
  );
}

export default App;
