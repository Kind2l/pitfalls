// LoaderContext.js
import PageLoader from "@Components/PageLoader";
import React, { createContext, useContext, useState } from "react";
// Création du contexte
const LoaderContext = createContext();

// Provider pour le LoaderContext
export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Affiche le loader
  const showLoader = () => {
    setIsLoading(true);
  };

  // Cache le loader
  const hideLoader = () => {
    setIsLoading(false);
  };

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      <PageLoader isLoading={isLoading} />
      {children}
    </LoaderContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useLoader = () => useContext(LoaderContext);
