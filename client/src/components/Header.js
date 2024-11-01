import React from "react";
import logo from "../images/logo.png";

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
