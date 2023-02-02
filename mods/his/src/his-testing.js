
  addCard(faction, card) {

    let p = this.returnPlayerOfFaction(faction);
    if (p) {

console.log("PLAYER OF FACTION: " + faction);
console.log(p);
 
      for (let z = 0; z < this.game.state.players_info[p-1].factions.length; z++) {
	if (this.game.state.players_info[p-1].factions[z] == faction) {
console.log("FACTION IS FHAND: " + z);
	  if (this.game.player == p) {
console.log("DECK FHAND IS: " + JSON.stringify(this.game.deck[0].fhand));
  	    this.game.deck[0].fhand[z].push(card);
	  }
	}
      }
     
    }
  }


