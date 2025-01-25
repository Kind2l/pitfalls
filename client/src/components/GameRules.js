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
      <h2>Règles du Jeu</h2>

      <h3 onClick={() => toggleSection("objective")}>Objectif du Jeu</h3>

      <p className={`rules-paragraph ${expandedSections.objective && "show"}`}>
        L'objectif est d'être le premier joueur à atteindre la destination en
        surmontant les pièges qui vous feront face et en utilisant des cartes
        spéciales pour avancer ou ralentir vos adversaires.
      </p>

      <h3 onClick={() => toggleSection("cards")}>Cartes du Jeu</h3>
      {expandedSections.cards && (
        <ul className={`rules-paragraph ${expandedSections.cards && "show"}`}>
          <li>
            <h4>Cartes de distance</h4>
            <p>
              Ces cartes vous permettent d'avancer d'un certain nombre de
              kilomètres.
            </p>
          </li>
          <li>
            <h4>Cartes de réparation</h4>
            <p>
              Utilisez ces cartes pour réparer les pannes et continuer votre
              voyage.
            </p>
          </li>
          <li>
            <h4>Cartes de protection</h4>
            <p>Protégez-vous contre les attaques des autres joueurs.</p>
          </li>
          <li>
            <h4>Cartes d'attaque</h4>
            <p>Utilisez ces cartes pour ralentir ou arrêter vos adversaires.</p>
          </li>
          <li>
            <h4>Cartes bonus</h4>
            Elles vous permettent d'être immunisés contres les attaques.
          </li>
        </ul>
      )}

      <h3 onClick={() => toggleSection("gameplay")}>Déroulement du Jeu</h3>
      {expandedSections.gameplay && (
        <ol
          className={`rules-paragraph ${expandedSections.gameplay && "show"}`}
        >
          <p>
            Chaque joueur reçoit un certain nombre de cartes au début du jeu.
            <br /> À chaque tour, les joueurs piochent une carte et jouent une
            carte de leur main. <br />
            Les joueurs peuvent utiliser des cartes pour avancer, réparer, se
            protéger ou attaquer. <br /> Le premier joueur à atteindre la
            destination de vacances gagne la partie.
          </p>
        </ol>
      )}
    </div>
  );
};

export default GameRules;
