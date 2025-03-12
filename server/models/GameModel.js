const PlayerModel = require("./PlayerModel");

function generateCards(cardCounts) {
  let cards = cardCounts || {};
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
      name: "Zone de contrôle",
      tag: "zonedecontrole",
      type: "attaque",
      status: false,
    },
    {
      id: "",
      name: "Embouteillage",
      tag: "embouteillage",
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
    {
      id: "",
      name: "Fatigue",
      tag: "fatigue",
      type: "attaque",
      status: false,
    },
    { id: "", name: "Feu vert", tag: "feuvert", type: "parade", status: false },
    {
      id: "",
      name: "Fin de zone de contrôle",
      tag: "findezonedecontrole",
      type: "parade",
      status: false,
    },
    {
      id: "",
      name: "Fin d'embouteillage",
      tag: "findembouteillage",
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
    {
      id: "",
      name: "En pleine forme",
      tag: "repose",
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
    {
      id: "",
      name: "200",
      tag: "200",
      type: "borne",
      status: false,
      value: 200,
    },
  ];

  const bonusCards = [
    {
      id: "",
      name: "Carte de police",
      tag: "cartedepolice",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "Déviation",
      tag: "deviation",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "Pilote",
      tag: "pilote",
      type: "bonus",
      status: false,
    },
    {
      id: "",
      name: "Infatiguable",
      tag: "infatiguable",
      type: "bonus",
      status: false,
    },
  ];

  const defaultCounts = {
    // cartedepolice: 1,
    // deviation: 1,
    // pilote: 1,
    // infatiguable: 1,
    // feurouge: 2,
    // zonedecontrole: 2,
    // embouteillage: 2,
    // accident: 2,
    // fatigue: 2,
    // feuvert: 12,
    // findezonedecontrole: 2,
    // findembouteillage: 2,
    // reparation: 2,
    // repose: 2,
    // 25: 12,
    // 50: 12,
    // 75: 12,
    // 100: 2,
    // 200: 2,

    cartedepolice: 1,
    deviation: 1,
    pilote: 1,
    infatiguable: 1,
    feurouge: 5,
    zonedecontrole: 4,
    embouteillage: 3,
    accident: 3,
    fatigue: 3,
    feuvert: 14,
    findezonedecontrole: 6,
    findembouteillage: 6,
    reparation: 6,
    repose: 6,
    25: 10,
    50: 10,
    75: 10,
    100: 12,
    200: 4,
  };

  let generatedCards = [];
  let currentId = 1;

  let multiplier = 1;
  if (cardCounts === "x2") {
    multiplier = 2;
  } else if (cardCounts === "x3") {
    multiplier = 3;
  }

  for (const [tag, defaultCount] of Object.entries(defaultCounts)) {
    let count = defaultCount;
    if (
      (cardCounts !== "unlimited") & (cardCounts !== "x1") &&
      !bonusCards.some((card) => card.tag === tag)
    ) {
      count *= multiplier;
    }

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

  console.log(`Nombre total de cartes générées: ${generatedCards.length}`);

  return generatedCards;
}

class GameModel {
  constructor({
    id,
    name,
    host,
    type,
    maxPlayers,
    handSize,
    isDeckUnlimited,
    requiredScore,
    autoRemovePenality,
    cardCounts,
    isProtected,
  }) {
    // Informations de base
    this.id = id || null;
    this.name = name || null;
    this.host = host || null;
    this.type = type || null;
    // Configuration de la partie
    this.maxPlayers = maxPlayers || null;
    this.handSize = handSize || 6;
    this.isDeckUnlimited = isDeckUnlimited || false;
    this.requiredScore = requiredScore || 1000;
    this.autoRemovePenality = autoRemovePenality || false;
    this.cardCounts = cardCounts || null;
    this.isProtected = isProtected || null;
    // État du jeu
    this.deck = [];
    this.discard = null;
    this.start = false;
    this.gameOver = false;
    this.currentPlayer = 1;
    // Joueurs & classement
    this.players = {};
    this.podium = [];
  }

  reset() {
    // Mélange du deck
    if (this.cardCounts) {
      this.deck = generateCards(this.cardCounts);
    } else {
      this.deck = generateCards();
    }
    this.deck = this.deck.sort(() => Math.random() - 0.5);

    const playersArray = Object.values(this.players);

    // Distribution des cartes aux joueurs
    playersArray.forEach((player) => {
      player.hand = this.deck.splice(0, this.handSize);
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

  endGame() {
    this.gameOver = true;
    const players = Object.values(this.players);
    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    this.podium = sortedPlayers.map((player) => player.username);
  }

  addPlayer(id, username) {
    console.log(`addPlayerModel: Entrée dans la fonction`);

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
    if (newCurrentPlayer > Object.keys(this.players).length) {
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

    this.discard = discardedCard;

    console.log(`Carte défaussée par le joueur ${playerUsername}.`);
  }

  drawCard(playerUsername) {
    const player = this.players[playerUsername];

    if (this.isDeckUnlimited && this.deck.length === 1) {
      this.deck = generateCards();
    } else if (this.deck.length === 0) {
      console.log("Le deck est vide, aucune carte à tirer.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.deck.length);
    const drawnCard = this.deck[randomIndex];

    this.deck.splice(randomIndex, 1);
    player.hand.push(drawnCard);

    console.log(
      `Carte ${drawnCard.name} ajoutée à la main du joueur ${playerUsername}.`
    );
  }
}

module.exports = GameModel;
