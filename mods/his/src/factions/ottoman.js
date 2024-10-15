
    this.importFaction('faction5', {
      id		:	"faction5" ,
      key		: 	"ottoman",
      name		: 	"Ottoman Empire",
      nickname		: 	"Ottoman",
      capitals          :       ["istanbul"],
      img		:	"ottoman.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnAdminRating  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.suleiman == 1) { base += 2; }

        return base;

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("ottoman");
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

        if (game_mod.game.state.leaders.suleiman == 1) { base += 0; }        
 
        base += game_mod.game.state.ottoman_card_bonus;
      
        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("ottoman");
        let base = this.vp;
        
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
      calculateBonusVictoryPoints  :    function(game_mod) {
        return 0;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        let base = 0;
	base += parseInt(game_mod.game.state.events.ottoman_piracy_vp);
        base += parseInt(game_mod.game.state.events.ottoman_julia_gonzaga_vp);
	return base;
      },
    });
 


