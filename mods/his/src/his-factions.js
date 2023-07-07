
  isPlayerControlledFaction(faction="") {
    if (faction === "") { return false; }
    if (this.isAlliedMinorPower(faction)) { return true; }
    if (this.isMajorPower(faction)) { return true; }
    return false;
  }

  returnFactionAdminRating(faction="") {
    if (this.factions[faction]) {
      return this.factions[faction].admin_rating;
    }
    return 0;
  }
 
  returnFactionName(f) {
    if (this.factions[f]) {
      return this.factions[f].name;
    }
    return "Unknown";
  }

  importFaction(name, obj) {

    if (obj.id == null)                 { obj.id = "faction"; }
    if (obj.name == null)               { obj.name = "Unknown Faction"; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.key == null)	        { obj.key = name; }
    if (obj.ruler == null)		{ obj.ruler = ""; }
    if (obj.capitals == null)	        { obj.capitals = []; }
    if (obj.admin_rating == null)	{ obj.admin_rating = 0; } // cards "holdable"
    if (obj.cards_bonus == null)	{ obj.cards_bonus = 0; }
    if (obj.vp == null)			{ obj.vp = 0; }
    if (obj.vp_base == null)		{ obj.vp_base = 0; }
    if (obj.vp_special == null)		{ obj.vp_special = 0; }
    if (obj.vp_bonus == null)		{ obj.vp_bonus = 0; }
    if (obj.allies == null)		{ obj.allies = []; }
    if (obj.minor_allies == null)	{ obj.minor_allies = []; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.passed == null)		{ obj.passed = false; }
    if (obj.calculateBaseVictoryPoints == null) {
      obj.calculateBaseVictoryPoints = function() { return 0; }
    }
    if (obj.calculateBonusVictoryPoints == null) {
      obj.calculateBonusVictoryPoints = function() { return 0; }
    }
    if (obj.calculateSpecialVictoryPoints == null) {
      obj.calculateSpecialVictoryPoints = function() { return 0; }
    }
    if (obj.returnFactionSheet == null) {
      obj.returnFactionSheet = function(faction) {
        return `
	  <div class="faction_sheet" id="faction_sheet" style="background-image: url('/his/img/factions/${obj.img}')">
	  </div>
	`;
      }
    }
    if (obj.returnCardsDealt == null) {
      obj.returnCardsDealt = function(faction) {
	return 1;
      }
    }

    obj = this.addEvents(obj);
    this.factions[obj.key] = obj;

  }

  gainVictoryPoints(faction, points, type="special") {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
	  if (type == "base") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_base += points;
	  }
	  if (type == "special") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_special += points;
	  }
	  if (type == "bonus") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_bonus += points;
	  }
	  break;
        }
      }
    }
    return -1;
  }

  returnCapitals(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
          return this.factions[this.game.state.players_info[i].factions[ii]].capitals;
        }
      }
    }
    return [];
  }

  returnFactionHandIdx(player, faction) {
    for (let i = 0; i < this.game.state.players_info[player-1].factions.length; i++) {
      if (this.game.state.players_info[player-1].factions[i] === faction) {
	return i;
      }
    }
    return -1;
  }



