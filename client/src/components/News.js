import "@Styles/components/News.scss";
import React, { useState } from "react";

const News = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className="news">
      <h2
        className="primary-button bg-blue show-news"
        onClick={() => toggleSection("showNews")}
      >
        Journal du développeur
      </h2>

      <div className={`news-paragraph ${expandedSections.showNews && "show"}`}>
        <h3>Nouveautés</h3>
        <ul>
          <li>
            <h4 className="color-green">Mode invité</h4>
            <p>Vous pouvez désormais accéder au jeu sans inscription !</p>
          </li>
          <li>
            <h4 className="color-green">Bouton de partage</h4>
            <p>
              Invitez vos amis depuis la page d'attente avant le début de la
              partie !
            </p>
          </li>
          <li>
            <h4 className="color-green">Musiques & bruitages</h4>
            <p>Des musiques ainsi que des effets sonores ont été ajoutés.</p>
          </li>
        </ul>
        <h3>Prochainement</h3>
        <ul>
          <li>
            <h4 className="color-blue">Robots</h4>
            <p>Possibilité d'ajouter des robots dans la partie.</p>
          </li>
          <li>
            <h4 className="color-blue">Nouveau plateau de jeu</h4>
            <p>Un tout nouveau plateau de jeu en 3D fera son apparition.</p>
          </li>
        </ul>
        <h3>Cette année</h3>
        <ul>
          <li>
            <h4 className="color-orange">Ajout au Play Store</h4>
            <p>Le jeu sera disponible sur Android cette année !</p>
          </li>
          <li>
            <h4 className="color-orange">Statistiques</h4>
            <p>
              Les joueurs ayant créé un compte auront accès à des statistiques
              détaillées sur leurs parties.
            </p>
          </li>
        </ul>
        <i className="color-green">
          Des recommandations ? Contactez-moi à l'adresse contact@kindll.fr
        </i>
      </div>
    </div>
  );
};

export default News;
