import "@Styles/components/PageLoader.scss";
import React from "react";

const PageLoader = ({ isLoading }) => {
  return isLoading ? (
    <div className="page-loader">
      <div className="tire">
        <div className="rim"></div>
      </div>
      <p>Chargement en cours...</p>
    </div>
  ) : (
    <></>
  );
};

export default PageLoader;
