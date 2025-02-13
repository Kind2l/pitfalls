import React from "react";

/**
 * Composant permettant d'afficher une image à partir de son identifiant.
 *
 * @param {string} name - Nom de l'image sans l'extension (ex: "logo", "icons/feurouge", "cards/accident").
 * @param {string} [alt="Image"] - Texte alternatif pour l'image.
 * @param {string} [className=""] - Classes CSS supplémentaires.
 * @returns {JSX.Element} - Élément JSX contenant l'image ou un message d'erreur.
 */
const ImageLoader = ({ name, alt = "Image", className = "" }) => {
  const basePath = "/images/";
  const imageSrc = `${basePath}${name}.png`;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        console.error(`Image not found: ${imageSrc}`);
        e.target.src = "/images/not-found.png";
        e.target.alt = "Image non trouvée";
      }}
    />
  );
};

export default ImageLoader;
