const PlayerModel = require("./PlayerModel");

const cards = [
  {
    id: 1,
    name: "Véhicule prioritaire",
    tag: "vehiculeprioritaire",
    type: "bonus",
    image: "vehiculeprioritaire.jpg",
    status: false,
  },
  {
    id: 2,
    name: "Citerne d'essence",
    tag: "citerne",
    type: "bonus",
    image: "citerne.jpg",
    status: false,
  },
  {
    id: 3,
    name: "Increvable",
    tag: "increvable",
    type: "bonus",
    image: "increvable.jpg",
    status: false,
  },
  {
    id: 4,
    name: "As du volant",
    tag: "asduvolant",
    type: "bonus",
    image: "asduvolant.jpg",
    status: false,
  },

  {
    id: 5,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",
    image: "feurouge.jpg",
    status: false,
  },
  {
    id: 6,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",
    image: "feurouge.jpg",
    status: false,
  },
  {
    id: 7,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",
    image: "feurouge.jpg",
    status: false,
  },
  {
    id: 8,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",
    image: "feurouge.jpg",
    status: false,
  },
  {
    id: 9,
    name: "Feu rouge",
    tag: "feurouge",
    type: "attaque",
    image: "feurouge.jpg",
    status: false,
  },

  {
    id: 10,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",
    image: "limitedevitesse.jpg",
    status: false,
  },
  {
    id: 11,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",
    image: "limitedevitesse.jpg",
    status: false,
  },
  {
    id: 12,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",
    image: "limitedevitesse.jpg",
    status: false,
  },
  {
    id: 13,
    name: "Limite de vitesse",
    tag: "limitedevitesse",
    type: "attaque",
    image: "limitedevitesse.jpg",
    status: false,
  },

  {
    id: 14,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",
    image: "pannedessence.jpg",
    status: false,
  },
  {
    id: 15,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",
    image: "pannedessence.jpg",
    status: false,
  },
  {
    id: 16,
    name: "Panne d'essence",
    tag: "pannedessence",
    type: "attaque",
    image: "pannedessence.jpg",
    status: false,
  },

  {
    id: 17,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",
    image: "crevaison.jpg",
    status: false,
  },
  {
    id: 18,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",
    image: "crevaison.jpg",
    status: false,
  },
  {
    id: 19,
    name: "Crevaison",
    tag: "crevaison",
    type: "attaque",
    image: "crevaison.jpg",
    status: false,
  },

  {
    id: 20,
    name: "Accident",
    tag: "accident",
    type: "attaque",
    image: "accident.jpg",
    status: false,
  },
  {
    id: 21,
    name: "Accident",
    tag: "accident",
    type: "attaque",
    image: "accident.jpg",
    status: false,
  },
  {
    id: 22,
    name: "Accident",
    tag: "accident",
    type: "attaque",
    image: "accident.jpg",
    status: false,
  },

  {
    id: 23,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 24,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 25,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 26,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 27,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 28,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 29,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 30,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 31,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 32,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 33,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 34,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 35,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },
  {
    id: 36,
    name: "Feu vert",
    tag: "feuvert",
    type: "parade",
    image: "feuvert.jpg",
    status: false,
  },

  {
    id: 37,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },
  {
    id: 38,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },
  {
    id: 39,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },
  {
    id: 40,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },
  {
    id: 41,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },
  {
    id: 42,
    name: "Fin de limite de vitesse",
    tag: "findelimitedevitesse",
    type: "parade",
    image: "findelimitedevitesse.jpg",
    status: false,
  },

  {
    id: 43,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },
  {
    id: 44,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },
  {
    id: 45,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },
  {
    id: 46,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },
  {
    id: 47,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },
  {
    id: 48,
    name: "Essence",
    tag: "essence",
    type: "parade",
    image: "essence.jpg",
    status: false,
  },

  {
    id: 49,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },
  {
    id: 50,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },
  {
    id: 51,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },
  {
    id: 52,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },
  {
    id: 53,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },
  {
    id: 54,
    name: "Roue de secours",
    tag: "rouedesecours",
    type: "parade",
    image: "rouedesecours.jpg",
    status: false,
  },

  {
    id: 55,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },
  {
    id: 56,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },
  {
    id: 57,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },
  {
    id: 58,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },
  {
    id: 59,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },
  {
    id: 60,
    name: "Réparation",
    tag: "reparation",
    type: "parade",
    image: "reparation.jpg",
    status: false,
  },

  {
    id: 61,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 62,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 63,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 64,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 65,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 66,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 67,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 68,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 69,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },
  {
    id: 70,
    name: "25",
    tag: "25",
    type: "borne",
    image: "25.jpg",
    status: false,
    value: 25,
  },

  {
    id: 71,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 72,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 73,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 74,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 75,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 76,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 77,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 78,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 79,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },
  {
    id: 80,
    name: "50",
    tag: "50",
    type: "borne",
    image: "50.jpg",
    status: false,
    value: 50,
  },

  {
    id: 81,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 82,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 83,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 84,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 85,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 86,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 87,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 88,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 89,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 90,
    name: "75",
    tag: "75",
    type: "borne",
    image: "75.jpg",
    status: false,
    value: 75,
  },
  {
    id: 91,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },

  {
    id: 92,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 93,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 94,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 95,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 96,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 97,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 98,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 99,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 100,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 101,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 102,
    name: "100",
    tag: "100",
    type: "borne",
    image: "100.jpg",
    status: false,
    value: 100,
  },
  {
    id: 103,
    name: "200",
    tag: "200",
    type: "borne",
    image: "200.jpg",
    status: false,
    value: 200,
  },
  {
    id: 104,
    name: "200",
    tag: "200",
    type: "borne",
    image: "200.jpg",
    status: false,
    value: 200,
  },
  {
    id: 105,
    name: "200",
    tag: "200",
    type: "borne",
    image: "200.jpg",
    status: false,
    value: 200,
  },
  {
    id: 106,
    name: "200",
    tag: "200",
    type: "borne",
    image: "200.jpg",
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
}

module.exports = GameModel;