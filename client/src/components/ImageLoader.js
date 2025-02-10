import React from "react";

// Importation des images du dossier images/
import arrival from "@Images/arrival.png";
import closeEye from "@Images/close-eye.png";
import imageWelcomer from "@Images/image-welcomer.png";
import logoMin from "@Images/logo-min.png";
import logo from "@Images/logo.png";
import menu from "@Images/menu.png";
import message from "@Images/message.png";
import musicOff from "@Images/music-off.png";
import musicOn from "@Images/music-on.png";
import openEye from "@Images/open-eye.png";
import planet2 from "@Images/planet2.png";
import share from "@Images/share.png";
import soundOff from "@Images/sound-off.png";
import soundOn from "@Images/sound-on.png";
import trash from "@Images/trash.png";
import wheel from "@Images/wheel.png";

// Importation des images du dossier images/icons/
import iconAccident from "@Images/icons/accident.png";
import iconCartePolice from "@Images/icons/cartedepolice.png";
import iconDeviation from "@Images/icons/deviation.png";
import iconEmbouteillage from "@Images/icons/embouteillage.png";
import iconFatigue from "@Images/icons/fatigue.png";
import iconFeuRouge from "@Images/icons/feurouge.png";
import iconInfatiguable from "@Images/icons/infatiguable.png";
import iconPilote from "@Images/icons/pilote.png";
import iconZoneDeControle from "@Images/icons/zonedecontrole.png";

// Importation des images du dossier images/cars/
import carsLittleCarBlue from "@Images/cars/blue-little-car.png";
import carsLittleCarGreen from "@Images/cars/green-little-car.png";
import carsLittleCarOrange from "@Images/cars/orange-little-car.png";
import carsLittleCarRed from "@Images/cars/red-little-car.png";

// Importation des images du dossier images/cards/
import cardAccident from "@Images/cards/accident.png";
import cardCartePolice from "@Images/cards/cartedepolice.png";
import cardDeviation from "@Images/cards/deviation.png";
import cardEmbouteillage from "@Images/cards/embouteillage.png";
import cardFatigue from "@Images/cards/fatigue.png";
import cardFeuRouge from "@Images/cards/feurouge.png";
import cardFeuVert from "@Images/cards/feuvert.png";
import cardFinEmbouteillage from "@Images/cards/findembouteillage.png";
import cardFinZoneDeControle from "@Images/cards/findezonedecontrole.png";
import cardInfatiguable from "@Images/cards/infatiguable.png";
import cardPilote from "@Images/cards/pilote.png";
import cardReparation from "@Images/cards/reparation.png";
import cardRepose from "@Images/cards/repose.png";
import cardZoneDeControle from "@Images/cards/zonedecontrole.png";
import trophy from "@Images/trophy.png";

// Objet contenant toutes les images
const images = {
  img_logo: logo,
  img_logoMin: logoMin,
  img_imageWelcomer: imageWelcomer,
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
