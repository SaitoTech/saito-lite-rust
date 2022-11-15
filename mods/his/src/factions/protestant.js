
    this.importFaction('faction6', {
      id		:	"faction6" ,
      key		: 	"protestant",
      name		: 	"Protestants",
      nickname		: 	"Protestants",
      capitals		:	[] ,
      img		:	"protestant.png",
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
        
        let base = this.vp;

	// 2 VP for every electorate that is under Protesant religious + political control
        base += (2 * game_mod.returnNumberOfElectoratesControlledByProtestants());        

        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        return this.special_vp;
      },
    });
 


