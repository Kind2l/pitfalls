import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import ImageLoader from "@Components/ImageLoader";
import "@Styles/Rules.scss";
import React from "react";

const Rules = () => {
  return (
    <>
      <Header />
      <div className="rules">
        <div className="rules-content">
          <h2>Règles du Jeu</h2>

          <h3>Objectif</h3>
          <p>
            L'objectif est d'atteindre la destination de vacances. Mais
            attention, tous le monde convoite la meilleure chambre avec balcon
            et vue sur la mer ! <br />
            Vous devez donc être rapide et stratégique afin de surmonter les
            pièges qui vous feront face et ralentir vos adversaires.
          </p>

          <h3>Déroulement du Jeu</h3>
          <p>
            Chaque joueur reçoit le même nombre de cartes (entre 3 et 6 selon le
            type de partie).
            <br /> À chaque tour, les joueurs jouent une carte de leur main,
            puis piochent une nouvelle carte. <br />
            Les joueurs peuvent utiliser des cartes pour avancer, se protéger,
            s'immuniser ou attaquer. <br />
            Le premier joueur à atteindre la destination de vacances gagne la
            partie.
          </p>

          <h3>Tableau des cartes</h3>
          <div className="cards">
            <div className="card">
              <div className="card-attaque color-red">Cartes d'attaque</div>
              <div className="card-parade color-green">Cartes de défense</div>
              <div className="card-bonus color-orange">Cartes bonus</div>
            </div>
            <div className="card">
              <div className="card-attaque">
                <ImageLoader name="cards/feurouge" />
              </div>
              <div className="card-parade">
                <ImageLoader name="cards/feuvert" />
              </div>
              <div className="card-bonus">
                <ImageLoader name="cards/cartedepolice" />
              </div>
            </div>
            <div className="card">
              <div className="card-attaque">
                <ImageLoader name="cards/zonedecontrole" />
              </div>
              <div className="card-parade">
                <ImageLoader name="cards/findezonedecontrole" />
              </div>
              <div className="card-bonus">
                <ImageLoader name="cards/cartedepolice" />
              </div>
            </div>
            <div className="card">
              <div className="card-attaque">
                <ImageLoader name="cards/fatigue" />
              </div>
              <div className="card-parade">
                <ImageLoader name="cards/repose" />
              </div>
              <div className="card-bonus">
                <ImageLoader name="cards/infatiguable" />
              </div>
            </div>
            <div className="card">
              <div className="card-attaque">
                <ImageLoader name="cards/accident" />
              </div>
              <div className="card-parade">
                <ImageLoader name="cards/reparation" />
              </div>
              <div className="card-bonus">
                <ImageLoader name="cards/pilote" />
              </div>
            </div>
            <div className="card">
              <div className="card-attaque">
                <ImageLoader name="cards/embouteillage" />
              </div>
              <div className="card-parade">
                <ImageLoader name="cards/findembouteillage" />
              </div>
              <div className="card-bonus">
                <ImageLoader name="cards/deviation" />
              </div>
            </div>
          </div>

          <h3>Cartes du Jeu</h3>
          <ul>
            <li>
              <h4 className="color-sky">Cartes de Kilomètres</h4>
              <p>
                Ces cartes vous permettent d'avancer d'un certain nombre de
                kilomètres. Vous pouvez avancer de 25, 50, 75, 100 ou 200 kms.
              </p>
            </li>
            <li>
              <h4 className="color-green">Cartes de protection</h4>
              <p>Protégez-vous contre les attaques des autres joueurs.</p>
              <ul className="cards">
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/feuvert" />
                  </div>
                  <div className="card-name">Feu vert</div>
                  <div className="card-description">
                    Cette carte permet de contrer le Feu rouge. Le joueur peut à
                    nouveau avancer. Elle peut être nécessaire dès le début dans
                    certaines partie pour pouvoir commencer à rouler. Elle n'est
                    plus nécessaire avec le bonus "Carte de police".
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/findezonedecontrole" />
                  </div>
                  <div className="card-name">Fin de zone de contrôle</div>
                  <div className="card-description">
                    Cette carte permet de contrer la zone de contrôle. Le joueur
                    peut à nouveau avancer à plus de 50 km. Elle n'est plus
                    nécessaire avec le bonus "Carte de police".
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/reparation" />
                  </div>
                  <div className="card-name">Réparation</div>
                  <div className="card-description">
                    Cette carte permet de contrer un accident. Le joueur peut à
                    nouveau avancer. Elle n'est plus nécessaire avec le bonus
                    "Pilote".
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/repose" />
                  </div>
                  <div className="card-name">En pleine forme</div>
                  <div className="card-description">
                    Cette carte permet de contrer la fatigue. Le joueur peut à
                    nouveau avancer. Elle n'est plus nécessaire avec le bonus
                    "infatiguable".
                  </div>
                </li>
              </ul>
            </li>
            <li>
              <h4 className="color-red">Cartes d'attaque</h4>
              <p>
                Utilisez ces cartes pour ralentir ou arrêter vos adversaires.
              </p>

              <ul className="cards">
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/feurouge" />
                  </div>
                  <div className="card-name">Feu rouge</div>
                  <div className="card-description">
                    Le joueur ne peut plus avancer avant d'utiliser un Feu vert.
                    Ne peut pas être appliqué si le joueur possède le bonus
                    "Carte de police".
                  </div>
                </li>

                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/accident" />
                  </div>
                  <div className="card-name">Accident</div>
                  <div className="card-description">
                    Le joueur ne peut plus avancer avant d'utiliser une
                    Réparation. Ne peut pas être appliqué si le joueur possède
                    le bonus "Pilote".
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/fatigue" />
                  </div>
                  <div className="card-name">Fatigue</div>
                  <div className="card-description">
                    Le joueur ne peut plus avancer avant d'utiliser En pleine
                    forme. Ne peut pas être appliqué si le joueur possède le
                    bonus "Infatiguable".
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/embouteillage" />
                  </div>
                  <div className="card-name">Embouteillage</div>
                  <div className="card-description">
                    Le joueur ne peut plus avancer avant d'utiliser Fin
                    d'embouteillage. Ne peut pas être appliqué si le joueur
                    possède le bonus "Déviation".
                  </div>
                </li>
              </ul>
            </li>
            <li>
              <h4 className="color-orange">Cartes bonus</h4>
              <p>
                Elles vous permettent d'être immunisé contre certaines attaques.
              </p>

              <ul className="cards">
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/cartedepolice" />
                  </div>
                  <div className="card-name">Carte de police</div>
                  <div className="card-description">
                    Il n'est plus possible pour le joueur d'être attaqué par un
                    feu rouge ou une zone de contrôle.
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/pilote" />
                  </div>
                  <div className="card-name">Pilote</div>
                  <div className="card-description">
                    Il n'est plus possible pour le joueur d'être attaqué par un
                    accident.
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/infatiguable" />
                  </div>
                  <div className="card-name">Infatiguable</div>
                  <div className="card-description">
                    Il n'est plus possible pour le joueur d'être attaqué par une
                    fatigue.
                  </div>
                </li>
                <li>
                  <div className="card-img">
                    <ImageLoader name="cards/deviation" />
                  </div>
                  <div className="card-name">Déviation</div>
                  <div className="card-description">
                    Il n'est plus possible pour le joueur d'être attaqué par un
                    embouteillage.
                  </div>
                </li>
              </ul>
            </li>
          </ul>
          <BackButton />
        </div>
      </div>
    </>
  );
};

export default Rules;
