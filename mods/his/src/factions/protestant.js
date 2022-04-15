
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

    });
 


