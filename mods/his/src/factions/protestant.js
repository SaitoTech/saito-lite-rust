
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

        let kc = game_mod.returnNumberOfElectoratesControlledByProtestants();
        if (kc > 4) { base += 1; }

        if (game_mod.game.state.leaders_martin_luther == 1) { base += 0; }

	return base;        

      },
      returnCardsSaved  :       function(game_mod) {

	let base = 2;
	return base; 
      
      },

      calculateBaseVictoryPoints  : function(game_mod) {
	// 2 VP for every electorate that is under Protesant religious + political control
        let base = 0;
        base += (2 * game_mod.returnNumberOfProtestantElectorates());        
        return base;
      },

      calculateBonusVictoryPoints  :    function(game_mod) {
	// + VP from disgraced papal debaters
        return game_mod.game.state.papal_debaters_disgraced_vp;
      }
,
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
        let base = game_mod.returnProtestantSpacesTrackVictoryPoints().protestant;

	// 1 VP for each full bible translation
        if (game_mod.game.state.translations['full']['german'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['french'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['english'] == 10) { base++; }

        return base;
      },
    });
 


