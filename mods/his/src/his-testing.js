
  addCard(faction, card) {
    let p = this.returnPlayerOfFaction(faction);
    if (p) {
      for (let z = 0; z < this.game.state.players_info[p-1].factions.length; z++) {
	if (this.game.state.players_info[p-1].factions[z] == faction) {
	  if (this.game.player == p) {
  	    this.game.deck[0].fhand[z].push(card);
	  }
	}
      }
    }
  }


