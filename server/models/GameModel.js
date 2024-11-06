const PlayerModel = require("./PlayerModel");

const cards = [
  {
    id: 1,
    name: "Véhicule prioritaire",
    tag: "vehiculeprioritaire",
    type: "bonus",
    status: false,
  },
  {
    id: 2,
    name: "Citerne d'essence",
    tag: "citerne",
    type: "bonus",
    status: false,
  },
  {
    id: 3,
    name: "Increvable",
    tag: "increvable",
    type: "bonus",
    status: false,
  },
  {
    id: 4,
    name: "As du volant",
    tag: "asduvolant",
    type: "bonus",
    status: false,
  },

  {
    id: 5,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",

    status: false,
  },
  {
    id: 6,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",

    status: false,
  },
  {
    id: 7,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",

    status: false,
  },
  {
    id: 8,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",

    status: false,
  },
  {
    id: 9,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",

    status: false,
  },

  {
    id: 10,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",

    status: false,
  },
  {
    id: 11,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",

    status: false,
  },
  {
    id: 12,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",

    status: false,
  },
  {
    id: 13,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",

    status: false,
  },

  {
    id: 14,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",

    status: false,
  },
  {
    id: 15,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",

    status: false,
  },
  {
    id: 16,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",

    status: false,
  },

  {
    id: 17,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",

    status: false,
  },
  {
    id: 18,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",

    status: false,
  },
  {
    id: 19,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",

    status: false,
  },

  {
    id: 20,
    name: "Accident",
    tag: "accident",
    type: "attaque",

    status: false,
  },
  {
    id: 21,
    name: "Accident",
    tag: "accident",
    type: "attaque",

    status: false,
  },
  {
    id: 22,
    name: "Accident",
    tag: "accident",
    type: "attaque",

    status: false,
  },

  {
    id: 23,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 24,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 25,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 26,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 27,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 28,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 29,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 30,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 31,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 32,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 33,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 34,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 35,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },
  {
    id: 36,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",

    status: false,
  },

  {
    id: 37,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },
  {
    id: 38,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },
  {
    id: 39,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },
  {
    id: 40,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },
  {
    id: 41,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },
  {
    id: 42,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",

    status: false,
  },

  {
    id: 43,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },
  {
    id: 44,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },
  {
    id: 45,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },
  {
    id: 46,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },
  {
    id: 47,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },
  {
    id: 48,
    name: "Essence",
    tag: "essence",
    type: "parade",

    status: false,
  },

  {
    id: 49,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },
  {
    id: 50,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },
  {
    id: 51,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },
  {
    id: 52,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },
  {
    id: 53,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },
  {
    id: 54,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",

    status: false,
  },

  {
    id: 55,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },
  {
    id: 56,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },
  {
    id: 57,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },
  {
    id: 58,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },
  {
    id: 59,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },
  {
    id: 60,
    name: "Réparation",
    tag: "reparation",
    type: "parade",

    status: false,
  },

  {
    id: 61,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 62,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 63,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 64,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 65,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 66,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 67,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 68,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 69,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },
  {
    id: 70,
    name: "25",
    tag: "25",
    type: "borne",

    status: false,
    value: 25,
  },

  {
    id: 71,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 72,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 73,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 74,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 75,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 76,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 77,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 78,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 79,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },
  {
    id: 80,
    name: "50",
    tag: "50",
    type: "borne",

    status: false,
    value: 50,
  },

  {
    id: 81,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 82,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 83,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 84,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 85,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 86,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 87,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 88,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 89,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 90,
    name: "75",
    tag: "75",
    type: "borne",

    status: false,
    value: 75,
  },
  {
    id: 91,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },

  {
    id: 92,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 93,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 94,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 95,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 96,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 97,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 98,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 99,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 100,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 101,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 102,
    name: "100",
    tag: "100",
    type: "borne",

    status: false,
    value: 100,
  },
  {
    id: 103,
    name: "200",
    tag: "200",
    type: "borne",

    status: false,
    value: 200,
  },
  {
    id: 104,
    name: "200",
    tag: "200",
    type: "borne",

    status: false,
    value: 200,
  },
  {
    id: 105,
    name: "200",
    tag: "200",
    type: "borne",

    status: false,
    value: 200,
  },
  {
    id: 106,
    name: "200",
    tag: "200",
    type: "borne",

    status: false,
    value: 200,
  },
];

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
    this.deck = cards;
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

    if (playerCount < 3) {
      let newPlayer = new PlayerModel(id, username);
      this.players[id] = newPlayer;
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

  removeCard(playerId, cardId) {
    let player = this.players[playerId];
    let cardIndex = player.hand.findIndex((card) => card.id === cardId);
    let [discardedCard] = player.hand.splice(cardIndex, 1);

    this.discard.push(discardedCard);

    console.log(
      `Carte défaussée par le joueur ${this.players[playerId].username}.`
    );
  }

  drawCard(playerId) {
    const player = this.players[playerId];

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
      `Carte ${drawnCard.name} ajoutée à la main du joueur ${playerId}.`
    );
  }
}

module.exports = GameModel;
