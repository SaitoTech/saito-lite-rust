
    this.importFaction('faction4', {
      id		:	"faction4" ,
      key		: 	"papacy",
      name		: 	"Papacy",
      nickname		: 	"Papacy",
      capitals          :       ["rome"],
      img		:	"papacy.png",
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 2; break; }
          case 2: { base = 3; break; }
          case 3: { base = 3; break; }
          case 4: { base = 4; break; }
          case 5: { base = 4; break; }
          case 6: { base = 4; break; }
          default: { base = 0; break; }
        }
        
        // TODO - bonus for home spaces under protestant control
        return base;

      },
    });
 


