
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


  convertTermsToText(proposal_idx=0) {

    let proposal = this.game.state.diplomacy[proposal_idx];
    let text = [];

    for (let i = 0; i < proposal.terms.length; i++) {

      let x = proposal.terms[i].split("\t");

      if (x[0] === "end_war") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[1])} agree to peace.`);
      }
      if (x[0] === "alliance") {
	text.push(`${this.returnFactionName(x[1])} and ${this.returnFactionName(x[1])} agree to ally.`);
      }
      if (x[0] === "squadron_loan") {
	text.push(`${this.returnFactionName(x[1])} loans ${this.returnFactionName(x[1])} ${x[3]} squadron(s).`);
      }
      if (x[0] === "returns_captured") {
	text.push(`${this.returnFactionName(x[1])} returns ${x[1]}.`);
      }
      if (x[0] === "offer_mercenaries") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnSpaceName($x[2]) ${x[3]} mercenaries.`);
      }
      if (x[0] === "yield_key") {
	text.push(`${this.returnFactionName(x[1])} yields ${this.returnSpaceName($x[3]) to ${this.returnFactionName(x[2])}.`);
      }
      if (x[0] === "yield_cards") {
	text.push(`${this.returnFactionName(x[1])} offers ${this.returnSpaceName($x[2]) ${x[3]} card(s).`);
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


  canPlayerEndWar(his_self, f1, f2) {
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









