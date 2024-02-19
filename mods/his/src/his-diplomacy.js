
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









