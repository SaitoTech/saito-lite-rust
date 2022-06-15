
    this.importFaction('faction3', {
      id		:	"faction3" ,
      key		: 	"france",
      name		: 	"French",
      nickname		: 	"French",
      capitals          :       ["paris"],
      img		:	"france.png",
      cards_bonus	:	1,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (state.leaders_francis_i == 1) { base += 1; }
        if (state.leaders_henry_ii == 1) { base += 1; }

        return base;

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("france");
        let base = this.vp; 
       
        switch (kc) {
          case 1: { base = 1; break; }
          case 2: { base = 1; break; }
          case 3: { base = 1; break; }
          case 4: { base = 2; break; }
          case 5: { base = 2; break; }
          case 6: { base = 3; break; }
          case 7: { base = 3; break; }
          case 8: { base = 4; break; }
          case 9: { base = 4; break; }
          case 10: { base = 5; break; }
          case 11: { base = 6; break; }
          case 12: { base = 6; break; }
          default: { base = 0; break; }
        }

        // bonuses based on leaders
        if (state.leaders_francis_i == 1) { base += 1; }        
        if (state.leaders_henry_ii == 1) { base += 0; }        

        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateVictoryPoints  : function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("france");
        let base = 0;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 4; break; }
          case 3: { base += 6; break; }
          case 4: { base += 8; break; }
          case 5: { base += 10; break; }
          case 6: { base += 12; break; }
          case 7: { base += 14; break; }
          case 8: { base += 16; break; }
          case 9: { base += 18; break; }
          case 10: { base += 20; break; }
        } 
        
        return base;
        
      },
    });
 


