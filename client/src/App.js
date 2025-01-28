import { LoaderProvider } from "@Auth/LoaderContext";
import { NotificationProvider } from "@Auth/NotificationContext";
import { SocketProvider } from "@Auth/SocketContext";
import { SoundProvider } from "@Auth/SoundContext";
import ProtectedRoute from "@Components/ProtectedRoute";
import Connection from "@Pages/Connection";
import CreateServer from "@Pages/CreateServer";
import Error from "@Pages/Error";
import GameBoard from "@Pages/GameBoard";
import Home from "@Pages/Home";
import ServerSelection from "@Pages/ServerSelection";
import Settings from "@Pages/Settings";
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
      {
        path: "/settings",
        element: <Settings />,
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
    <LoaderProvider>
      <SocketProvider>
        <NotificationProvider>
          <SoundProvider>
            <div className="App">
              <RouterProvider router={router} />
            </div>
          </SoundProvider>
        </NotificationProvider>
      </SocketProvider>
    </LoaderProvider>
  );
}

export default App;
