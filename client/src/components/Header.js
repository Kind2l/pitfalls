import "@Styles/Header.scss";
import React from "react";
import ImageLoader from "./ImageLoader";

function Header() {
  return (
    <header>
      <div className="logo">
        <ImageLoader name="img_logo" alt="logo de pitfalls" />
      </div>
    </header>
  );
}

export default Header;
