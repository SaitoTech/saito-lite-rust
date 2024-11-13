
    this.importFaction('faction4', {

      id		:	"faction4" ,
      key		: 	"papacy",
      name		: 	"Papacy",
      nickname		: 	"Papacy",
      capitals          :       ["rome"],
      img		:	"papacy.png",
      admin_rating	:	0,
      cards_bonus	:	0,
      returnAdminRating  :       function(game_mod) {
 
        let base = 0;

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 1; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 0; }

        return base; 

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("papacy");
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

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 0; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 1; }       

        base += game_mod.game.state.papacy_card_bonus;

        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("papacy");
        let base = this.vp;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 4; break; }
          case 3: { base += 6; break; }
          case 4: { base += 8; break; }
          case 5: { base += 10; break; }
          case 6: { base += 12; break; }
        } 
        
        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return 0;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
	let base = game_mod.returnProtestantSpacesTrackVictoryPoints().papacy;

        // burned protestant debaters
        for (let i = 0; i < game_mod.game.state.burned.length; i++) {
          let bd = game_mod.game.state.burned[i];
          if (game_mod.debaters[bd]) {
            if (game_mod.debaters[bd].faction == "protestant") {
              base += game_mod.debaters[bd].power;
            }
          }
        }

	// saint peters cathedral
 	base += game_mod.game.state.saint_peters_cathedral['vp'];

        return base;

      },
    });
 


