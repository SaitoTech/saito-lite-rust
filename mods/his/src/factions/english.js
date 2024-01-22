
    this.importFaction('faction2', {
      id		:	"faction2" ,
      key		:	"england" ,
      name		: 	"England",
      nickname		: 	"England",
      img		:	"england.png",
      admin_rating	:	1,
      capitals		:	["london"],
      cards_bonus	:	1,
      marital_status    :       0,
      returnAdminRating  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.henry_viii == 1) { base += 1; }
        if (game_mod.game.state.leaders.edward_vi == 1) { base += 1; }
        if (game_mod.game.state.leaders.mary_i == 1) { base += 1; }
        if (game_mod.game.state.leaders.elizabeth_i == 1) { base += 2; }

        return base;

      },
      returnCardsDealt  :	function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;

	switch (kc) {
	  case 1: { base = 1; break; }
	  case 2: { base = 1; break; }
	  case 3: { base = 2; break; }
	  case 4: { base = 2; break; }
	  case 5: { base = 3; break; }
	  case 6: { base = 3; break; }
	  case 7: { base = 4; break; }
	  case 8: { base = 4; break; }
	  case 9: { base = 5; break; }
	  case 10: { base = 5; break; }
	  case 11: { base = 6; break; }
	  case 12: { base = 6; break; }
	  default: { base = 1; break; }
	}

	// bonuses based on leaders
	if (game_mod.game.state.leaders.henry_viii == 1) { base += 1; }
	if (game_mod.game.state.leaders.edward_vi == 1) { base += 0; }
	if (game_mod.game.state.leaders.mary_i == 1) { base += 0; }
	if (game_mod.game.state.leaders.elizabeth_i == 1) { base += 2; }

	// TODO - bonus for home spaces under protestant control
	return base;

      },
      calculateBonusVictoryPoints  :	function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :	function(game_mod) {
        return this.special_vp;
      },
      calculateBaseVictoryPoints  :	function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = this.vp;

	switch (kc) {
	  case 1: { base += 3; break; }
	  case 2: { base += 5; break; }
	  case 3: { base += 7; break; }
	  case 4: { base += 9; break; }
	  case 5: { base += 11; break; }
	  case 6: { base += 13; break; }
	  case 7: { base += 15; break; }
	  case 8: { base += 17; break; }
	  default: { base += 17; break; }
	}

	return base;

      },
    });
 

