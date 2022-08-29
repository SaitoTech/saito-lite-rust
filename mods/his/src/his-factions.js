

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
    if (obj.cards_bonus == null)	{ obj.cards_bonus = 0; }
    if (obj.vp == null)			{ obj.vp = 0; }
    if (obj.allies == null)		{ obj.allies = []; }
    if (obj.minor_allies == null)	{ obj.minor_allies = []; }
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

  gainVP(faction, points) {
    for (let i = 0; i < this.game.players_info.length; i++) {
      for (let ii = 0; ii < this.game.players_info[i].factions.length; ii++) {
	if (faction === this.game.players_info[i].factions[ii]) {
          this.game.players_info[i].factions[ii].vp += points;
	  break;
        }
      }
    }
    return -1;
  }

  returnCapitals(faction) {
    for (let i = 0; i < this.game.players_info.length; i++) {
      for (let ii = 0; ii < this.game.players_info[i].factions.length; ii++) {
	if (faction === this.game.players_info[i].factions[ii]) {
          return this.factions[this.game.players_info[i].factions[ii]].capitals;
        }
      }
    }
    return [];
  }

  returnFactionHandIdx(player, faction) {
    for (let i = 0; i < this.game.players_info[player-1].factions.length; i++) {
      if (this.game.players_info[player-1].factions[i] === faction) {
	return i;
      }
    }
    return -1;
  }


