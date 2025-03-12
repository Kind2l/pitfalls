import ProtectedRoute from "@Components/ProtectedRoute";
import { LoaderProvider } from "@Context/LoaderContext";
import { NotificationProvider } from "@Context/NotificationContext";
import { SocketProvider } from "@Context/SocketContext";
import { SoundProvider } from "@Context/SoundContext";
import { WelcomeProvider } from "@Context/WelcomeContext";
import Connection from "@Pages/Connection";
import CreateServer from "@Pages/CreateServer";
import Error from "@Pages/Error";
import GameBoard from "@Pages/GameBoard";
import Home from "@Pages/Home";
import Rules from "@Pages/Rules";
import ServerSelection from "@Pages/ServerSelection";
import Settings from "@Pages/Settings";
import "@Styles/App.scss";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./pages/Profile";

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
        path: "/create-server/:type",
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
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/rules",
        element: <Rules />,
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
    <WelcomeProvider>
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
    </WelcomeProvider>
  );
}

export default App;
