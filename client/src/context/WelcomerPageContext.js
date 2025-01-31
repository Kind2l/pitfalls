import PageWelcomer from "@Components/PageWelcomer";
import React, { createContext, useContext, useState } from "react";

const WelcomerPageContext = createContext();

export const WelcomerPageProvider = ({ children }) => {
  const [isWatched, setIsWatched] = useState(false);

  // Fonction pour fermer l'écran de bienvenue et jouer la musique
  const watch = () => {
    setIsWatched(true);
  };

  return (
    <WelcomerPageContext.Provider value={{ isWatched, watch }}>
      {!isWatched ? <PageWelcomer watch={watch} /> : children}
    </WelcomerPageContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useWelcomer = () => useContext(WelcomerPageContext);
