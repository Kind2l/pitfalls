class PlayerModel {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.hand = [];
    this.bonus = {
      increvable: false,
      asduvolant: false,
      vehiculeprioritaire: false,
      citerne: false,
    };
    this.score = 0;
    this.states = {
      feurouge: true,
      limitedevitesse: false,
      accident: false,
      crevaison: false,
      pannedessence: false,
    };
  }

  reset() {
    this.hand = [];
    this.bonus = {
      increvable: false,
      asduvolant: false,
      vehiculeprioritaire: false,
      citerne: false,
    };
    this.score = 0;
    this.states = {
      feurouge: true,
      limitedevitesse: false,
      accident: false,
      crevaison: false,
      pannedessence: false,
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
      case "increvable":
        this.bonus.increvable = true;
        break;
      case "asduvolant":
        this.bonus.asduvolant = true;
        break;
      case "vehiculeprioritaire":
        this.bonus.vehiculeprioritaire = true;
        break;
      case "citerne":
        this.bonus.citerne = true;
        break;
    }
  }

  addAttack(slug) {
    if (slug != "limitedevitesse") {
      if (
        this.states.accident === true ||
        this.states.pannedessence === true ||
        this.states.crevaison === true ||
        this.states.feurouge === true
      ) {
        return;
      }
    }

    if (slug === "feurouge") {
      if (this.bonus.vehiculeprioritaire === true) {
        return;
      }
      this.states.feurouge = true;
    }

    if (slug === "limitedevitesse") {
      if (this.bonus.vehiculeprioritaire === true) {
        return;
      }
      if (this.states.limitedevitesse === true) {
        return;
      }
      this.states.limitedevitesse = true;
    }

    if (slug === "pannedessence") {
      if (this.bonus.citerne === true) {
        return;
      }
      this.states.pannedessence = true;
    }

    if (slug === "crevaison") {
      if (this.bonus.increvable === true) {
        return;
      }
      this.states.crevaison = true;
    }

    if (slug === "accident") {
      if (this.bonus.asduvolant === true) {
        return;
      }
      this.states.accident = true;
    }
  }

  addParade(slug) {
    if (slug === "feuvert") {
      if (this.bonus.vehiculeprioritaire === true) {
        return;
      }
      if (this.states.feurouge === false) {
        return;
      }
      this.states.feurouge = false;
    }

    if (slug === "findelimitedevitesse") {
      if (this.bonus.vehiculeprioritaire === true) {
        return;
      }
      if (this.states.limitedevitesse === false) {
        return;
      }
      this.states.limitedevitesse = false;
    }

    if (slug === "essence") {
      if (this.bonus.citerne === true) {
        return;
      }
      if (this.states.pannedessence === false) {
        return;
      }
      this.states.pannedessence = false;
    }

    if (slug === "rouedesecours") {
      if (this.bonus.increvable === true) {
        return;
      }
      if (this.states.crevaison === false) {
        return;
      }
      this.states.crevaison = false;
    }

    if (slug === "reparation") {
      if (this.bonus.asduvolant === true) {
        return;
      }
      if (this.states.accident === false) {
        return;
      }
      this.states.accident = false;
    }
  }

  addPoint(point) {
    this.score = Number(this.score) + Number(point);
  }
}

module.exports = PlayerModel;
