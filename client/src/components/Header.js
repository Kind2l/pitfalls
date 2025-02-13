import "@Styles/Header.scss";
import React from "react";
import ImageLoader from "./ImageLoader";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <ImageLoader name="logo" alt="logo de pitfalls" />
      </div>
    </header>
  );
}

export default Header;
