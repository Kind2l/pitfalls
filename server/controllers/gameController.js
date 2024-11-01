const GameModel = require("../models/GameModel");
const servers = require("../utils/servers");
const { v4: uuidv4 } = require("uuid");

// createServer - Crée un nouveau serveur et l'ajoute à la liste des serveurs
exports.createServer = (req, res) => {
  const uniqueId = uuidv4();
  const newServer = new GameModel(
    uniqueId,
    req.serverName,
    req.user.username,
    req.maxPlayers
  );

  // newServer.addPlayer(req.id, req.username);
  servers[uniqueId] = newServer;
  req.socket.join(`server_${uniqueId}`);
  res({
    success: true,
    message: `Le serveur est créé`,
    data: {
      server: servers[uniqueId],
    },
  });
};

exports.addPlayer = (req, res) => {
  const server = servers[req.serverId];
  if (!server) {
    return res({
      success: false,
      message: "Serveur introuvable",
    });
  }
  const playerAdded = server.addPlayer(req.user.id, req.user.username); // On utilise la méthode addPlayer

  if (!playerAdded) {
    return res({
      success: false,
      message: "Le serveur est plein",
    });
  }
  req.socket.join(req.serverId);
  res({
    success: true,
    message: `L'utilisateur ${req.user.username} a été ajouté au serveur`,
    data: {
      server: server,
    },
  });
  req.io.emit("subscription:server-list", { servers });
};

exports.joinServer = (req, res) => {
  const findServer = Object.values(servers).find((s) => s.id === req.serverId);
  if (
    Object.keys(findServer.players).length > findServer.maxPlayers ||
    findServer.start === true
  ) {
    return res({
      success: false,
      message: `Le serveur est complet ou le jeu a déjà commencé`,
    });
  }
  req.socket.join(req.serverId);
  this.addPlayer(req, res);
  req.io.emit("subscription:server-list", { servers });
  req.io.to(req.serverId).emit("server:update", servers[req.serverId]);
};

exports.serverList = (req, res) => {
  res({
    success: true,
    message: `Liste des serveurs`,
    data: {
      servers,
    },
  });
};

exports.findServer = (req, res) => {
  let serverId = req.serverId;
  if (!serverId) {
    res({
      success: false,
      message: `Aucun identifiant de serveur`,
    });
    return;
  }
  let server = servers[serverId];

  if (!server) {
    res({
      success: false,
      message: `Le serveur n'existe pas`,
    });
    return;
  }

  res({
    success: true,
    message: `Serveur trouvé`,
    data: server,
  });
};

exports.initServer = (req, res) => {
  let serverId = req.serverId;
  if (!serverId) {
    res({
      success: false,
      message: `Aucun identifiant de serveur`,
    });
    return;
  }
  let server = servers[serverId];

  if (!server) {
    res({
      success: false,
      message: `Le serveur n'existe pas`,
    });
    return;
  }

  server.reset();
  server.startGame();

  res({
    success: true,
    message: `Serveur initialisé`,
    data: server,
  });

  req.io.to(req.serverId).emit("server:update", servers[req.serverId]);
};

// leaveServer - Supprime un joueur d'un serveur
exports.leaveServer = (req, res) => {
  req.socket.leave(req.server.id);

  // Émet un événement pour mettre à jour la liste des serveurs pour tous les clients abonnés
  req.io.to("subscribe - server list").emit("subscribe - server list", servers);

  // Renvoie une réponse au joueur
  res({
    success: true,
    message: `${req.user.username} a quitté le serveur`,
    data: {
      server: servers[req.server.id],
    },
  });
};

// Démarre le jeu sur un serveur existant
exports.startGame = (req, res) => {
  const server = servers.find((s) => s.id === parseInt(req.serverId));

  // Vérifie si le serveur existe et si il y a suffisamment de joueurs
  if (!server || server.players.length < 2) {
    return res({
      success: false,
      message: `Serveur introuvable ou pas assez de joueurs`,
    });
  }

  // Émet un événement pour mettre à jour la liste des serveurs pour tous les clients abonnés
  req.io.to("subscribe - server list").emit("subscribe - server list", servers);

  // Renvoie une réponse au créateur du serveur
  res({
    success: true,
    message: `La partie commence pour le serveur ${server.id}`,
  });
};

exports.playerAction = (req, res) => {
  const { card } = req;
  console.log(req);
  const server = servers[req.serverId];
  const { players } = server;
  const playerId = req.user.id;
  const player = players[playerId];

  if (!card) {
    console.log("playerAction : Aucune carte sélectionnée");
    return res({
      success: false,
      message: "Aucune carte sélectionnée",
    });
  }

  // Gestion des cartes de type "attaque"
  if (card.type === "attaque") {
    console.log("playerAction : Carte attaque");

    // Vérifie si un joueur a été ciblé pour l'attaque
    if (req.attackedPlayerId) {
      const attackedPlayer = players[req.attackedPlayerId];

      // Vérifie si le joueur ciblé existe
      if (!attackedPlayer) {
        return res({
          success: false,
          message: "Joueur ciblé non trouvé",
        });
      }

      // Vérifie si le joueur ciblé peut être attaqué
      const bonusProtectionMap = {
        feurouge: attackedPlayer.bonus.vehiculeprioritaire,
        crevaison: attackedPlayer.bonus.increvable,
        accident: attackedPlayer.bonus.asduvolant,
        pannedessence: attackedPlayer.bonus.citerne,
        limitedevitesse: attackedPlayer.bonus.vehiculeprioritaire,
      };

      const isProtectedByBonus = bonusProtectionMap[card.tag];
      const hasBlockingState =
        card.tag === "limitedevitesse"
          ? attackedPlayer.states.limitedevitesse
          : ["accident", "crevaison", "feurouge", "pannedessence"].some(
              (state) => attackedPlayer.states[state]
            );

      // Vérifie si le joueur ciblé est protégé
      if (isProtectedByBonus || hasBlockingState) {
        return res({
          success: false,
          message: `Le joueur ${attackedPlayer.username} est protégé et ne peut pas être attaqué`,
        });
      }

      // Applique l'effet de l'attaque sur le joueur ciblé
      attackedPlayer.states[card.tag] = true;
      servers[req.serverId].updatePlayer(attackedPlayer.id, attackedPlayer);
      servers[req.serverId].removeCard(playerId, card.id);
      servers[req.serverId].drawCard(playerId);
      servers[req.serverId].nextPlayer();
      res({
        success: true,
        message: `L'attaque a réussi contre ${attackedPlayer.username}`,
        data: { actionState: true },
      });
      return req.io
        .to(req.serverId)
        .emit("game:next-round", servers[req.serverId]);
    }

    // Si aucun joueur n'a été ciblé, retourner la liste des joueurs pouvant être attaqués
    const attackablePlayers = Object.values(players).filter((plr) => {
      if (Number(plr.id) === Number(playerId)) {
        return false; // Exclut le joueur lui-même
      }

      const bonusProtectionMap = {
        feurouge: plr.bonus.vehiculeprioritaire,
        crevaison: plr.bonus.increvable,
        accident: plr.bonus.asduvolant,
        pannedessence: plr.bonus.citerne,
        limitedevitesse: plr.bonus.vehiculeprioritaire,
      };

      const isProtectedByBonus = bonusProtectionMap[card.tag];
      const hasBlockingState =
        card.tag === "limitedevitesse"
          ? plr.states.limitedevitesse
          : ["accident", "crevaison", "feurouge", "pannedessence"].some(
              (state) => plr.states[state]
            );

      return !isProtectedByBonus && !hasBlockingState;
    });

    if (attackablePlayers.length === 0) {
      return res({
        success: true,
        message: "Aucun joueur ne peut être attaqué",
        data: { actionState: false },
      });
    }

    return res({
      success: true,
      message: "Liste des joueurs pouvant être attaqués",
      data: { actionState: true, attackablePlayers: attackablePlayers },
    });
  }

  // Gestion des cartes de type "parade"
  if (card.type === "parade") {
    // État requis pour appliquer chaque carte parade
    const requiredMalusState = {
      feuvert: player.states.feurouge,
      findelimitedevitesse: player.states.limitedevitesse,
      essence: player.states.pannedessence,
      reparation: player.states.accident,
      rouedesecours: player.states.crevaison,
    };

    if (!requiredMalusState[card.tag]) {
      return res({
        success: true,
        message: `Action impossible : aucun malus "${card.name}" à annuler`,
        data: { actionState: false },
      });
    }

    const blockingConditions = {
      feuvert: {
        condition: player.bonus.vehiculeprioritaire,
        message: `Action impossible, vous avez déjà le bonus "Véhicule prioritaire"`,
      },
      findelimitedevitesse: {
        condition: player.bonus.vehiculeprioritaire,
        message: `Action impossible, vous avez déjà le bonus "Véhicule prioritaire"`,
      },
      essence: {
        condition: player.bonus.citerne,
        message: `Action impossible, vous avez déjà la carte "Citerne"`,
      },
      reparation: {
        condition: player.bonus.asduvolant,
        message: `Action impossible, vous avez déjà la carte "As du volant"`,
      },
      rouedesecours: {
        condition: player.bonus.increvable,
        message: `Action impossible, vous avez déjà la carte "Increvable"`,
      },
    };

    const blockCondition = blockingConditions[card.tag];

    if (blockCondition?.condition) {
      return res({
        success: true,
        message: blockCondition.message,
        data: { actionState: false },
      });
    }

    switch (card.tag) {
      case "feuvert":
        player.states.feurouge = false;
        break;
      case "findelimitedevitesse":
        player.states.limitedevitesse = false;
        break;
      case "essence":
        player.states.pannedessence = false;
        break;
      case "reparation":
        player.states.accident = false;
        break;
      case "rouedesecours":
        player.states.crevaison = false;
        break;
      default:
        break;
    }

    servers[req.serverId].updatePlayer(playerId, player);
    servers[req.serverId].removeCard(playerId, card.id);
    servers[req.serverId].drawCard(playerId);
    servers[req.serverId].nextPlayer();
    res({
      success: true,
      message: `La carte parade est appliquée`,
      data: { actionState: true },
    });
    return req.io
      .to(req.serverId)
      .emit("game:next-round", servers[req.serverId]);
  }

  // Gestion des cartes de type "borne"
  if (card.type === "borne") {
    console.log("playerAction : Carte borne");

    const updatedScore = player.score + card.value;

    if (
      player.states.feurouge ||
      player.states.accident ||
      player.states.crevaison ||
      player.states.pannedessence
    ) {
      return res({
        success: true,
        message: `Vous avez un malus bloquant`,
        data: { actionState: false },
      });
    }

    if (player.states.limitedevitesse && card.value > 50) {
      return res({
        success: true,
        message: `Vous êtes limité à 50 points`,
        data: { actionState: false },
      });
    }

    if (updatedScore > 1000) {
      return res({
        success: true,
        message: `Vous avez dépassé 1000 kms`,
        data: { actionState: false },
      });
    } else {
      player.score = updatedScore;
      console.log("serv", servers[req.serverId]);

      servers[req.serverId].updatePlayer(playerId, player);
      servers[req.serverId].removeCard(playerId, card.id);
      servers[req.serverId].drawCard(playerId);
      servers[req.serverId].nextPlayer();
      res({
        success: true,
        message: `Ajout de ${card.value} kms`,
        data: { actionState: true },
      });
      return req.io
        .to(req.serverId)
        .emit("game:next-round", servers[req.serverId]);
    }
  }

  // Gestion des cartes de type "bonus"
  if (card.type === "bonus") {
    console.log("playerAction : Carte bonus");

    // Mise à jour du bonus et des états correspondants
    switch (card.tag) {
      case "asduvolant":
        player.bonus.asduvolant = true; // Ajoute le bonus "As du volant"
        player.states.accident = false; // Annule le malus "accident" si ce bonus est appliqué
        break;
      case "vehiculeprioritaire":
        player.bonus.vehiculeprioritaire = true; // Ajoute le bonus "Véhicule prioritaire"
        player.states.feurouge = false; // Annule le malus "feu rouge" si ce bonus est appliqué
        player.states.limitedevitesse = false; // Annule le malus "limite de vitesse" si ce bonus est appliqué
        break;
      case "citerne":
        player.bonus.citerne = true; // Ajoute le bonus "Citerne"
        player.states.pannedessence = false; // Annule le malus "panne d'essence" si ce bonus est appliqué
        break;
      case "increvable":
        player.bonus.increvable = true; // Ajoute le bonus "Increvable"
        player.states.crevaison = false; // Annule le malus "crevaison" si ce bonus est appliqué
        break;
      default:
        break;
    }

    // Mettre à jour les bonus et les états sur le serveur
    console.log("serv", servers[req.serverId]);
    servers[req.serverId].updatePlayer(playerId, player);
    servers[req.serverId].removeCard(playerId, card.id);
    servers[req.serverId].drawCard(playerId);
    servers[req.serverId].nextPlayer();
    res({
      success: true,
      message: `Bonus ajouté.`,
      data: { actionState: true },
    });
    return req.io
      .to(req.serverId)
      .emit("game:next-round", servers[req.serverId]);
  }

  // Gestion d'un type de carte inconnu
  console.log("playerAction : Type de carte inconnu");

  return res({
    success: false,
    message: "Type de carte non géré",
  });
};

exports.removeCard = (req, res) => {
  const { card } = req;
  const playerId = req.user.id;
  servers[req.serverId].removeCard(playerId, card.id);
  servers[req.serverId].drawCard(playerId);
  servers[req.serverId].nextPlayer();
  return req.io.to(req.serverId).emit("game:next-round", servers[req.serverId]);
};
