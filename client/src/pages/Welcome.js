import ImageLoader from "@Components/ImageLoader";
import "@Styles/components/PageWelcomer.scss";
import React from "react";

const Welcome = ({ watch }) => {
  return (
    <div className="page-welcomer" onClick={watch}>
      <div className="welcomer-content">
        <ImageLoader
          className="welcomer-logo"
          name="logo"
          alt="logo de pitfalls"
        />
        {/* <ImageLoader
          className="welcomer-image"
          name="img_imageWelcomer"
          alt="Logo du jeu Pitfalls Road"
        /> */}

        <div className="welcomer-annunce">Appuyez pour démarrer</div>
      </div>
    </div>
  );
};

export default Welcome;
