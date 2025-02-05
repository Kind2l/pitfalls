import PageWelcomer from "@Components/PageWelcomer";
import React, { createContext, useContext, useEffect, useState } from "react";

const WelcomerPageContext = createContext();

export const WelcomerPageProvider = ({ children }) => {
  const [isWatched, setIsWatched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(
        window.matchMedia("(max-width: 500px) and (max-height: 1000px)").matches
      );
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const watch = () => {
    setIsWatched(true);
  };

  // if (!isMobile) {
  //   return (
  //     <div className="desktop-message">
  //       <h2>Pitfalls est accessible uniquement sur mobile !</h2>
  //       <p>Pour jouer au jeu, accédez au jeu via votre smartphone !</p>
  //     </div>
  //   );
  // }

  return (
    <WelcomerPageContext.Provider value={{ isWatched, watch }}>
      {!isWatched ? <PageWelcomer watch={watch} /> : children}
    </WelcomerPageContext.Provider>
  );
};

export const useWelcomer = () => useContext(WelcomerPageContext);
