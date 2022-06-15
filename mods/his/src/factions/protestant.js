
    this.importFaction('faction6', {
      id		:	"faction6" ,
      key		: 	"protestant",
      name		: 	"Protestant",
      nickname		: 	"Protestant",
      capitals		:	[] ,
      img		:	"protestant.png",
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfElectoratesControlledByProtestants();
        if (kc > 4) { return 5; }

	return 4;
        
      },
      calculateVictoryPoints  : function(game_mod) {
        
        let base = 0;

	// 2 VP for every electorate that is under Protesant religious + political control
        base += (2 * game_mod.returnNumberOfElectoratesControlledByProtestants());        

        return base;

      },
    });
 


