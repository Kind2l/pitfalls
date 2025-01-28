import "@Styles/components/PageLoader.scss";
import React from "react";

const PageLoader = ({ isLoading }) => {
  return isLoading ? (
    <div className="page-loader">
      <div className="spinner">
        <img src="./images/icons/loading-wheel.svg" alt="Image de chargement" />
      </div>
      <p>Chargement en cours...</p>
    </div>
  ) : (
    <></>
  );
};

export default PageLoader;
