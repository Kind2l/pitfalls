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

        <div className="welcomer-annunce">Appuyez pour démarrer</div>
      </div>
      <div></div>
    </div>
  );
};

export default Welcome;
