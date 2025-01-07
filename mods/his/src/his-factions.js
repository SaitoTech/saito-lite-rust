
  returnArrayOfFactionsInSpace(spacekey="") {
    return this.returnArrayOfFactionsInSpacekey(spacekey);
  }
  returnArrayOfFactionsInSpacekey(spacekey="") {
    let res = [];
    let s = this.game.spaces[spacekey];
    if (s) {
      for (let f in s.units) {
	if (s.units[f].length > 0) { res.push(f); }
      }
    };
    return res;
  }

  isPlayerControlledFaction(faction="") {
    if (faction === "") { return false; }
    if (this.isAlliedMinorPower(faction)) { return true; }
    if (this.isMajorPower(faction)) { return true; }
    return false;
  }

  returnFactionAdminRating(faction="") {
    if (this.factions[faction]) {
      return this.factions[faction].returnAdminRating(this);
    }
    return 0;
  }
 
  returnFactionName(f) {
    if (f == "france") { return "France"; }
    if (f == "ottoman") { return "Ottoman"; }
    if (f == "hapsburg") { return "Hapsburg"; }
    if (f == "england") { return "England"; }
    if (f == "papacy") { return "Papacy"; }
    if (f == "protestant") { return "Protestant"; }
    if (f == "venice") { return "Venice"; }
    if (f == "scotland") { return "Scotland"; }
    if (f == "hungary") { return "Hungary"; }
    if (f == "genoa") { return "Genoa"; }
    if (f == "independent") { return "Independent"; }
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
    if (obj.cards == null)		{ obj.cards = 0; }
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
    if (obj.faction == null)		{ obj.faction = name; }
    if (obj.passed == null)		{ obj.passed = false; }
    if (obj.calculateBaseVictoryPoints == null) {
      obj.calculateBaseVictoryPoints = function() { return 0; }
    }
    if (obj.calculateBonusVictoryPoints == null) {
      obj.calculateBonusVictoryPoints = function() { return 0; }
    }
    if (obj.returnAdminRating == null) {
      obj.returnAdminRating = function(game_mod) { return this.admin_rating; }
    }
    if (obj.calculateSpecialVictoryPoints == null) {
      obj.calculateSpecialVictoryPoints = function() { return 0; }
    }
    if (obj.returnFactionSheet == null) {
      obj.returnFactionSheet = function(faction) {
        return `
	  <div class="faction_sheet" id="faction_sheet" style="background-image: url('/his/img/factions/${obj.img}')">
	    <div class="faction_sheet_ruler" id="faction_sheet_ruler"></div>
	    <div class="faction_sheet_vp" id="faction_sheet_vp"></div>
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


  returnControlledCapitals(faction) {
    let x = this.returnCapitals(faction);
    for (let i = 0; i < x.length; i++) {
      if (!this.isSpaceControlled(x[i], faction)) {
	x.splice(i, 1);
	i--;
      }
    }
    return x;
  }

  returnCapitals(faction) {
    let x = [];
    if (this.factions[faction]) {
      for (let i = 0; i < this.factions[faction].capitals.length; i++) {
        x.push(this.factions[faction].capitals[i]);
      }
    }
    return x;
  }

  returnFactionHandIdx(player, faction) {
    for (let i = 0; i < this.game.state.players_info[player-1].factions.length; i++) {
      if (this.game.state.players_info[player-1].factions[i] === faction) {
	return i;
      }
    }
    return -1;
  }



