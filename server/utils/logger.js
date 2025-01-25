const path = require("path");
const fs = require("fs");
// Définir le chemin du fichier de logs
const logFilePath = path.join(__dirname, "..", "app.log");

const log = (...args) => {
  const stack = new Error().stack;
  const callerLine = stack.split("\n")[2];
  const fileDetails = callerLine.match(/\((.*):(\d+):(\d+)\)/);

  const logMessage = new Date().toISOString(); // Ajouter la date et l'heure du log
  let formattedMessage = "";

  // Convertir les objets en chaînes JSON
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      return JSON.stringify(arg, null, 2); // Convertit l'objet en chaîne JSON avec une indentation de 2 espaces
    }
    return arg;
  });

  if (fileDetails) {
    // Extraction des informations
    const fullPath = fileDetails[1];
    const line = fileDetails[2];
    const column = fileDetails[3];

    // Utilisation de path.basename pour récupérer uniquement le nom du fichier
    const file = "\\" + path.basename(fullPath);

    formattedMessage = `***[${file}:${line}:${column}] ${logMessage} - ${formattedArgs.join(
      " "
    )}`;
  } else {
    formattedMessage = `${logMessage} - ${formattedArgs.join(" ")}`;
  }

  // Affichage dans la console
  console.log(formattedMessage);

  // Enregistrement dans le fichier de logs
  fs.appendFile(logFilePath, formattedMessage + "\n", (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture du log dans le fichier", err);
    }
  });
};

module.exports = { log };
