import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.scss";
import { SocketProvider } from "./auth/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Connection from "./pages/Connection";
import CreateServer from "./pages/CreateServer";
import Error from "./pages/Error";
import GameBoard from "./pages/GameBoard";
import Home from "./pages/Home";
import Join from "./pages/Join";

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
        element: <Join />,
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
