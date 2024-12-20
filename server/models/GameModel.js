const PlayerModel = require("./PlayerModel");

function generateCards(cardCounts = {}) {
  const baseCards = [
    {
      id: "",
      name: "Feu rouge",
      tag: "feurouge",
      type: "attaque",
      status: false,
    },
    {
      id: "",
      name: "Limite de vitesse",
      tag: "limitedevitesse",
      type: "attaque",
      status: false,
    },
    {
      id: "",
      name: "Panne d'essence",
      tag: "pannedessence",
      type: "attaque",
      status: false,
    },
    {
      id: "",
      name: "Crevaison",
      tag: "crevaison",
      type: "attaque",
      status: false,
    },
    {
      id: "",
      name: "Accident",
      tag: "accident",
      type: "attaque",
      status: false,
    },
    { id: "", name: "Feu vert", tag: "feuvert", type: "parade", status: false },
    {
      id: "",
      name: "Fin de limite de vitesse",
      tag: "findelimitedevitesse",
      type: "parade",
      status: false,
    },
    { id: "", name: "Essence", tag: "essence", type: "parade", status: false },
    {
      id: "",
      name: "Roue de secours",
      tag: "rouedesecours",
      type: "parade",
      status: false,
    },
    {
      id: "",
      name: "Réparation",
      tag: "reparation",
      type: "parade",
      status: false,
    },
    { id: "", name: "25", tag: "25", type: "borne", status: false, value: 25 },
    { id: "", name: "50", tag: "50", type: "borne", status: false, value: 50 },
    { id: "", name: "75", tag: "75", type: "borne", status: false, value: 75 },
    {
      id: "",
      name: "100",
      tag: "100",
      type: "borne",
      status: false,
      value: 100,
    },
  ];

  const bonusCards = [
    {
      id: "",
      name: "Véhicule prioritaire",
      tag: "vehiculeprioritaire",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "Citerne d'essence",
      tag: "citerne",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "Increvable",
      tag: "increvable",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "As du volant",
      tag: "asduvolant",
      type: "bonus",
      status: false,
    },
  ];

  // Valeurs par défaut pour chaque type de carte
  const defaultCounts = {
    vehiculeprioritaire: 1,
    citerne: 1,
    increvable: 1,
    asduvolant: 1,
    feurouge: 5,
    limitedevitesse: 4,
    pannedessence: 3,
    crevaison: 3,
    accident: 3,
    feuvert: 36,
    findelimitedevitesse: 6,
    essence: 7,
    rouedesecours: 6,
    reparation: 6,
    25: 10,
    50: 10,
    75: 10,
    100: 1,
  };

  let generatedCards = [];
  let currentId = 1;

  // Utiliser les valeurs de cardCounts ou les valeurs par défaut
  for (const [tag, defaultCount] of Object.entries(defaultCounts)) {
    const count = cardCounts[tag] || defaultCount; // Utilise la valeur de cardCounts ou la valeur par défaut

    const cardTemplate = baseCards.find((card) => card.tag === tag);
    if (cardTemplate) {
      for (let i = 0; i < count; i++) {
        generatedCards.push({ ...cardTemplate, id: currentId++ });
      }
    }
  }

  // Ajouter les cartes bonus avec des valeurs par défaut
  bonusCards.forEach((card) => {
    generatedCards.push({ ...card, id: currentId++ });
  });

  return generatedCards;
}

class GameModel {
  constructor(id, name, author, maxPlayers) {
    this.id = id;
    this.name = name;
    this.author = author;
    this.players = {};
    this.maxPlayers = maxPlayers;
    this.deck = [];
    this.discard = [];
    this.start = false;
    this.currentPlayer = 1;
  }

  reset() {
    // Mélange du deck
    this.deck = generateCards();
    this.deck = this.deck.sort(() => Math.random() - 0.5);

    const playersArray = Object.values(this.players);

    // Distribution des cartes aux joueurs
    playersArray.forEach((player) => {
      player.hand = this.deck.splice(0, 6);
    });

    // Mélangez les positions des joueurs
    const positions = playersArray.map((_, index) => index + 1);
    positions.sort(() => Math.random() - 0.5);

    // Assignez les positions aux joueurs
    playersArray.forEach((player, index) => {
      player.position = positions[index];
    });
  }

  startGame() {
    this.start = true;
  }

  addPlayer(id, username) {
    let playerCount = Object.keys(this.players).length;

    if (Number(playerCount) + 1 <= Number(this.maxPlayers)) {
      let newPlayer = new PlayerModel(id, username);
      this.players[username] = newPlayer;
      return true;
    }
    return false;
  }

  nextPlayer() {
    let newCurrentPlayer = Number(this.currentPlayer) + 1;
    if (newCurrentPlayer > this.maxPlayers) {
      this.currentPlayer = 1;
    } else {
      this.currentPlayer = newCurrentPlayer;
    }
  }

  updatePlayer(id, update) {
    console.log("update player");
    this.players[id] = update;
  }

  removeCard(playerUsername, cardId) {
    let player = this.players[playerUsername];
    let cardIndex = player.hand.findIndex((card) => card.id === cardId);
    let [discardedCard] = player.hand.splice(cardIndex, 1);

    this.discard.push(discardedCard);

    console.log(`Carte défaussée par le joueur ${playerUsername}.`);
  }

  drawCard(playerUsername) {
    const player = this.players[playerUsername];

    // Vérifie si le deck contient des cartes
    if (this.deck.length === 0) {
      console.log("Le deck est vide, aucune carte à tirer.");
      return;
    }

    // Tire une carte au hasard
    const randomIndex = Math.floor(Math.random() * this.deck.length);
    const drawnCard = this.deck[randomIndex];

    // Retire la carte du deck
    this.deck.splice(randomIndex, 1);

    // Ajoute la carte à la main du joueur
    player.hand.push(drawnCard);

    console.log(
      `Carte ${drawnCard.name} ajoutée à la main du joueur ${playerUsername}.`
    );
  }
}

module.exports = GameModel;
