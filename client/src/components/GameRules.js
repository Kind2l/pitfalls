import "@Styles/components/GameRules.scss";
import React, { useState } from "react";
const GameRules = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className="game-rules">
      <h2
        className="primary-button bg-orange show-rules"
        onClick={() => toggleSection("showRules")}
      >
        Règles du Jeu
      </h2>

      <div
        className={`rules-paragraph ${expandedSections.showRules && "show"}`}
      >
        <h3>Objectif</h3>
        <p>
          L'objectif est d'atteindre la destination de vacances. Mais attention,
          tous le monde convoite la meilleure chambre avec balcon et vue sur la
          mer ! <br />
          Vous devez donc être rapide et stratégique afin de surmonter les
          pièges qui vous feront face et ralentissant vos adversaires.
        </p>

        <h3>Déroulement du Jeu</h3>

        <p>
          Chaque joueur reçoit un certain nombre de cartes au début du jeu.
          <br /> À chaque tour, les joueurs jouent une carte de leur main, puis
          piochent une nouvelle carte. <br />
          Les joueurs peuvent utiliser des cartes pour avancer, se protéger,
          s'immuniser ou attaquer. <br />
          Le premier joueur à atteindre ladestination de vacances gagne la
          partie.
        </p>

        <h3>Cartes du Jeu</h3>
        <ul>
          <li>
            <h4 className="color-sky">Cartes de Kilomètres</h4>
            <p>
              Ces cartes vous permettent d'avancer d'un certain nombre de
              kilomètres.
            </p>
          </li>
          <li>
            <h4 className="color-green">Cartes de protection</h4>
            <p>Protégez-vous contre les attaques des autres joueurs.</p>
          </li>
          <li>
            <h4 className="color-red">Cartes d'attaque</h4>
            <p>Utilisez ces cartes pour ralentir ou arrêter vos adversaires.</p>
          </li>
          <li>
            <h4 className="color-orange">Cartes bonus</h4>
            <p>
              Elles vous permettent d'être immunisé contre certaines attaques.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GameRules;
