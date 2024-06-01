
  returnDiplomacyMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Cancel",
      check : this.canPlayerCancel,
      fnct : this.playerCancel,
      img : "dove.jpeg" ,
    });
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
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Gain Territory",
      check : this.canPlayerGainTerritory,
      fnct : this.playerGainTerritory,
      img : "diplomacy.png" ,
    });
    menu.push({
      factions : ['england'],
      name : "Request Divorce",
      check : this.canPlayerRequestDivorce,
      fnct : this.playerRequestDivorce,
      img : "papal_decree.jpg" ,
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
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
      img : "mercenary.jpg" ,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Loan Squadrons",
      check : this.canPlayerLoanSquadrons,
      fnct : this.playerLoanSquadrons,
      img : "squadron.jpg" ,
    });

    return menu;

  }


  convertTermsToText(terms=[]) {

    let text = [];

    for (let i = 0; i < terms.length; i++) {

      let x = terms[i].split("\t");

      if (x[0] === "declare_peace" || x[0] === "end_war") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[2])} end their war`);
      }
      if (x[0] === "set_allies") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[2])} agree to ally`);
      }
      if (x[0] === "yield_cards" || x[0] === "pull_card") {
	text.push(`${this.returnFactionName(x[2])} offers ${this.returnFactionName(x[1])} a card`);
      }
      if (x[0] === "returns_captured" || x[0] === "ransom") {
	text.push(`${this.returnFactionName(x[1])} returns ${x[1]}`);
      }
      if (x[0] === "control" || x[0] === "yield_key") {
	text.push(`${this.returnFactionName(x[3])} yields ${this.returnSpaceName(x[2])} to ${this.returnFactionName(x[1])}`);
      }
      if (x[0] === "approve_divorce" || x[0] === "advance_henry_viii_marital_status") {
	text.push(`The Papacy approves Henry VIII's divorce`);
      }
      if (x[0] === "rescind_excommunication" || x[0] === "unexcommunicate_faction") {
	text.push(`Papacy rescinds ${this.returnFactionName(x[1])} excommunication`);
      }
      if (x[0] === "give_squadron" || x[0] === "loan_squadron") {
	if (!text.includes(`${this.returnFactionName(x[1])} offers ${this.returnFactionName(x[2])} ${x[3]} squadron(s)`)) {
	  text.push(`${this.returnFactionName(x[1])} offers ${this.returnFactionName(x[2])} ${x[3]} squadron(s)`);
	}
      }
      if (x[0] === "offer_mercenaries" || x[0] === "give_mercenaries") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnFactionName(x[2])} ${x[3]} mercenaries`);
      }
    }

    return text;
  }

  canPlayerCancel(his_self, player, faction) {
    return 1;
  }
  async playerCancel(his_self, faction, mycallback=null) {
    his_self.diplomacy_propose_overlay.render(faction);
    return 1;
  }




  canPlayerEndWar(his_self, player, faction) {
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    for (let i = 0; i < io.length; i++) {
      if (his_self.areEnemies(faction, io[i])) { 
	if (
	  !((faction == "papacy" && io[i] == "protestant") || (faction == "protestant" && io[i] == "papacy"))
	    && 
	  !((faction == "hapsburg" && io[i] == "protestant") || (faction == "protestant" && io[i] == "hapsburg"))
	) {
	  return 1;
	}
      }
    }
    return 0;
  }

  canPlayerFormAlliance(his_self, player, faction) {
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    for (let i = 0; i < io.length; i++) {
      let prohibited_alliance = false;
      if (faction == "papacy" && io[i] == "hapsburg" && his_self.game.state.henry_viii_pope_approves_divorce == 1) {
	prohibited_alliance = true;
      }
      if (faction == "papacy" && io[i] == "protestant") {
	prohibited_alliance = true;
      }
      if (faction == "protestant" && io[i] == "papacy") {
	prohibited_alliance = true;
      }
      if (faction == "hapsburg" && io[i] == "protestant") {
	prohibited_alliance = true;
      }
      if (faction == "protestant" && io[i] == "hapsburg") {
	prohibited_alliance = true;
      }
      if (faction == "papacy" && io[i] == "ottoman") {
	prohibited_alliance = true;
      }
      if (faction == "ottoman" && io[i] == "papacy") {
	prohibited_alliance = true;
      }
      if (faction == io[i]) {
	prohibited_alliance = true;
      }
      if (prohibited_alliance == false && !his_self.areAllies(faction, io[i]) && faction !== io[i]) { return 1; }
    }
    return 0;
  }

  canPlayerIssueCards(his_self, player, faction) {
    if (his_self.game.state.cards_issued[faction] < 2) { return 1; }
    return 0;
  }
  canPlayerPullCards(his_self, player, faction) {
    return 1;
  }

  canPlayerReturnCapturedArmyLeader(his_self, player, faction) {
    let p = his_self.returnPlayerCommandingFaction(faction);
    for (let z = 0; z  < his_self.game.state.players_info[p-1].captured.length; z++) { 
      if (faction == his_self.game.state.players_info[p-1].capturing_faction) { return 1; }
    }
    return 0;
  }

  canPlayerYieldTerritory(his_self, player, faction) {
    let target_spaces = his_self.countSpacesWithFilter(
      function(space) { 
        if (space.political == faction || (space.political == "" && space.home == faction)) { return 1; }
      }
    );
    if (target_spaces) { return 1; }
    return 0;
  }

  canPlayerGainTerritory(his_self, player, faction) {
    return 1;
  }

  canPlayerRequestDivorce(his_self, player, faction) {
    if (faction == "england" && his_self.game.state.henry_viii_marital_status == 1) { return 1; }
    return 0;
  }

  canPlayerApproveDivorce(his_self, player, faction) {
    if (faction == "papacy" && his_self.game.state.henry_viii_marital_status == 1) { return 1; }
    return 0;
  }

  canPlayerRescindExcommunication(his_self, player, faction) {
    if (his_self.game.state.excommunicated_factions["france"] == 1) { return 1; }
    if (his_self.game.state.excommunicated_factions["england"] == 1) { return 1; }
    if (his_self.game.state.excommunicated_factions["hapsburg"] == 1) { return 1; }
    return 0;
  }

  canPlayerGiveMercenaries(his_self, player, faction) {
    for (let key in his_self.game.spaces) {
      if (his_self.game.spaces[key].units[faction].length > 0 && key != "persia" && key != "egypt" && key != "ireland") {
	for (let i = 0; i < his_self.game.spaces[key].units[faction].length; i++) {
	  if (his_self.game.spaces[key].units[faction][i].type === "mercenary") { return 1; }
        }
      }
    }
    return 0;
  }

  canPlayerLoanSquadrons(his_self, player, faction) {
    if (faction != "protestant") {
      for (let key in his_self.game.spaces) {
	let s = his_self.game.spaces[key];
	for (let z = 0; z < s.units[faction].length; z++) {
	  if (s.units[faction][z].type == "squadron") { return 1; }
	}
      }
    }
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

      his_self.updateStatus("submitted");
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
      let prohibited_alliance = false;
      if (faction == "papacy" && io[i] == "hapsburg" && his_self.game.state.henry_viii_pope_approves_divorce == 1) {
	prohibited_alliance = true;
      }
      if (faction == "papacy" && io[i] == "ottoman") {
	prohibited_alliance = true;
      }
      if (faction == "ottoman" && io[i] == "papacy") {
	prohibited_alliance = true;
      }
      if (faction == io[i]) {
	prohibited_alliance = true;
      }
      if (prohibited_alliance == false && !his_self.areAllies(faction, io[i])) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }
      his_self.updateStatus("submitted");

      mycallback([`set_allies\t${faction}\t${action2}`]);
      mycallback([`unset_enemies\t${faction}\t${action2}`]);

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
      his_self.updateStatus("submitted");

      his_self.game.state.cards_issued[faction] += 1;
      mycallback([`pull_card\t${action2}\t${faction}`,`NOTIFY\t${his_self.returnFactionName(action2)} pulls card from ${his_self.returnFactionName(faction)}`]);

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
	if (his_self.game.state.cards_issued[io[i]] < 2) {
          html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
        }
      }
    }
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let action2 = $(this).attr("id");
      if (mycallback == null) { return; }
      his_self.updateStatus("submitted");

      his_self.game.state.cards_issued[action2] += 1;
      mycallback([`pull_card\t${faction}\t${action2}`,`NOTIFY\t${his_self.returnFactionName(faction)} pulls card from ${his_self.returnFactionName(action2)}`]);

    });

    return 0;
  }

  async playerReturnCapturedArmyLeader(his_self, faction, mycallback=null) {

    let terms = [];

    let p = his_self.returnPlayerCommandingFaction(faction);
    let msg = `${his_self.returnFactionName(faction)} - Return which Leader? `;
    let html = '<ul>';
    for (let i = 0; i < his_self.game.state.players_info[p-1].captured.length; i++) {
      let u = his_self.game.state.players_info[p-1].captured[i];
      if (u.capturing_faction == faction) {
        html += `<li class="option" id="${u}">${u}</li>`;
      }
    }
    html += '</ul>';
      
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      let give_which_leader = $(this).attr("id");
      if (mycallback == null) { return; }
      his_self.updateStatus("submitted");
      mycallback([`ransom\t${give_which_leader}\t${faction}`]);
    });

    return 0;

  }


  async playerGainTerritory(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Gain Territory from Whom: `;
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

      let giving_faction = $(this).attr("id");

      his_self.winter_overlay.hide();

      his_self.playerSelectSpaceWithFilter(

        "Gain which Space?",
              
          function(space) {
            if (space.political === giving_faction || (space.home == giving_faction && space.political == "")) {
	      return 1;
	    }
	    return 0;
          },

          function(spacekey) {
            if (mycallback == null) { return; }
            his_self.updateStatus("submitted");
            mycallback([`evacuate\t${giving_faction}\t${spacekey}`,`control\t${faction}\t${spacekey}\t${giving_faction}`,`NOTIFY\t${his_self.returnFactionName(giving_faction)} yields ${his_self.returnSpaceName(spacekey)} to ${his_self.returnFactionName(faction)}`]);
            his_self.winter_overlay.render();
          },
          
          null,

          true

        );
    });
    return 0;
  }

  async playerYieldTerritory(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Yield Territory to Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (faction != io[i] && his_self.returnPlayerCommandingFaction(faction) != his_self.returnPlayerCommandingFaction(io[i])) {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let receiving_faction = $(this).attr("id");

      his_self.winter_overlay.hide();

      his_self.playerSelectSpaceWithFilter(

        "Yield which Space?",
              
          //
          // catholic spaces adjacent to protestant
          //
          function(space) {
            if (space.political === faction || (space.home == faction && space.political == "")) {
	      return 1;
	    }
	    return 0;
          },

          function(spacekey) {
            if (mycallback == null) { return; }
            his_self.updateStatus("submitted");
            mycallback([`evacuate\t${faction}\t${spacekey}`,`control\t${receiving_faction}\t${spacekey}\t${faction}`,`NOTIFY\t${his_self.returnFactionName(faction)} yields ${his_self.returnSpaceName(spacekey)} to ${his_self.returnFactionName(receiving_faction)}`]);
            his_self.winter_overlay.render();
          },
          
          null,

          true

        );
    });
    return 0;
  }

  async playerRequestDivorce(his_self, faction, mycallback) {
    mycallback([`advance_henry_viii_marital_status`,`SETVAR\tstate\thenry_viii_pope_approves_divorce\t1`, `NOTIFY\tThe Papacy accedes to Henry VIII's request for a divorce.`]);
    return 0;
  }

  async playerApproveDivorce(his_self, faction, mycallback) {
    mycallback([`advance_henry_viii_marital_status`,`SETVAR\tstate\thenry_viii_pope_approves_divorce\t1`, `NOTIFY\tThe Papacy accedes to Henry VIII's request for a divorce.`]);
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
      his_self.updateStatus("submitted");
      mycallback([`unexcommunicate_faction\t${beneficiary}`,`NOTIFY\tThe Papacy rescinds the excommunication of ${his_self.returnFactionName(beneficiary)}`]);

    });
    return 0;
  }




  async playerGiveMercenaries(his_self, faction, mycallback=null) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Give Mercenaries to Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (!his_self.areAllies(faction, io[i]) && faction != io[i] && io[i] != "ottoman") {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let target_faction = $(this).attr("id");
      $('.option').off();
      his_self.updateStatus("submitted");
      let num = 0;
      for (let key in his_self.game.spaces) {
	let s = his_self.game.spaces[key];
	for (let i = 0; i < s.units[faction].length; i++) {
	  let u = s.units[faction][i];
	  if (u.type == "mercenary") { num++; }
	}
      }
      if (mycallback == null) { return; }

      msg = `${his_self.returnFactionName(faction)} - How Many Mercenaries? `;
      html = '<ul>';
      for (let i = 1; i <= num && i <= 4; i++) {
        html += `<li class="option" id="${i}">${i}</li>`;
      }
      html += '</ul>';
      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let target_number = parseInt($(this).attr("id"));
        $('.option').off();

        his_self.updateStatus("submitted");
        mycallback([`place_mercenaries\t${faction}\t${target_faction}\t${target_number}`,`give_mercenaries\t${faction}\t${target_faction}\t${target_number}`]);

      });
    });

    return 0;
  }

  async playerLoanSquadrons(his_self, faction, mycallback) {

    let terms = [];

    let msg = `${his_self.returnFactionName(faction)} - Give Squadrons to Whom: `;
    let io = his_self.returnDiplomacyImpulseOrder(faction);
    let html = '<ul>';
    for (let i = 0; i < io.length; i++) {
      if (!his_self.areAllies(faction, io[i]) && faction != io[i] && io[i] != "protestant") {
        html += `<li class="option" id="${io[i]}">${his_self.returnFactionName(io[i])}</li>`;
      }
    }
    html += '</ul>';
    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let target_faction = $(this).attr("id");
      his_self.updateStatus("submitted");
      $('.option').off();
      let num = 0;
      for (let key in his_self.game.spaces) {
	let s = his_self.game.spaces[key];
	for (let i = 0; i < s.units[faction].length; i++) {
	  let u = s.units[faction][i];
	  if (u.type == "squadron") { num++; }
	}
      }
      if (mycallback == null) { return; }

      msg = `${his_self.returnFactionName(faction)} - How Many Squadrons? `;
      html = '<ul>';
      for (let i = 1; i <= num && i <= 4; i++) {
        html += `<li class="option" id="${i}">${i}</li>`;
      }
      html += '</ul>';
      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let target_number = parseInt($(this).attr("id"));
        $('.option').off();

	let instructions = [];
        his_self.updateStatus("submitted");

	for (let z = 0; z < target_number; z++) {
	  instructions.push(`give_squadron\t${faction}\t${target_faction}\t${target_number}`);
	}
        mycallback(instructions);
      });
    });

    return 0;
  }









