
    this.importFaction('faction5', {
      id		:	"faction5" ,
      key		: 	"ottoman",
      name		: 	"Ottoman Empire",
      nickname		: 	"Ottoman",
      capitals          :       ["istanbul"],
      img		:	"ottoman.png",
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 2; break; }
          case 2: { base = 2; break; }
          case 3: { base = 3; break; }
          case 4: { base = 3; break; }
          case 5: { base = 4; break; }
          case 6: { base = 4; break; }
          case 7: { base = 5; break; }
          case 8: { base = 5; break; }
          case 9: { base = 6; break; }
          case 10: { base = 6; break; }
          default: { base = 0; break; }
        }
        
        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("ottoman");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 2; break; }
          case 2: { base = 4; break; }
          case 3: { base = 6; break; }
          case 4: { base = 8; break; }
          case 5: { base = 10; break; }
          case 6: { base = 12; break; }
          case 7: { base = 14; break; }
          case 8: { base = 16; break; }
          case 9: { base = 18; break; }
          case 10: { base = 20; break; }
        } 
        
        return base;

      },

    });
 


