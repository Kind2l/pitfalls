import ImageLoader from "@Components/ImageLoader";
import "@Styles/components/PageWelcomer.scss";
import React from "react";

const PageWelcomer = ({ watch }) => {
  return (
    <div className="page-welcomer">
      <div className="welcomer-content">
        <div className="spinner">
          <ImageLoader
            name="img_logoWelcomer"
            alt="Logo du jeu Pitfalls Road"
          />
        </div>
        <button className="primary-button bg-blue" onClick={watch}>
          Démarrer le jeu
        </button>
      </div>
    </div>
  );
};

export default PageWelcomer;
