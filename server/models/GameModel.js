const PlayerModel = require("./PlayerModel");

function generateCards(custom) {
  let cardCounts = custom || {};
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

  // Valeurs par défaut pour chaque type de carte
  const defaultCounts = {
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
  constructor(id, name, author, maxPlayers, custom) {
    this.id = id;
    this.name = name;
    this.author = author;
    this.players = new Proxy(
      {},
      {
        set: (target, key, value) => {
          // Validation : vérifier que la valeur est un joueur valide
          if (
            value &&
            typeof value.id === "number" &&
            typeof value.username === "string"
          ) {
            console.log(`Ajout/mise à jour du joueur : ${key}`);
            target[key] = value; // Ajout/mise à jour du joueur
          } else {
            console.error(
              `Tentative d'ajout d'une valeur invalide à players :`,
              value
            );
          }
          return true;
        },
        deleteProperty: (target, key) => {
          console.log(`Suppression du joueur : ${key}`);
          delete target[key];
          return true;
        },
      }
    );
    this.maxPlayers = maxPlayers;
    this.deck = [];
    this.discard = [];
    this.start = false;
    this.gameOver = false;
    this.currentPlayer = 1;
    this.requiredScore = 1000;
    this.podium = [];
    this.custom = custom;
  }

  reset() {
    // Mélange du deck
    if (this.custom) {
      console.log("reset custom");
      this.deck = generateCards(this.custom);
    } else {
      console.log("reset classic");
      this.deck = generateCards();
    }
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
    console.log("reset end");
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
    let playerCount = Object.keys(this.players).length;

    if (Number(playerCount) + 1 <= Number(this.maxPlayers)) {
      let newPlayer = new PlayerModel(id, username);
      this.players[username] = newPlayer;
      return true;
    }
    return false;
  }

  nextPlayer() {
    console.log("nextPlayer: Entrée dans la fonction");

    let newCurrentPlayer = Number(this.currentPlayer) + 1;
    console.log("nextPlayer: currentPlayer", this.currentPlayer);
    console.log("nextPlayer: newCurrentPlayer", newCurrentPlayer);
    console.log("nextPlayer: players", this.players);

    if (newCurrentPlayer > Object.keys(this.players).length) {
      this.currentPlayer = 1;
      console.log("nextPlayer: newCurrentPlayer", newCurrentPlayer);
    } else {
      this.currentPlayer = newCurrentPlayer;
      console.log("nextPlayer: newCurrentPlayer", newCurrentPlayer);
    }
    console.log("nextPlayer:", this.players);
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
