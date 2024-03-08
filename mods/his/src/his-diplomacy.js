
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
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
      img : "mercenary.jpg" ,
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
      if (x[0] === "returns_captured" || x[0] === "ransom") {
	text.push(`${this.returnFactionName(x[1])} returns ${x[1]}.`);
      }
      if (x[0] === "control" || x[0] === "yield_key") {
	text.push(`${this.returnFactionName(x[1])} yields ${this.returnSpaceName(x[3])} to ${this.returnFactionName(x[2])}.`);
      }
      if (x[0] === "approve_divorce" || x[0] === "advance_henry_viii_marital_status") {
	text.push(`${this.returnFactionName(x[1])} approves Henry VIII divorce.`);
      }
      if (x[0] === "rescind_excommunication" || x[0] === "unexcommunicate_faction") {
	text.push(`Papacy rescinds ${this.returnFactionName(x[1])} excommunication.`);
      }
      if (x[0] === "offer_mercenaries") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnSpaceName(x[2])} ${x[3]} mercenaries.`);
      }
      if (x[0] === "squadron_loan") {
	text.push(`${this.returnFactionName(x[1])} loans ${this.returnFactionName(x[1])} ${x[3]} squadron(s).`);
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

  canPlayerReturnCapturedArmyLeader(his_self, faction) {
    let p = his_self.returnPlayerCommandingFaction(faction);
    if (his_self.game.state.players_info[p].captured.length > 0) { return 1; }
    return 0;
  }

  canPlayerYieldTerritory(his_self, faction) {
    let target_spaces = his_self.countSpacesWithFilter(
      function(space) { 
        if (space.political == faction || (space.political == "" && space.home == faction)) { return 1; }
      }
    );
    if (target_spaces) { return 1; }
    return 0;
  }

  canPlayerApproveDivorce(his_self, faction) {
    if (his_self.game.state.henry_viii_marital_status == 1) { return 1; }
    return 0;
  }

  canPlayerRescindExcommunication(his_self, faction) {
    if (his_self.game.state.excommunicated_factions["france"] == 1) { return 1; }
    if (his_self.game.state.excommunicated_factions["england"] == 1) { return 1; }
    if (his_self.game.state.excommunicated_factions["hapsburg"] == 1) { return 1; }
    return 0;
  }

  canPlayerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  canPlayerLoanSquadrons(his_self, f1, f2) {
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
    html += '</ul>';
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
    html += '</ul>';
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
    html += '</ul>';
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

  async playerReturnCapturedArmyLeader(his_self, faction, mycallback=null) {

    let terms = [];

    let p = his_self.returnPlayerCommandingFaction(faction);
    let msg = `${his_self.returnFactionName(faction)} - Return which Leader? `;
    let html = '<ul>';
    for (let i = 0; i < his_self.game.state.players_info[p].captured.length; i++) {
      let u = his_self.game.state.players_info[p].captured[i];
      html += `<li class="option" id="${u}">${u}</li>`;
    }
    html += '</ul>';
      
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      let give_which_leader = $(this).attr("id");
      if (mycallback == null) { return; }
      mycallback([`ransom\t${give_which_leader}\t${faction}`]);
    });

    return 0;

  }


  async playerYieldTerritory(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Yield Territory to Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (faction != io[i]) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let receiving_faction = $(this).attr("id");

      this.playerSelectSpaceWithFilter(

        "Yield which Space?",
              
          //
          // catholic spaces adjacent to protestant
          //
          function(space) {
            if (space.political === fact || (space.home == faction && space.political == "")) {
	      return 1;
	    }
	    return 0;
          },

          function(spacekey) {
            if (mycallback == null) { return; }
            mycallback([`control\t${receiving_faction}\t${spacekey}\t${faction}`,`NOTIFY\t${his_self.returnFactionName(faction)} yields ${his_self.returnSpaceName(spacekey)} to ${his_self.returnFactionName(receiving_faction)}`]);
          },
          
          null,

          true

        );
    });
    return 0;
  }

  async playerApproveDivorce(his_self, faction, mycallback) {
    mycallback([`advance_henry_viii_marital_status`,`NOTIFY\tThe Papacy accedes to Henry VIII's request for a divorce.`]);
    return 0;
  }

  async playerRescindExcommunication(his_self, faction, mycallback) {

    let msg = `Rescind Excommunication of Whom: `;
    let html = '<ul>';
    if (his_self.game.state.excommunicated_factions["france"] == 1) {
      html += `<li class="option" id="france">France</li>`;
    }
    if (his_self.game.state.excommunicated_factions["england"] == 1) {
      html += `<li class="option" id="england">England</li>`;
    }
    if (his_self.game.state.excommunicated_factions["hapsburg"] == 1) {
      html += `<li class="option" id="hapsburg">Hapsburg</li>`;
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let beneficiary = $(this).attr("id");
      mycallback([`unexcommunicate_faction\t${beneficiary}`,`NOTIFY\tThe Papacy rescinds the excommunication of ${his_self.returnFactionName(beneficiary)}`]);

    });
    return 0;
  }




  async playerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  async playerLoanSquadrons(his_self, f1, f2) {
    return 0;
  }









