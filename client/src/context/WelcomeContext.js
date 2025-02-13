import Welcome from "@Pages/Welcome";
import React, { createContext, useContext, useState } from "react";

const WelcomeContext = createContext();

export const WelcomeProvider = ({ children }) => {
  const [isWatched, setIsWatched] = useState(false);

  const watch = () => {
    setIsWatched(true);
  };

  return (
    <WelcomeContext.Provider value={{ isWatched, watch }}>
      {!isWatched ? <Welcome watch={watch} /> : children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = () => useContext(WelcomeContext);
