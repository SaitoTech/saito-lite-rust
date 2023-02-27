
  returnDiplomacyMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "End War",
      check : this.canPlayerEndWar,
      fnct : this.playerEndWar,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerFormAlliance,
      fnct : this.playerFormAlliance,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Loan Squadrons",
      check : this.canPlayerLoanSquadrons,
      fnct : this.playerLoanSquadrons,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerReturnCapturedArmyLeader,
      fnct : this.playerReturnCapturedArmyLeader,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Yield Territory",
      check : this.canPlayerYieldTerritory,
      fnct : this.playerYieldTerritory,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Issue Cards",
      check : this.canPlayerIssueCards,
      fnct : this.playerIssueCards,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
    });
    menu.push({
      factions : ['papacy'],
      name : "Give Mercenaries",
      check : this.canPlayerApproveDivorce,
      fnct : this.playerApproveDivorce,
    });
    menu.push({
      factions : ['papacy'],
      name : "Rescind Excommunication",
      check : this.canPlayerRescindExcommunication,
      fnct : this.playerRescindExcommunication,
    });

    return menu;

  }




  playerOfferAsFaction(faction) {

    let io = this.returnImpulseOrder();
    let html = `<ul>`;

    for (let i = io.length-1; i>= 0; i--) {
      for (let i = 0; i < pfactions.length; i++) {
        html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
      }
      html    += `</ul>`;
    }
 
    this.updateStatusWithOptions(`Offer Agreement to which faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.factionOfferFaction(faction, faction);
    });

  }


  factionOfferFaction(faction1, faction2) {

    let menu = this.returnDiplomacyMenuOptions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < menu.length; i++) {
      if (menu[i].check(this, faction1, faction2)) {
        for (let z = 0; z < menu[i].factions.length; z++) {
          if (menu[i].factions[z] === selected_faction) {
            if (menu[i].cost[z] <= ops) {
              html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
            }
            z = menu[i].factions.length+1;
          }
        }
      }
    }
    html    += `<li class="card" id="end_turn">end turn</li>`;
    html += '</ul>';

    this.updateStatusWithOptions(`Type of Agreement`, html);
    this.attachCardboxEvents(async (user_choice) => {

      if (user_choice === "end_turn") {
        this.endTurn();
        return;
      }

      menu[user_choice].fnct(this, faction1, faction2);
      return;
    });
  }






  playerOffer() {

    let his_self = this;
    let pfactions = this.returnPlayerFactions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < pfactions.length; i++) {
      html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Offer Agreement as which Faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.playerOfferAsFaction(faction);
    });

  }






  canPlayerEndWar(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  canPlayerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  canPlayerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  canPlayerIssueCards(his_self, f1, f2) {
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


  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  async playerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  async playerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  async playerIssueCards(his_self, f1, f2) {
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









