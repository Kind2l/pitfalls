import ImageLoader from "@Components/ImageLoader";
import "@Styles/components/PageLoader.scss";
import React from "react";

const PageLoader = ({ isLoading }) => {
  return isLoading ? (
    <div className="page-loader">
      <div className="spinner">
        <ImageLoader name="wheel" alt="Roue de chargement" />
      </div>
      <p>Chargement en cours...</p>
    </div>
  ) : (
    <></>
  );
};

export default PageLoader;
