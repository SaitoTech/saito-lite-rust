
    this.importFaction('faction2', {
      id		:	"faction2" ,
      key		:	"england" ,
      name		: 	"English",
      nickname		: 	"English",
      img		:	"england.png",
      capitals		:	["london"],
      cards_bonus	:	1,
      marital_status    :       0,
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

	// TODO - bonus for home spaces under protestant control
	return base;

      },
    });
 

