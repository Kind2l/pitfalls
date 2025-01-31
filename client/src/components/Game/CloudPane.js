import "@Styles/Board/CloudPane.scss";
import React from "react";

const CloudPane = () => {
  const clouds = Array.from({ length: 7 }, (_, index) => (
    <div className="bigCloud" key={`cloud-${index}`} id={`cloud${index + 1}`}>
      <div className="largeCircle" id="circ1">
        <div className="largeCircle shadow" id="circ1shadow"></div>
      </div>
      <div className="middleCircle" id="circ2">
        <div className="middleCircle shadow" id="circ2shadow"></div>
      </div>
      <div className="middleCircle" id="circ3">
        <div className="middleCircle shadow" id="circ3shadow"></div>
      </div>
      <div className="smallCircle" id="circ4"></div>
      <div className="smallCircle" id="circ5">
        <div className="smallCircle shadow" id="circ5shadow"></div>
      </div>
      <div className="smallCircle" id="circ6">
        <div className="smallCircle shadow" id="circ6shadow"></div>
      </div>
    </div>
  ));

  return <div className="cloudPane">{clouds}</div>;
};

export default CloudPane;
