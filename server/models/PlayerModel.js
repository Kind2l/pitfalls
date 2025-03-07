class PlayerModel {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.hand = [];
    this.bonus = {
      pilote: false,
      infatiguable: false,
      cartedepolice: false,
      citerne: false,
    };
    this.score = 0;
    this.states = {
      feurouge: { value: true, count: 0 },
      zonedecontrole: { value: false, count: 0 },
      fatigue: { value: false, count: 0 },
      accident: { value: false, count: 0 },
      embouteillage: { value: false, count: 0 },
    };
  }

  reset() {
    this.hand = [];
    this.bonus = {
      pilote: false,
      infatiguable: false,
      cartedepolice: false,
      citerne: false,
    };
    this.score = 0;
    this.states = {
      feurouge: true,
      zonedecontrole: false,
      fatigue: false,
      accident: false,
      embouteillage: false,
    };
  }

  addCard(card) {
    this.hand.push(card);
  }

  removeCard(card) {
    this.hand = this.hand.filter((handCard) => handCard.id !== card.id);
  }

  addBonus(slug) {
    switch (slug) {
      case "pilote":
        this.bonus.pilote = true;
        break;
      case "infatiguable":
        this.bonus.infatiguable = true;
        break;
      case "cartedepolice":
        this.bonus.cartedepolice = true;
        break;
      case "deviation":
        this.bonus.deviation = true;
        break;
    }
  }

  addAttack(slug) {
    if (slug != "zonedecontrole") {
      if (
        this.states.fatigue === true ||
        this.states.embouteillage === true ||
        this.states.accident === true ||
        this.states.feurouge === true
      ) {
        return;
      }
    }

    if (slug === "feurouge") {
      if (this.bonus.cartedepolice === true) {
        return;
      }
      this.states.feurouge = true;
    }

    if (slug === "zonedecontrole") {
      if (this.bonus.cartedepolice === true) {
        return;
      }
      if (this.states.zonedecontrole === true) {
        return;
      }
      this.states.zonedecontrole = true;
    }

    if (slug === "embouteillage") {
      if (this.bonus.deviation === true) {
        return;
      }
      this.states.embouteillage = true;
    }

    if (slug === "accident") {
      if (this.bonus.pilote === true) {
        return;
      }
      this.states.accident = true;
    }

    if (slug === "fatigue") {
      if (this.bonus.infatiguable === true) {
        return;
      }
      this.states.fatigue = true;
    }
  }

  addParade(slug) {
    if (slug === "feuvert") {
      if (this.bonus.cartedepolice === true) {
        return;
      }
      if (this.states.feurouge === false) {
        return;
      }
      this.states.feurouge = false;
    }

    if (slug === "findezonedecontrole") {
      if (this.bonus.cartedepolice === true) {
        return;
      }
      if (this.states.zonedecontrole === false) {
        return;
      }
      this.states.zonedecontrole = false;
    }

    if (slug === "findembouteillage") {
      if (this.bonus.citerne === true) {
        return;
      }
      if (this.states.embouteillage === false) {
        return;
      }
      this.states.embouteillage = false;
    }

    if (slug === "reparation") {
      if (this.bonus.pilote === true) {
        return;
      }
      if (this.states.accident === false) {
        return;
      }
      this.states.accident = false;
    }

    if (slug === "repose") {
      if (this.bonus.infatiguable === true) {
        return;
      }
      if (this.states.fatigue === false) {
        return;
      }
      this.states.fatigue = false;
    }
  }

  addPoint(point) {
    this.score = Number(this.score) + Number(point);
  }
}

module.exports = PlayerModel;
