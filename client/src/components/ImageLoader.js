import React from "react";

// Importation des images du dossier images/
import arrival from "@Images/arrival.svg";
import closeEye from "@Images/close-eye.svg";
import logoMin from "@Images/logo-min.svg";
import logoWelcomer from "@Images/logo-welcomer.svg";
import logo from "@Images/logo.svg";
import menu from "@Images/menu.svg";
import message from "@Images/message.svg";
import musicOff from "@Images/music-off.svg";
import musicOn from "@Images/music-on.svg";
import openEye from "@Images/open-eye.svg";
import planet2 from "@Images/planet2.svg";
import share from "@Images/share.svg";
import soundOff from "@Images/sound-off.svg";
import soundOn from "@Images/sound-on.svg";
import trash from "@Images/trash.svg";
import wheel from "@Images/wheel.svg";

// Importation des images du dossier images/icons/
import iconAccident from "@Images/icons/accident.svg";
import iconCartePolice from "@Images/icons/cartedepolice.svg";
import iconDeviation from "@Images/icons/deviation.svg";
import iconEmbouteillage from "@Images/icons/embouteillage.svg";
import iconFatigue from "@Images/icons/fatigue.svg";
import iconFeuRouge from "@Images/icons/feurouge.svg";
import iconInfatiguable from "@Images/icons/infatiguable.svg";
import iconPilote from "@Images/icons/pilote.svg";
import iconZoneDeControle from "@Images/icons/zonedecontrole.svg";

// Importation des images du dossier images/cars/
import carsLittleCarBlue from "@Images/cars/blue-little-car.svg";
import carsLittleCarGreen from "@Images/cars/green-little-car.svg";
import carsLittleCarOrange from "@Images/cars/orange-little-car.svg";
import carsLittleCarRed from "@Images/cars/red-little-car.svg";

// Importation des images du dossier images/cards/
import cardAccident from "@Images/cards/accident.svg";
import cardCartePolice from "@Images/cards/cartedepolice.svg";
import cardDeviation from "@Images/cards/deviation.svg";
import cardEmbouteillage from "@Images/cards/embouteillage.svg";
import cardFatigue from "@Images/cards/fatigue.svg";
import cardFeuRouge from "@Images/cards/feurouge.svg";
import cardFeuVert from "@Images/cards/feuvert.svg";
import cardFinEmbouteillage from "@Images/cards/findembouteillage.svg";
import cardFinZoneDeControle from "@Images/cards/findezonedecontrole.svg";
import cardInfatiguable from "@Images/cards/infatiguable.svg";
import cardPilote from "@Images/cards/pilote.svg";
import cardReparation from "@Images/cards/reparation.svg";
import cardRepose from "@Images/cards/repose.svg";
import cardZoneDeControle from "@Images/cards/zonedecontrole.svg";
import trophy from "@Images/trophy.svg";

// Objet contenant toutes les images
const images = {
  img_logo: logo,
  img_logoMin: logoMin,
  img_logoWelcomer: logoWelcomer,
  img_wheel: wheel,
  img_share: share,
  img_planet2: planet2,
  img_arrival: arrival,
  img_closeEye: closeEye,
  img_openEye: openEye,
  img_trash: trash,
  img_trophy: trophy,
  img_soundOn: soundOn,
  img_soundOff: soundOff,
  img_musicOn: musicOn,
  img_musicOff: musicOff,
  img_message: message,
  img_menu: menu,

  cars_little_1: carsLittleCarBlue,
  cars_little_2: carsLittleCarRed,
  cars_little_3: carsLittleCarGreen,
  cars_little_4: carsLittleCarOrange,

  icon_feurouge: iconFeuRouge,
  icon_accident: iconAccident,
  icon_cartedepolice: iconCartePolice,
  icon_deviation: iconDeviation,
  icon_embouteillage: iconEmbouteillage,
  icon_pilote: iconPilote,
  icon_fatigue: iconFatigue,
  icon_zonedecontrole: iconZoneDeControle,
  icon_infatiguable: iconInfatiguable,

  card_accident: cardAccident,
  card_cartedepolice: cardCartePolice,
  card_deviation: cardDeviation,
  card_embouteillage: cardEmbouteillage,
  card_feurouge: cardFeuRouge,
  card_feuvert: cardFeuVert,
  card_findembouteillage: cardFinEmbouteillage,
  card_repose: cardRepose,
  card_findezonedecontrole: cardFinZoneDeControle,
  card_infatiguable: cardInfatiguable,
  card_pilote: cardPilote,
  card_reparation: cardReparation,
  card_fatigue: cardFatigue,
  card_zonedecontrole: cardZoneDeControle,
};

/**
 * Composant permettant d'afficher une image à partir de son identifiant.
 *
 * @param {string} name - Nom de l'image (ex: "img_logo", "icon_feurouge", "card_accident").
 * @param {string} [alt="Image"] - Texte alternatif pour l'image.
 * @param {string} [className=""] - Classes CSS supplémentaires.
 * @returns {JSX.Element} - Élément JSX contenant l'image ou un message d'erreur.
 */
const ImageLoader = ({ name, alt = "Image", className = "" }) => {
  const imageSrc = images[name];

  if (!imageSrc || imageSrc === "card_undefined") {
    console.error(`Image not found: ${name}`);
    return <p style={{ color: "red" }}>{name}</p>;
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

export default ImageLoader;
