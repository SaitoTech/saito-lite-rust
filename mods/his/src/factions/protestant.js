
    this.importFaction('faction6', {
      id		:	"faction6" ,
      key		: 	"protestant",
      name		: 	"Protestants",
      nickname		: 	"Protestants",
      capitals		:	[] ,
      img		:	"protestant.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
	let base = 4; 
        let kc = game_mod.returnNumberOfElectoratesControlledByProtestants(1); // 1 = political control
        if (kc > 4) { base += 1; }
        if (game_mod.game.state.leaders.luther == 1) { base += 0; }
	base += game_mod.game.state.protestant_card_bonus;
	return base;
      },

      returnAdminRating  :       function(game_mod) {
	if (game_mod.game.state.leaders.luther == 1) { return 2; }
	if (game_mod.game.state.leaders.calvin == 1) { return 1; }
	return 0;
      },

      calculateBaseVictoryPoints  : function(game_mod) {
	// 2 VP for every electorate that is under Protesant religious + political control
        let base = 0;
        base += (2 * game_mod.returnNumberOfProtestantElectorates());        
        return base;
      },

      calculateBonusVictoryPoints  :    function(game_mod) {
	// + VP from disgraced papal debaters
	let bonus_vp_points = 0;
	bonus_vp_points += parseInt(game_mod.game.state.papal_debaters_disgraced_vp);
	bonus_vp_points += parseInt(game_mod.game.state.protestant_war_winner_vp);
        return bonus_vp_points;
      }
,
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
        let base = game_mod.returnProtestantSpacesTrackVictoryPoints().protestant;

	// burned papal debaters
	for (let i = 0; i < game_mod.game.state.burned.length; i++) {
	  let bd = game_mod.game.state.burned[i];
	  if (game_mod.debaters[bd]) {
	    if (game_mod.debaters[bd].faction == "papacy") {
	      base += game_mod.debaters[bd].power;
	    }
	  }
	}
	
	// 1 VP for each full bible translation
        if (game_mod.game.state.translations['full']['german'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['french'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['english'] == 10) { base++; }

        return base;
      },
    });
 


