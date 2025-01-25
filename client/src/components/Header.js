import logo from "@Images/logo.svg";
import "@Styles/Header.scss";
import React from "react";

function Header() {
  return (
    <header>
      <div className="logo">
        <img src={logo} alt="logo de pitfalls"></img>
      </div>
    </header>
  );
}

export default Header;
