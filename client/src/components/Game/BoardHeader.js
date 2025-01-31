import ShortMenu from "@Components/Game/ShortMenu";
import "@Styles/Board/BoardHeader.scss";
import React, { useState } from "react";
import ImageLoader from "../ImageLoader";

const BoardHeader = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleOpen = () => {
    setMenuIsOpen(!menuIsOpen);
  };
  return (
    <div className="board-header">
      <button className="message">
        <ImageLoader name="img_message" alt="Message" />
      </button>
      <div className="logo">
        <ImageLoader name="img_logoMin" alt="Musique" />
      </div>
      <button className="menu" onClick={() => handleOpen()}>
        <ImageLoader name="img_menu" alt="Menu" />
      </button>
      <ShortMenu isOpen={menuIsOpen} />
    </div>
  );
};

export default BoardHeader;
