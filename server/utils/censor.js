const fs = require("fs");
const leoProfanity = require("leo-profanity");

function loadBannedWords() {
  try {
    // const data = fs.readFileSync("./bannedWords.json", "utf8");
    // const customWords = JSON.parse(data);

    // Ajouter les mots personnalisés à la liste existante
    filter.clearList();
    // leoProfanity.add(customWords);
  } catch (error) {
    console.error("Erreur lors du chargement des mots interdits :", error);
  }
}

// Fonction pour censurer un texte
function censorText(text) {
  const censoredText = leoProfanity.clean(text);
  return {
    status: censoredText !== text, // true si une censure a été appliquée
    result: censoredText,
  };
}

// Charger les mots au démarrage
loadBannedWords();

module.exports = { censorText };
