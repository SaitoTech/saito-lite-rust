
  returnDiplomacyMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "End War",
      check : this.canPlayerEndWar,
      fnct : this.playerEndWar,
      img : "dove.jpeg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerFormAlliance,
      fnct : this.playerFormAlliance,
      img : "treaty.jpeg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Random Card",
      check : this.canPlayerIssueCards,
      fnct : this.playerIssueCards,
      img : "the-card-players.jpg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Get Random Card",
      check : this.canPlayerPullCards,
      fnct : this.playerPullCards,
      img : "the-card-players.jpg" ,
    });
/****
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Loan Squadrons",
      check : this.canPlayerLoanSquadrons,
      fnct : this.playerLoanSquadrons,
      img : "squadron.jpg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Return Captured Leader",
      check : this.canPlayerReturnCapturedArmyLeader,
      fnct : this.playerReturnCapturedArmyLeader,
      img : "prison.jpg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Yield Territory",
      check : this.canPlayerYieldTerritory,
      fnct : this.playerYieldTerritory,
      img : "diplomacy.png" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
      img : "mercenary.jpg" ,
    });
    menu.push({
      factions : ['papacy'],
      name : "Approve Divorce",
      check : this.canPlayerApproveDivorce,
      fnct : this.playerApproveDivorce,
      img : "papal_decree.jpg" ,
    });
    menu.push({
      factions : ['papacy'],
      name : "Rescind Excommunication",
      check : this.canPlayerRescindExcommunication,
      fnct : this.playerRescindExcommunication,
      img : "excommunication.jpg" ,
    });
***/

    return menu;

  }


  convertTermsToText(terms=[]) {

    let text = [];

    for (let i = 0; i < terms.length; i++) {

      let x = terms[i].split("\t");

      if (x[0] === "declare_peace" || x[0] === "end_war") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[2])} end their war.`);
      }
      if (x[0] === "set_allies") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[2])} agree to ally.`);
      }
      if (x[0] === "yield_cards" || x[0] === "pull_card") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnFactionName(x[2])} a card.`);
      }
      if (x[0] === "squadron_loan") {
	text.push(`${this.returnFactionName(x[1])} loans ${this.returnFactionName(x[1])} ${x[3]} squadron(s).`);
      }
      if (x[0] === "returns_captured") {
	text.push(`${this.returnFactionName(x[1])} returns ${x[1]}.`);
      }
      if (x[0] === "offer_mercenaries") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnSpaceName(x[2])} ${x[3]} mercenaries.`);
      }
      if (x[0] === "yield_key") {
	text.push(`${this.returnFactionName(x[1])} yields ${this.returnSpaceName(x[3])} to ${this.returnFactionName(x[2])}.`);
      }
      if (x[0] === "approve_divorce") {
	text.push(`${this.returnFactionName(x[1])} approves Henry VIII divorce.`);
      }
      if (x[0] === "rescind_excommunication") {
	text.push(`${this.returnFactionName(x[1])} rescinds ${this.returnFactionName(x[1])} excommunication.`);
      }
    }

    return text;
  }


  canPlayerEndWar(his_self, faction) {
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    for (let i = 0; i < io.length; i++) {
      if (his_self.areEnemies(faction, io[i])) { return 1; }
    }
    return 0;
  }

  canPlayerFormAlliance(his_self, faction) {
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    for (let i = 0; i < io.length; i++) {
      if (!his_self.areAllies(faction, io[i]) && faction !== io[i]) { return 1; }
    }
    return 0;
  }

  canPlayerIssueCards(his_self, faction) {
    return 1;
  }
  canPlayerPullCards(his_self, faction) {
    return 1;
  }

  // TODO - implement below
  canPlayerLoanSquadrons(his_self, f1, f2) {
    return 0;
  }

  canPlayerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  canPlayerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  canPlayerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  canPlayerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  canPlayerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }




  async playerEndWar(his_self, faction, mycallback=null) {

    let terms = [];
    let msg = `${his_self.returnFactionName(faction)} - End War with Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (his_self.areEnemies(faction, io[i]) && faction != io[i]) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }

      mycallback([`declare_peace\t${faction}\t${action2}`]);

    });

    return 0;
  }

  async playerFormAlliance(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Form Alliance with Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (!his_self.areAllies(faction, io[i]) && faction != io[i]) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }

      mycallback([`set_allies\t${faction}\t${action2}`]);

    });

    return 0;
  }

  async playerIssueCards(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Issue Random Card Draw to Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (faction != io[i]) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }

      mycallback([`pull_card\t${faction}\t${action2}`,`NOTIFY\t${his_self.returnFactionName(action2)} pulls card from ${his_self.returnFactionName(faction)}`]);

    });

    return 0;
  }

  async playerPullCards(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Pull Random Card from Whom? `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (faction != io[i]) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }

      mycallback([`pull_card\t${action2}\t${faction}`,`NOTIFY\t${his_self.returnFactionName(faction)} pulls card from ${his_self.returnFactionName(action2)}`]);

    });

    return 0;
  }

  async playerLoanSquadrons(his_self, f1, f2) {
    return 0;
  }

  async playerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  async playerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  async playerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  async playerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  async playerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }









