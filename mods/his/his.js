const GameTemplate = require('../../lib/templates/gametemplate');
const DebateOverlay = require('./lib/ui/overlays/debate');
const TreatiseOverlay = require('./lib/ui/overlays/treatise');
const FactionOverlay = require('./lib/ui/overlays/faction');
const ReligiousOverlay = require('./lib/ui/overlays/religious');
const CouncilOfTrentOverlay = require('./lib/ui/overlays/council-of-trent');
const ReformationOverlay = require('./lib/ui/overlays/reformation');
const MovementOverlay = require('./lib/ui/overlays/movement');
const DietOfWormsOverlay = require('./lib/ui/overlays/diet-of-worms');
const FieldBattleOverlay = require('./lib/ui/overlays/field-battle');
const ThesesOverlay = require('./lib/ui/overlays/theses');
const DebatersOverlay = require('./lib/ui/overlays/debaters');
const LanguageZoneOverlay = require('./lib/ui/overlays/language-zone');
const JSON = require('json-bigint');



//////////////////
// CONSTRUCTOR  //
//////////////////
class HereIStand extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "HereIStand";
    this.gamename        = "Here I Stand";
    this.slug		 = "his";
    this.description     = `Here I Stand is a boardgame based on the military, political and religious conflicts within Europe at the outbreak of the Protestant Reformation (1517-1555). Each player controls one or more major powers that dominated Europe: the Ottoman Empire, the Hapsburgs, England, France, the Papacy and the Protestant states.`;
    this.publisher_message = "Here I Stand is owned by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game.";
    this.categories      = "Games Boardgame Strategy";

    this.interface = 1; // graphical interface

    //
    // ui components
    //
    this.debate_overlay = new DebateOverlay(this.app, this);      // theological debates
    this.treatise_overlay = new TreatiseOverlay(this.app, this);  // publish treatise
    this.religious_overlay = new ReligiousOverlay(this.app, this);  // religious conflict sheet
    this.faction_overlay = new FactionOverlay(this.app, this);  // faction sheet
    this.diet_of_worms_overlay = new DietOfWormsOverlay(this.app, this);  // diet of worms
    this.council_of_trent_overlay = new CouncilOfTrentOverlay(this.app, this);  // council of trent
    this.theses_overlay = new ThesesOverlay(this.app, this);  // 95 theses
    this.reformation_overlay = new ReformationOverlay(this.app, this);  // reformations and counter-reformations
    this.language_zone_overlay = new LanguageZoneOverlay(this.app, this);  // language zone selection
    this.debaters_overlay = new DebatersOverlay(this.app, this);  // language zone selection
    this.field_battle_overlay = new FieldBattleOverlay(this.app, this);  // field battles
    this.movement_overlay = new MovementOverlay(this.app, this);  // unit movement

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;


    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

  }



  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {

    //
    // check user preferences to update interface, if text
    //
    if (this.app?.options?.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    }

    //
    // re-fill status and log
    //
    if (this.game.status != "") { this.updateStatus(this.game.status); }

    //
    // initialize game objects
    //
    this.factions = {};

    this.units = {};
    this.army = {};
    this.navy = {};
    this.reformers = {};
    this.debaters = {};
    this.explorers = {};
    this.conquistadors = {};
    this.wives = {};

    this.deck = this.returnDeck();
    this.diplomatic_deck = this.returnDiplomaticDeck();



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
      returnCardsSaved  :       function(game_mod) {

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
 


    this.importFaction('faction3', {
      id		:	"faction3" ,
      key		: 	"france",
      name		: 	"France",
      nickname		: 	"France",
      capitals          :       ["paris"],
      admin_rating	:	1,
      img		:	"france.png",
      cards_bonus	:	1,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.francis_i == 1) { base += 1; }
        if (game_mod.game.state.leaders.henry_ii == 1) { base += 1; }

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
        if (game_mod.game.state.leaders.francis_i == 1) { base += 1; }        
        if (game_mod.game.state.leaders.henry_ii == 1) { base += 0; }        

        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {

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
      calculateBonusVictoryPoints  :    function(game_mod) {
        return 0;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
	return game_mod.game.state.french_chateaux_vp;
      },
    });
 



    this.importFaction('faction7', {
      id		:	"faction7" ,
      key		:	"genoa" ,
      name		: 	"Genoa",
      nickname		: 	"Genoa",
    });
 


    this.importFaction('faction1', {
      id		:	"faction1" ,
      key		: 	"hapsburg",
      name		: 	"Hapsburg",
      nickname		: 	"Hapsburg",
      capitals          :       ["valladolid","vienna"],
      img		:	"hapsburgs.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {
 
        let base = 0;

        if (game_mod.game.state.leaders.charles_v == 1) { base += 2; }

        return base;

        return base; 

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("hapsburg");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 1; break; }
          case 2: { base = 2; break; }
          case 3: { base = 2; break; }
          case 4: { base = 3; break; }
          case 5: { base = 3; break; }
          case 6: { base = 4; break; }
          case 7: { base = 4; break; }
          case 8: { base = 5; break; }
          case 9: { base = 5; break; }
          case 10: { base = 6; break; }
          case 11: { base = 6; break; }
          case 12: { base = 7; break; }
          case 13: { base = 7; break; }
          default: { base = 0; break; }
        }

        if (game_mod.game.state.leaders.charles_v == 1) { base += 0; }
       
        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("hapsburg");
        let base = this.vp;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 3; break; }
          case 3: { base += 4; break; }
          case 4: { base += 5; break; }
          case 5: { base += 6; break; }
          case 6: { base += 7; break; }
          case 7: { base += 8; break; }
          case 8: { base += 9; break; }
          case 9: { base += 10; break; }
          case 10: { base += 11; break; }
          case 11: { base += 12; break; }
          case 12: { base += 13; break; }
          case 13: { base += 14; break; }
        } 
        
        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        return this.special_vp;
      },
    });
 



    this.importFaction('faction8', {
      id                :       "faction8" ,
      key               :       "hungary" ,
      name              :       "Hungary",
      nickname          :       "Hungary",
    });



    this.importFaction('faction11', {
      id                :       "faction11" ,
      key               :       "independent" ,
      name              :       "Independent",
      nickname          :       "Independent",
    });



    this.importFaction('faction5', {
      id		:	"faction5" ,
      key		: 	"ottoman",
      name		: 	"Ottoman Empire",
      nickname		: 	"Ottoman",
      capitals          :       ["istanbul"],
      img		:	"ottoman.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.suleiman == 1) { base += 2; }

        return base;

      },
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

        if (game_mod.game.state.leaders.suleiman == 1) { base += 0; }        
       
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
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        return this.special_vp;
      },
    });
 



    this.importFaction('faction4', {

      id		:	"faction4" ,
      key		: 	"papacy",
      name		: 	"Papacy",
      nickname		: 	"Papacy",
      capitals          :       ["rome"],
      img		:	"papacy.png",
      admin_rating	:	0,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {
 
        let base = 0;

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 1; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 0; }

        return base; 

      },
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

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 0; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 1; }       

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

	// saint peters cathedral
 	base += game_mod.game.state.saint_peters_cathedral['vp'] = 0;

        return base;

      },
    });
 



    this.importFaction('faction6', {
      id		:	"faction6" ,
      key		: 	"protestant",
      name		: 	"Protestants",
      nickname		: 	"Protestants",
      capitals		:	[] ,
      img		:	"protestant.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
        
	let base = 4; 

        let kc = game_mod.returnNumberOfElectoratesControlledByProtestants();
        if (kc > 4) { base += 1; }

        if (game_mod.game.state.leaders.luther == 1) { base += 0; }

	return base;        

      },
      returnCardsSaved  :       function(game_mod) {

	if (game_mod.game.state.leaders.luther == 1) { return 1; }
      
	return 0;
      },

      calculateBaseVictoryPoints  : function(game_mod) {
	// 2 VP for every electorate that is under Protesant religious + political control
        let base = 0;
        base += (2 * game_mod.returnNumberOfProtestantElectorates());        
        return base;
      },

      calculateBonusVictoryPoints  :    function(game_mod) {
	// + VP from disgraced papal debaters
        return game_mod.game.state.papal_debaters_disgraced_vp;
      }
,
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
        let base = game_mod.returnProtestantSpacesTrackVictoryPoints().protestant;

	// 1 VP for each full bible translation
        if (game_mod.game.state.translations['full']['german'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['french'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['english'] == 10) { base++; }

        return base;
      },
    });
 



    this.importFaction('faction10', {
      id                :       "faction10" ,
      key               :       "scotland" ,
      name              :       "Scotland",
      nickname          :       "Scotland",
    });



    this.importFaction('faction9', {
      id                :       "faction9" ,
      key               :       "venice" ,
      name              :       "Venice",
      nickname          :       "Venice",
    });



    this.importArmyLeader('suleiman', {
      type		:	"suleiman" ,
      name		: 	"Suleiman",
      personage		:	true,
      army_leader	:	true,
      img		:	"Suleiman.svg",
      battle_rating	:	2,
      command_value	:	10,
    });
 
    this.importArmyLeader('ibrahim-pasha', {
      type		:	"ibrahim-pasha" ,
      name		: 	"Ibrahim Pasha",
      personage		:	true,
      army_leader	:	true,
      img		:	"Ibrahim.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
  
    this.importArmyLeader('charles-v', {
      type		:	"charles-v" ,
      name		: 	"Charles V",
      personage		:	true,
      army_leader	:	true,
      img		:	"Charles_V.svg",
      battle_rating	:	2,
      command_value	:	10,
    });
 
    this.importArmyLeader('duke-of-alva', {
      type		:	"duke-of-alva" ,
      name		: 	"Duke of Alva",
      personage		:	true,
      army_leader	:	true,
      img		:	"Duke_of_Alva.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('ferdinand', {
      type		:	"ferdinand" ,
      name		: 	"Ferdinand",
      personage		:	true,
      army_leader	:	true,
      img		:	"Ferdinand.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('henry-viii', {
      type		:	"henry-viii" ,
      name		: 	"Henry VIII",
      personage		:	true,
      army_leader	:	true,
      img		:	"Henry_VIII.svg",
      battle_rating	:	1,
      command_value	:	8,
    });
 
    this.importArmyLeader('charles-brandon', {
      type		:	"charles-brandon" ,
      name		: 	"Charles Brandon",
      personage		:	true,
      army_leader	:	true,
      img		:	"Brandon.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('francis-i', {
      type		:	"francis-i" ,
      name		: 	"Francis I",
      personage		:	true,
      army_leader	:	true,
      img		:	"Francis_I.svg",
      battle_rating	:	1,
      command_value	:	8,
    });

    this.importArmyLeader('henry-ii', {
      type		:	"henry-ii" ,
      name		: 	"Henry II",
      personage		:	true,
      army_leader	:	true,
      img		:	"Henry_II.svg",
      battle_rating	:	0,
      command_value	:	8,
    });
 
    this.importArmyLeader('montmorency', {
      type		:	"montmorency" ,
      name		: 	"Montmorency",
      personage		:	true,
      army_leader	:	true,
      img		:	"Montmorency.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('andrea-doria', {
      type		:	"andrea-doria" ,
      name		: 	"Andrea Doria",
      personage		:	true,
      army_leader	:	true,
      img		:	"Andrea_Doria.svg",
      battle_rating	:	2,
      command_value	:	0,
    });

    this.importArmyLeader('maurice-of-saxony', {
      type		:	"maurice-of-saxony" ,
      name		: 	"Maurice of Saxony",
      personage		:	true,
      army_leader	:	true,
      img		:	"Maurice_Protestant.svg",
      battle_rating	:	1,
      command_value	:	6,
    });

    this.importArmyLeader('maurice-of-saxony', {
      type              :       "maurice-of-saxony" ,
      name              :       "Maurice of Saxony",
      personage         :       true,
      army_leader       :       true,
      img               :       "Maurice_Hapsburg.svg",
      battle_rating     :       1,
      command_value     :       6,
    });

    this.importArmyLeader('dudley', {
      type              :       "dudley" ,
      name              :       "Dudley",
      personage         :       true,
      army_leader       :       true,
      img               :       "Dudley.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('john-frederick', {
      type              :       "john-frederick" ,
      name              :       "John Frederick",
      personage         :       true,
      army_leader       :       true,
      img               :       "John_Frederick.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('philip-hesse', {
      type              :       "philip-hesse" ,
      name              :       "Philip Hesse",
      personage         :       true,
      army_leader       :       true,
      img               :       "Philip_Hesse.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('renegade', {
      type              :       "renegade" ,
      name              :       "Renegade Leader",
      personage         :       true,
      army_leader       :       true,
      img               :       "Renegade.svg",
      battle_rating     :       1,
      command_value     :       6,
    });



/************************

Habsburg conquistadores:
1. Pizarro 3
2. Montejo 2
3. Cortez 4
4. Cordova 1
5. Coronado 1

************************/

      this.importConquistador('orellana', {
           type              :       "orellana",
           name              :       "Hector Rodrigo Enriquez Orellana",
           personage         :       true,
           img               :       "Orellana.svg",
      });

      this.importConquistador('magellan', {
           type              :       "magellan" ,
           name              :       "Ferdinand Magellan",
           personage         :       true,
           img               :       "Magellan.svg",
      });

      this.importConquistador('leon', {
           type              :       "leon" ,
           name              :       "Leon",
           personage         :       true,
           img               :       "Leon.svg",
      });

      this.importConquistador('narvaez', {
           type              :       "narvaez" ,
           name              :       "Sofia Narvaez",
           personage         :       true,
           img               :       "Narvaez.svg",
      });

      this.importConquistador('de-vaca', {
           type              :       "de-vaca" ,
           name              :       "Cabeza De Vaca",
           personage         :       true,
           img               :       "De_Vaca.svg",
      });

      this.importConquistador('de-soto', {
           type              :       "de-soto" ,
           name              :       "DeSoto",
           personage         :       true,
           img               :       "DeSoto.svg",
      });





      /***** Hapsburg Conquistadors *****/

      this.importConquistador('pizarro', {
           type              :       "pizarro" ,
           name              :       "Francisco Pizarro",
           personage         :       true,
           img               :       "Pizarro.svg",
      });

      // Montejo

      this.importConquistador('cordova', {
           type              :       "cordova" ,
           name              :       "Neisa Cordova",
           personage         :       true,
           img               :       "Cordova.svg",
      });

      this.importConquistador('coronado', {
           type              :       "coronado" ,
           name              :       "Francisco Vázquez de Coronado",
           personage         :       true,
           img               :       "Coronado.svg",
      });

      this.importConquistador('cortez', {
           type              :       "cortez" ,
           name              :       "Hernan Cortes",
           personage         :       true,
           img               :       "Cortez.svg",
      });



    ////////////////
    // PROTESTANT //
    ////////////////
    this.importDebater('luther-debater', {
      type		:	"luther-debater" ,
      name		: 	"Martin Luther",
      img		:	"LutherDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	4,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'luther-debater', html : `<li class="option" id="luther-debater">Martin Luther +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone" && his_self.canPlayerCommitDebater("protestant", "luther-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.prependMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tluther-debater");
          his_self.prependMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });
    this.importDebater('melanchthon-debater', {
      type		:	"melanchthon-debater" ,
      name		: 	"Philip Melanchthon",
      img		:	"MelanchthonDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'melanchthon-debater', html : `<li class="option" id="melanchthon-debater">Melanchthon +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone"  && his_self.canPlayerCommitDebater("protestant", "melanchthon-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.prependMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tmelanchthon-debater");
          his_self.prependMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });






    this.importDebater('zwingli-debater', {
      type		:	"zwingli-debater" ,
      name		: 	"Ulrich Zwingli",
      img		:	"ZwingliDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Zurich" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'zwingli-debater', html : `<li class="option" id="zwingli-debater">Ulrich Zwingli +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "zwingli-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("ulrich_zwingli");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "ulrich_zwingli") {
	  his_self.commitDebater("protestant", "zwingli-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"];
	}
        return 1;
      }
    });

    this.importDebater('bucer-debater', {
      type		:	"bucer-debater" ,
      name		: 	"Martin Bucer",
      img		:	"BucerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Strasburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'bucer-debater', html : `<li class="option" id="bucer-debater">Martin Bucer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "bucer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("martin_bucer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "martin_bucer") {
	  his_self.commitDebater("protestant", "bucer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"];
	}
        return 1;
      }
    });
    this.importDebater('oekolampadius-debater', {
      type		:	"oekolampadius-debater" ,
      name		: 	"Johannes Oekolampadius",
      img		:	"OekolampadiusDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Basel" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'oekolampadius-debater', html : `<li class="option" id="oekolampadius-debater">Johannes Oekolampadius +1 Bonus</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation"  && his_self.canPlayerCommitDebater("protestant", "oekolampadius-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("oekolampadius");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "oekolampdius") {
	  his_self.commitDebater("protestant", "oekolampdius-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"];
	}
        return 1;
      }
    });



    this.importDebater('bullinger-debater', {
      type		:	"bullinger-debater" ,
      name		: 	"Heinrich Bullinger",
      img		:	"BullingerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Insert in 2nd round of debate in any Language Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : 'bullinger-debater', html : `<li class="option" id="bullinger-debater">substitute Bullinger</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "debate" && his_self.canPlayerCommitDebater("protestant", "bullinger-debater")) {
	  if (his_self.game.state.theological_debate.round === 2) {
            if (faction === "protestant") {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "debate") {
	  if (his_self.game.state.theological_debate.attacker === "papacy") {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_bonus\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_defender_debater\tbullinger-debater");
	  } else {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tattacker_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_attacker_debater\tbullinger-debater");
	  }
          his_self.endTurn();
        }
        return 0;
      },

    });


    this.importDebater('carlstadt-debater', {
      type		:	"carlstadt-debater" ,
      name		: 	"Andreas Carlstadt",
      img		:	"CarlstadtDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Target 3 German spaces with Treatise, unrest if fails" ,
      committed		: 	0,
      //
      // implemented in his-player, since provides +1 bonus target for publish treastise in German zone
      //
    });





    ////////////
    // PAPACY //
    ////////////
    this.importDebater('cajetan-debater', {
      type		:	"cajetan-debater" ,
      name		: 	"Thomas Cajetan",
      img		:	"CajetanDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"Target 3 spaces with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });
    this.importDebater('caraffa-debater', {
      type		:	"caraffa-debater" ,
      name		: 	"Carlo Caraffa",
      img		:	"CaraffaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Target 3 spaces in any zone with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });


    this.importDebater('eck-debater', {
      type		:	"eck-debater" ,
      name		: 	"Johann Eck",
      img		:       "EckDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in Debate Attacks" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });
    this.importDebater('gardiner-debater', {
      type		:	"gardiner-debater" ,
      name		: 	"Stephen Gardiner",
      img		:	"GardinerDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in debate in English zone if attacker" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });

    this.importDebater('aleander-debater', {
      type		:	"aleander-debater" ,
      name		: 	"Hieronymus Aleander",
      img		:       "AleanderDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"If concludes debate, winner flips an extra space" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic - note, can benefit protestants too
      //
    });

    this.importDebater('campeggio-debater', {
      type		:	"campeggio-debater" ,
      name		: 	"Lorenzo Campeggio",
      img		:	"CampeggioDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Roll die after debate loss; if 5 or 6 result is ignored" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });





    this.importDebater('loyola-debater', {
      type		:	"loyola-debater" ,
      name		: 	"Ignatius Loyola",
      img		:	"LoyolaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	4 ,
      ability		:	"Found Jesuit University for only 2 CP" ,
      committed		: 	0,
      //
      // implemented in his-player -- foundJesuitUniversityWithLoyola
      //
    });

    this.importDebater('pole-debater', {
      type		:	"pole-debater" ,
      name		: 	"Reginald Pole",
      img		:	"PoleDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Papacy if at Council of Trent" ,
      committed		: 	0,
    });

    this.importDebater('tetzel-debater', {
      type		:	"tetzel-debater" ,
      name		: 	"Johann Tetzel ",
      img		:	"TetzelDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"1 CP to Saint Peters with Burn Books" ,
      committed		: 	0,
      //
      // implemented in his_player
      //
    });






    this.importDebater('canisius-debater', {
      type		:	"canisius-debater" ,
      name		: 	"Peter Canisius",
      img		:	"CanisiusDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Counter-Reformation attempts within 2 spaces of Regensburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'canisius-debater', html : `<li class="option" id="canisius-debater">Peter Canisius +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "canisius-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player && ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_canisius");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "peter_canisius") {
	  his_self.commitDebater("papacy", "canisius-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"];
        }
        return 1;
      }
    });





    this.importDebater('contarini-debater', {
      type		:	"contarini-debater" ,
      name		: 	"Gasparo Contarini",
      img		:	"ContariniDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"+1 die for Counter-Reformations within 2 spaces of Charles V" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'contarini-debater', html : `<li class="option" id="contarini-debater">Gasparo Contarini +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "contarini-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	    if (cx) {
	      let targets = [];
	      if (his_self.spaces[cx]) {
	        targets.push(cx);

	        for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

		  let x = his_self.spaces[cx].neighbours[i];
		  if (!targets.includes(x)) { targets.push(x); }

	          for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
		    let y = his_self.spaces[x].neighbours[ii];
		    if (!targets.includes(y)) { targets.push(y); }
	  	  }
	        }
	      }
	      if (targets.includes(spacekey)) {
                return 1;
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("gasparo_contarini");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "gasparo_contarini") {
	  his_self.commitDebater("papacy", "contarini-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;

          let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
          if (his_self.spaces[cx]) {
            let targets = [];
            targets.push(cx);

            for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

              let x = his_self.spaces[cx].neighbours[i];
              if (!targets.includes(x)) { targets.push(x); }

              for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
                let y = his_self.spaces[x].neighbours[ii];
                if (!targets.includes(y)) { targets.push(y); }
              }
            }
          }

          his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = targets;
        }
        return 1;
      }
    });

    this.importDebater('faber-debater', {
      type		:	"faber-debater" ,
      name		: 	"Peter Faber",
      img		:	"FaberDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+2 die for Counter-Reformations against an Electorate" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'faber-debater', html : `<li class="option" id="faber-debater">Peter Faber +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "faber-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    if (["augsburg","trier","cologne","wittenberg","mainz","brandenburg"].includes(spacekey)) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_faber");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "peter_faber") {
	  his_self.commitDebater("papacy", "faber-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["augsburg","trier","cologne","wittenberg","mainz","brandenburg"];
        }
        return 1;
      }
    });






    ////////////
    // FRENCH //
    ////////////
    this.importDebater('calvin-debater', {
      type		:	"calvin-debater" ,
      name		: 	"John Calvin",
      img		:	"CalvinDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	4 ,
      ability		:	"Target 3 French-speaking spaces with a treatise" ,
      committed		: 	0,
      //
      // implemented in his-player
      //
    });

    this.importDebater('cop-debater', {
      type		:	"cop-debater" , 
     name		: 	"Nicolas Cop",
      img		:	"CopDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Paris" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'cop-debater', html : `<li class="option" id="cop-debater">Nicholas Cop +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cop-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("nicholas_cop");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "nicholas_cop") {
          his_self.commitDebater("protestant", "cop-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"];
        }
        return 1;
      }
    });

    this.importDebater('farel-debater', {
      type		:	"farel-debater" ,
      name		: 	"William Farel",
      img		:	"FarelDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Geneva" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'farel-debater', html : `<li class="option" id="farel-debater">William Farel +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "farel-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("william_farel");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "william_farel") {
          his_self.commitDebater("protestant", "farel-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"];
        }
        return 1;
      }

    });

    this.importDebater('olivetan-debater', {
      type		:	"olivetan-debater" ,
      name		: 	"Pierre Robert Olivetan",
      img		:	"OlivetanDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Bonus CP for translation in French Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_french_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'olivetan-debater', html : `<li class="option" id="olivetan-debater">Olivetan +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone"  && his_self.canPlayerCommitDebater("protestant", "olivetan-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tolivetan-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tfrench");
          his_self.endTurn();
          his_self.updateStatus("acknowledge");
        } 
        return 0; 
      },
    });





    /////////////
    // ENGLISH //
    /////////////
    this.importDebater('cranmer-debater', {
      type		:	"cranmer-debater" ,
      name		: 	"Thomas Cranmer",
      img		:	"CranmerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation within 2 spaces of London" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'cranmer-debater', html : `<li class="option" id="cranmer-debater">Thomas Cranmer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cranmer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("thomas_cranmer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "thomas_cranmer") {
	  his_self.commitDebater("protestant", "cranmer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"];
	}
        return 1;
      }
    });

    this.importDebater('wishart-debater', {
      type		:	"wishart-debater" ,
      name		: 	"George Wishart",
      img		:	"WishartDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'wishart-debater', html : `<li class="option" id="wishart-debater">George Wishart +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "wishart-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["stirling","glasgow","edinburgh"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("george_wishart");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "george_wishart") {
	  his_self.commitDebater("protestant", "wishart-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["stirling","glasgow","edinburgh"];
	}
        return 1;
      }
    });

    this.importDebater('latimer-debater', {
      type		:	"latimer-debater" ,
      name		: 	"Hugh Latimer",
      img		:	"LatimerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in England" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'latimer-debater', html : `<li class="option" id="latimer-debater">Hugh Latimer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "latimer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("hugh_latimer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "hugh_latimer") {
	  his_self.commitDebater("protestant", "latimer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"];
	}
        return 1;
      }
    });

    this.importDebater('knox-debater', {
      type		:	"knox-debater" ,
      name		: 	"John Knox",
      img		:	"KnoxDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 die for Reformation Attempts in England or Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'knox-debater', html : `<li class="option" id="knox-debater">John Knox +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "knox-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("john_knox");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "john_knox") {
	  his_self.commitDebater("protestant", "knox-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"];
	}
        return 1;
      }
    });


    this.importDebater('tyndale-debater', {
      type		:	"tyndale-debater" ,
      name		: 	"William Tyndale",
      img		:	"TyndaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'tyndale-debater', html : `<li class="option" id="tyndale-debater">William Tyndale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "tyndale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\ttyndale-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });

    this.importDebater('coverdale-debater', {
      type		:	"coverdale-debater" ,
      name		: 	"Myles Coverdale",
      img		:	"CoverdaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'coverdale-debater', html : `<li class="option" id="coverdale-debater">Myles Coverdale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "coverdale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tcoverdale-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });


      /***** English Explorers *****/

      this.importExplorer('chancellor', {
           type              :       "chancellor" ,
           name              :       "Chancellor",
           personage         :       true,
           img               :       "Chancellor.svg",
      });

      this.importExplorer('willoughby', {
           type              :       "willoughby" ,
           name              :       "Katherine Willoughby",
           personage         :       true,
           img               :       "Willoughby.svg",
      });

      this.importExplorer('rut', {
           type              :       "rut" ,
           name              :       "John Rut",
           personage         :       true,
           img               :       "Rut.svg",
      });



      /***** French Explorers *****/

      this.importExplorer('cartier', {
           type              :       "cartier" ,
           name              :       "Jacques Cartier",
           personage         :       true,
           img               :       "Cartier.svg",
      });

      this.importExplorer('roberval', {
           type              :       "roberval" ,
           name              :       "Jean-François de La Rocque de Roberval",
           personage         :       true,
           img               :       "Roberval.svg",
      });

      this.importExplorer('verrazano', {
           type              :       "verrazano" ,
           name              :       "Giovanni da Verrazano" ,
           personage         :       true,
           img               :       "Verrazano.svg",
      });



      /***** Hapsburg Explorers *****/

      this.importExplorer('orellana', {
           type              :       "orellana",
           name              :       "Hector Rodrigo Enriquez Orellana",
           personage         :       true,
           img               :       "Orellana.svg",
      });

      this.importExplorer('magellan', {
           type              :       "magellan" ,
           name              :       "Ferdinand Magellan",
           personage         :       true,
           img               :       "Magellan.svg",
      });

      this.importExplorer('leon', {
           type              :       "leon" ,
           name              :       "Leon",
           personage         :       true,
           img               :       "Leon.svg",
      });

      this.importExplorer('narvaez', {
           type              :       "narvaez" ,
           name              :       "Sofia Narvaez",
           personage         :       true,
           img               :       "Narvaez.svg",
      });

      this.importExplorer('de-vaca', {
           type              :       "de-vaca" ,
           name              :       "Cabeza De Vaca",
           personage         :       true,
           img               :       "De_Vaca.svg",
      });

      this.importExplorer('de-soto', {
           type              :       "de-soto" ,
           name              :       "DeSoto",
           personage         :       true,
           img               :       "DeSoto.svg",
      });



    this.importNavyLeader('barbarossa', {
      type		:	"barbarossa" ,
      name		: 	"Barbarossa",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Barbarossa.svg",
      battle_rating	:	2,
      piracy_rating	:	1,
    });
 
    this.importNavyLeader('dragut', {
      type		:	"dragut" ,
      name		: 	"Dragut",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Dragut.svg",
      battle_rating	:	1,
      piracy_rating	:	2,
    });
 
    this.importNavyLeader('andrea-dorea', {
      type		:	"andrea-dorea" ,
      name		: 	"Andrea Dorea",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Andrea_Dorea.svg",
      battle_rating	:	2,
      piracy_rating	:	0,
    });
 


      this.importReformer('calvin-reformer', {
           type              :       "calvin-reformer" ,
           name              :       "John Calvin",
           reformer          :       true,
           img               :       "CalvinReformer.svg",
	   spacekey	     :	     "geneva",
      });

      this.importReformer('cranmer-reformer', {
           type              :       "cranmer-reformer" ,
           name              :       "Thomas Cranmer ",
           reformer          :       true,
           img               :       "CranmerReformer.svg",
	   spacekey	     :	     "london",
      });

      this.importReformer('luther-reformer', {
           type              :       "luther-reformer" ,
           name              :       "Martin Luther",
           reformer          :       true,
           img               :       "LutherReformer.svg",
	   spacekey	     :	     "wittenberg",
      });

      this.importReformer('zwingli-reformer', {
           type              :       "zwingli-reformer" ,
           name              :       "Huldrych Zwingli",
           reformer          :       true,
           img               :       "ZwingliReformer.svg",
	   spacekey	     :	     "zurich",
      });


    this.importUnit('regular', {
      type		:	"regular" ,
      name		: 	"Regular",
    });
 
    this.importUnit('mercenary', {
      type		:	"mercenary" ,
      name		: 	"Mercenary",
    });
 
    this.importUnit('cavalry', {
      type		:	"cavalry" ,
      name		: 	"Cavalry",
    });
 
    this.importUnit('squadron', {
      type		:	"squadron" ,
      name		: 	"Squadron" ,
      land_or_sea	:	"sea" ,
    });

    this.importUnit('corsair', {
      type		:	"corsair" ,
      name		: 	"Corsair" ,
      land_or_sea	:	"sea" ,
    });

    this.importUnit('debater', {
      type		:	"debater" ,
      name		: 	"Debater",
      debater		:	true,
    });
 
    this.importUnit('reformer', {
      type		:	"reformer" ,
      name		: 	"Reformer",
      reformer		:	true,
    });
 





    this.importWife('anne-boleyn', {
      type		:	"anne-boleyn" ,
      name		: 	"Anne Boleyn",
      personage		:	true,
      img		:	"AnneBoleyn.svg",
    });

    this.importWife('anne-cleves', {
      type		:	"anne-cleves" ,
      name		: 	"Anne Cleves",
      personage		:	true,
      img		:	"AnneCleves.svg",
    });

    this.importWife('catherine-aragon', {
      type		:	"catherine-aragon" ,
      name		: 	"Catherine Aragon",
      personage		:	true,
      img		:	"CatherinAragon.svg",
    });

    this.importWife('jane-seymour', {
      type		:	"jane-seymour" ,
      name		: 	"Jane Seymour",
      personage		:	true,
      img		:	"JaneSeymour.svg",
    });

    this.importWife('katherine-parr', {
      type		:	"katherine-parr" ,
      name		: 	"Katherine Parr",
      personage		:	true,
      img		:	"KatherineParr.svg",
    });

    this.importWife('kathryn-howard', {
      type		:	"kathryn-howard" ,
      name		: 	"Kathryn Howard",
      personage		:	true,
      img		:	"KathrynHoward.svg",
    });


    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      first_time_running = 1;
      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();
      this.game.navalspaces = this.returnNavalSpaces();

console.log("PLAYERS INFO: " + JSON.stringify(this.game.state.players_info));

console.log("\n\n\n\n");
console.log("---------------------------");
console.log("---------------------------");
console.log("------ INITIALIZE GAME ----");
console.log("---------------------------");
console.log("---------------------------");
console.log("---------------------------");
console.log("DECK: " + this.game.options.deck);
console.log("\n\n\n\n");

      this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

      //
      // Game Queue
      //
      this.game.queue.push("round");
      this.game.queue.push("READY");
      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.deck));
      this.game.queue.push("init");

    }

    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }

    //
    // add initial units
    //
    if (first_time_running == 1) {

      //
      // 1517 scenario
      //
      if (this.game.state.scenario == "1517") {

	// VENICE AND PROTESTANT ALLIANCE
	this.addRegular("protestant", "venice", 4);
	this.addRegular("papacy", "ravenna", 2);
	this.setAllies("protestant", "venice");
  	this.addUnrest("graz");


	// OTTOMAN
        this.addArmyLeader("ottoman", "istanbul", "suleiman");
        this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
        this.addRegular("ottoman", "istanbul", 7);
        this.addCavalry("ottoman", "istanbul", 1);
        this.addNavalSquadron("ottoman", "istanbul", 1);
        this.addRegular("ottoman", "edirne");
        this.addRegular("ottoman", "salonika", 1);
        this.addNavalSquadron("ottoman", "salonika", 1);
        this.addRegular("ottoman", "athens", 1);
        this.addNavalSquadron("ottoman", "athens", 1);

	// HAPSBURG
	this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
        this.addRegular("hapsburg", "seville", 1);
        this.addNavalSquadron("hapsburg", "seville", 1);
        this.addRegular("hapsburg", "barcelona", 1);
        this.addNavalSquadron("hapsburg", "barcelona", 1);
        this.addRegular("hapsburg", "navarre", 1);
        this.addRegular("hapsburg", "tunis", 1);
        this.addRegular("hapsburg", "naples", 2);
        this.addNavalSquadron("hapsburg", "naples", 2);
        this.addRegular("hapsburg", "besancon", 1);
        this.addRegular("hapsburg", "brussels", 1);
	this.addArmyLeader("hapsburg", "vienna", "ferdinand");
        this.addRegular("hapsburg", "vienna", 4);
        this.addRegular("hapsburg", "antwerp", 3);

	// ENGLAND
        this.addArmyLeader("england", "london", "henry-viii");
        this.addArmyLeader("england", "london", "charles-brandon");
        this.addRegular("england", "london", 3);
        this.addNavalSquadron("england", "london", 1);
        this.addNavalSquadron("england", "portsmouth", 1);
        this.addRegular("england", "calais", 2);
        this.addRegular("england", "york", 1);
        this.addRegular("england", "bristol", 1);

	// FRANCE
        this.addArmyLeader("france", "paris", "francis-i");
        this.addArmyLeader("france", "paris", "montmorency");
        this.addRegular("france", "paris", 4);
        this.addRegular("france", "rouen", 1);
        this.addNavalSquadron("france", "rouen", 1);
        this.addRegular("france", "bordeaux", 2);
        this.addRegular("france", "lyon", 1);
        this.addRegular("france", "marseille", 1);
        this.addNavalSquadron("france", "marseille", 1);
        this.addRegular("france", "milan", 2);

	// PAPACY
        this.addRegular("papacy", "rome", 1);
        this.addNavalSquadron("papacy", "rome", 1);
        this.addRegular("papacy", "ravenna", 1);
	
	// PROTESTANT
        this.addRegular("papacy", "rome", 1);
        this.addNavalSquadron("papacy", "rome", 1);
        this.addRegular("papacy", "ravenna", 1);
	
	// VENICE
        this.addRegular("venice", "venice", 2);
        this.addNavalSquadron("venice", "venice", 3);
        this.addRegular("venice", "corfu", 1);
        this.addRegular("venice", "candia", 1);
	
	// GENOA
        this.addNavyLeader("genoa", "genoa", "andrea-doria");
        this.addNavalSquadron("genoa", "genoa", 1);
        this.addRegular("genoa", "genoa", 2);
	
	// SCOTLAND
        this.addRegular("scotland", "edinburgh", 3);
        this.addNavalSquadron("scotland", "edinburgh", 1);
	
	// INDEPENDENT
        this.addRegular("independent", "rhodes", 1);
        this.addRegular("independent", "metz", 1);
        this.addRegular("independent", "florence", 1);
	
	// DEBATERS
	this.addDebater("papacy", "eck-debater");
	this.addDebater("papacy", "campeggio-debater");
	this.addDebater("papacy", "aleander-debater");
	this.addDebater("papacy", "tetzel-debater");
	this.addDebater("papacy", "cajetan-debater");

	this.addDebater("protestant", "luther-debater");
	this.addDebater("protestant", "melanchthon-debater");
	this.addDebater("protestant", "bucer-debater");
	this.addDebater("protestant", "carlstadt-debater");

	this.game.spaces['worms'].religion = "protestant";

	// HACK
	this.addDebater("protestant", "bullinger-debater");
	this.addDebater("protestant", "oekolampadius-debater");
	this.addDebater("protestant", "zwingli-debater");
	this.addDebater("papacy", "caraffa-debater");
	this.addDebater("papacy", "gardiner-debater");
	this.addDebater("papacy", "loyola-debater");
	this.addDebater("papacy", "pole-debater");
	this.addDebater("papacy", "canisius-debater");
	this.addDebater("papacy", "contarini-debater");
	this.addDebater("papacy", "faber-debater");

      }

      //
      // 1532 scenario
      //
      if (this.game.state.scenario === "1532") {

      }

      if (this.game.state.scenario === "tournament") {

      }

    }

    //
    // and show the board
    //
    this.displayBoard();

  }



  render(app) {

    if (this.browser_active == 0) { return; }

    super.render(app);

    let game_mod = this;

    //
    //
    //
    if (!this.game.state) {
      this.game.state = this.returnState();
    }


    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.hereistand_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}

    this.menu.addMenuOption("game-game", "Game");
    let initial_confirm_moves = "Newbie Mode"; 
    if (this.confirm_moves == 1) {
      initial_confirm_moves = "Expert Mode"; 
    }
    this.menu.addSubMenuOption("game-game", {
      text : initial_confirm_moves,
      id : "game-confirm",
      class : "game-confirm",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	if (game_mod.confirm_moves == 0) {
	  game_mod.confirm_moves = 1;
          game_mod.saveGamePreference('his_expert_mode', 0);
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('his_expert_mode', 1);
	  window.location.reload();	
	}
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Log",
      id : "game-log",
      class : "game-log",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });
    this.menu.addMenuOption("game-cards", "Cards");
    this.menu.addSubMenuOption("game-cards", {
      text : "Field Battle",
      id : "game-field-battle",
      class : "game-field_battle",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.field_battle_overlay.renderFortification();
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Religion",
      id : "game-religious-conflict",
      class : "game-religious-conflict",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.religious_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Debaters",
      id : "game-debaters",
      class : "game-debaters",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayDebaters();
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Explorers",
      id : "game-explorers",
      class : "game-explorers",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayExplorers();
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Conquistadors",
      id : "game-conquistadors",
      class : "game-conquistadors",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayConquistadors();
      }
    });

    this.menu.addMenuOption("game-factions", "Factions");
    this.menu.addSubMenuOption("game-factions", {
      text : "Hapsburgs",
      id : "game-hapsburgs",
      class : "game-hapsburgs",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("hapsburg");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "England",
      id : "game-england",
      class : "game-england",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("england");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "France",
      id : "game-france",
      class : "game-france",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("france");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Ottoman Empire",
      id : "game-ottoman",
      class : "game-ottoman",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("ottoman");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Protestants",
      id : "game-protestants",
      class : "game-protestants",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("protestant");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Papacy",
      id : "game-papacy",
      class : "game-papacy",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("papacy");
      }
    });

    this.menu.addChatMenu();
    this.menu.render();
    this.log.render();
    this.cardbox.render();

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);
    if (app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 0;
    }

    //
    // position cities / spaces / etc
    //
    let spaces = this.returnSpaces();
    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
	try {
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position pregnancy chart
    //
    let pregnancies = this.returnPregnancyChart();
    for (let key in pregnancies) {
      if (pregnancies.hasOwnProperty(key)) {
	try {
          let idname = "pregnancy"+key;
	  let obj = document.getElementById(idname);
	  obj.style.top = pregnancies[key].top + "px";
	  obj.style.left = pregnancies[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position diplomacy chart
    //
    let d = this.returnDiplomacyTable();
    for (let key in d) {
      if (d.hasOwnProperty(key)) {
	try {
          for (let key2 in d[key]) {
	    divname = key + "_" + key2;
	    let obj = document.getElementById(divname);
	    obj.style.top = d[key][key2].top + "px";
	    obj.style.left = d[key][key2].left + "px";
	  }
        } catch (err) {
	}
      }
    }
    this.game.diplomacy = d;



    //
    // position electorate display
    //
    let elec = this.returnElectorateDisplay();
    for (let key in elec) {
      if (elec.hasOwnProperty(key)) {
        try {
          let obj = document.getElementById(`ed_${key}`);
          obj.style.top = elec[key].top + "px";
          obj.style.left = elec[key].left + "px";
        } catch (err) {
        }
      }
    }



    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        //this.hammer.render(this.app, this);
        //this.hammer.attachEvents(this.app, this, '.gameboard');
      } else {
	let his_self = this;
        this.sizer.render();
        this.sizer.attachEvents('#gameboard');
	//
	// sizer makes draggable 
	//
        //$('#gameboard').draggable({
	//  stop : function(event, ui) {
	//    his_self.saveGamePreference((his_self.returnSlug()+"-board-offset"), ui.offset);
	//  }
	//});
	//
      }

    } catch (err) {}

    this.hud.render();

    this.displayBoard();

  }



  returnAdvancedOptions() {

    return `
      <div style="padding:40px;width:100vw;height:100vh;overflow-y:scroll;display:grid;grid-template-columns: 200px auto">
	<div style="top:0;left:0;">

            <label for="player1">Play as:</label>
            <select name="player1">
              <option value="random" selected>random</option>
              <option value="ussr">Protestants</option>
              <option value="us">Papacy</option>
            </select>

            <label for="scenario">Scenario:</label>
            <select name="scenario" id="scenario">
            <option value="original">original</option>
              <option value="1517" selected>1517 - long game</option>
              <option value="1532">1532 - shorter game</option>
              <option value="tournament">1532 - tournament</option>
            </select>

	</div>
    </div>

          `;


  }




  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
	new_deck[key] = deck[key];
      }
    }

    return new_deck;

  }

  returnNewDiplomacyCardsForThisTurn(turn = 1) {

    let deck = this.returnDiplomaticDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
        new_deck[key] = deck[key];
      }
    }

    return new_deck;

  }

  returnDiplomaticDeck() {

    let deck = {};

    deck['201'] = { 
      img : "cards/HIS-201.svg" , 
      name : "Andrea Doria" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "papacy") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("papacy", "genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tpapacy");
	  }

	}

	if (faction === "protestant") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "france") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("france", "genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tprotestant");
	  }

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "andrea_doria_placement") {

	  let faction = mv[1];
          his_self.game.queue.splice(qe, 1);

          his_self.playerSelectSpaceWithFilter(

            "Select Genoa Home Space for 4 Regulars",

            function(space) {
              if (space.home == "genoa") { return 1; }
	      return 0;
            },

            function(spacekey) {
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

          return 0;
        }
	return 1;
      }
    }
    deck['202'] = { 
      img : "cards/HIS-202.svg" , 
      name : "French Constable Invades" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_constable_invades\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tmontmorency");
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

          return 0;

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_constable_invades") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

 	  let msg = "Choose Option:";
          let html = '<ul>';
          html += '<li class="option" id="squadron">1 squadron in French home port</li>';
          html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (action === "squadron") {

              his_self.playerSelectSpaceWithFilter(

                "Select French Home Port",

                function(space) {
                  if (space.ports.length > 0 && space.home == "french") {
                    return 1;
                  }
                },

                function(spacekey) {
                  his_self.addMove("build\tland\tfrench\t"+"squadron"+"\t"+spacekey);
                  his_self.endTurn();
                }

              );
	    }
	    if (action === "mercenaries") {
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
	    }

	  });

	  return 0;
	}

        return 1;

      },
    }
    deck['203'] = { 
      img : "cards/HIS-203.svg" , 
      name : "Corsair Raid" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Corsair Raid");
        return 1;
      },
    }
    deck['204'] = { 
      img : "cards/HIS-204.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        ca.push(mp[i]);
	      } else {
	        cd.push(mp[i]);
	      }
	    }
	  }
	
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (ca.includes(action)) {
	      his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	    } else {
	      his_self.addMove("deactivate_minor_power\t"+faction+"\t"+action);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['205'] = { 
      img : "cards/HIS-205.svg" , 
      name : "Diplomatic Pressure" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Diplomatic Pressure");
      },
    }
    deck['206'] = { 
      img : "cards/HIS-206.svg" , 
      name : "French Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_invasion\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      if (his_self.game.state.leaders.francis_i) {
                his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tfrancis-i");
              } else {
		his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\thenry-ii");
              }
	      his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_invasion") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

 	  let msg = "Choose Option:";
          let html = '<ul>';
          html += '<li class="option" id="squadron">1 squadron in French home port</li>';
          html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (action === "squadron") {

              his_self.playerSelectSpaceWithFilter(

                "Select French Home Port",

                function(space) {
                  if (space.ports.length > 0 && space.home == "french") {
                    return 1;
                  }
                },

                function(spacekey) {
                  his_self.addMove("build\tland\tfrench\t"+"squadron"+"\t"+spacekey);
                  his_self.endTurn();
                }

              );
	    }
	    if (action === "mercenaries") {
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
	    }

	  });

	  return 0;
	}

        return 1;

      },
    }
    deck['207'] = { 
      img : "cards/HIS-207.svg" , 
      name : "Henry Petitions for Divorce" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['208'] = { 
      img : "cards/HIS-208.svg" , 
      name : "Knights of St. John" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("knights-of-saint-john\t"+faction);
	his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+"faction");
        his_self.game.queue.push(`DEAL\t1\t${p}\t1`);

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "knights-of-saint-john") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

            let fhand_idx = his_self.returnFactionHandIdx(player, extra);
	    let card = his_self.game.deck[0].cards[his_self.game.deck[0].hand[his_self.game.deck[0].hand[fhand_idx].length-1]];
	    let ops = card.ops;

	    his_self.addMove("NOTIFY\t"+faction+" pulls "+card.name+" - "+ops +" CP");
	    his_self.addMove("build_saint_peters_with_cp\t"+ops);
	    his_self.endTurn();

	  }

	  return 0;
        }

	return 1;	
      }
    }
    deck['209'] = { 
      img : "cards/HIS-209.svg" , 
      name : "Plague" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['210'] = { 
      img : "cards/HIS-210.svg" , 
      name : "Shipbuilding" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['211'] = { 
      img : "cards/HIS-211.svg" , 
      name : "Spanish Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['212'] = { 
      img : "cards/HIS-212.svg" , 
      name : "Venetian Alliance" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	if (ally == "") {
	  his_self.activateMinorPower("papacy", "venice");
	}
	if (ally == "hapsburg") {
	  his_self.deactivateMinorPower("hapsburg", "venice");
	}
        if (ally === "papacy") {
	  his_self.game.queue.push("venetian_alliance_placement");
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "venetian_alliance_placement") {

          his_self.playerSelectSpaceWithFilter(

            "Select Papal-Controlled Port not under Siege",

            function(space) {
	      if (his_self.isSpaceControlled(space, "papacy") && space.ports.length > 0 && !space.besieged) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("build\tland\tvenice\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

          return 0;

	}

	return 1;

      },
    }
    deck['213'] = { 
      img : "cards/HIS-213.svg" , 
      name : "Austrian Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tferdinand");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
    }
    deck['214'] = { 
      img : "cards/HIS-214.svg" , 
      name : "Imperial Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tcharles-v");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
    }
    deck['215'] = { 
      img : "cards/HIS-215.svg" , 
      name : "Machiavelli" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['216'] = { 
      img : "cards/HIS-216.svg" , 
      name : "Ottoman Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	his_self.setEnemies("ottoman", "papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Ottoman-Controlled Port",

            function(space) {
	      if (his_self.isSpaceControlled(space, "ottoman") && space.ports.length > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tottoman\t"+spacekey+"\tsuleiman");
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
    }
    deck['217'] = { 
      img : "cards/HIS-217.svg" , 
      name : "Secret Protestant Circle" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['218'] = { 
      img : "cards/HIS-218.svg" , 
      name : "Siege of Vienna" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['219'] = { 
      img : "cards/HIS-219.svg" , 
      name : "Spanish Inquisition" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


  removeCardFromGame(card) {
    try { delete this.game.deck[0].cards[card]; } catch (err) {}
    try { delete this.game.deck[0].discards[card]; } catch (err) {}
  }


  returnDeck() {

    var deck = {};

    /// HOME CARDS
    deck['001'] = { 
      img : "cards/HIS-001.svg" , 
      name : "Janissaries" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "ottoman" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_field_battle_hits_assignment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'janissaries', html : `<li class="option" id="janissaries">janissaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          his_self.addMove("janissaries");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "janissaries") {

          his_self.game.queue.splice(qe, 1);
	  his_self.updateLog("Ottoman Empire plays Janissaries");
	  his_self.game.state.field_battle.attacker_rolls += 5;
	  his_self.game.state.field_battle.attacker_results.push(his_self.rollDice(6));

	  return 1;

        }

	return 1;

      },
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {
	alert("Not implemented");
      },

    }
    deck['002'] = { 
      img : "cards/HIS-002.svg" , 
      name : "Holy Roman Emperor" ,
      ops : 5 ,
      turn : 1 , 
      type : "normal" ,
      faction : "hapsburg" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        if (his_self.isBesieged("charles-v")) { return 0; }
        if (his_self.isCaptured("charles-v")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let ck = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
	let ck_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "charles-v", ck);
	let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);
	
        his_self.playerSelectSpaceWithFilter(

	  "Select Destination for Charles V: ",

	  function(space) {
		if (
		  space.home === "hapsburg" &&
		  !his_self.isSpaceControlled(space, "hapsburg")
	        ) {
		  return 1;
	        }
		return 0;
	  },

	  function(spacekey) {

		if (ak === ck && ak !== "") {

		  let msg = "Move Duke of Alva with Charles V?";
    		  let html = '<ul>';
        	  html += '<li class="option" id="yes">yes</li>';
        	  html += '<li class="option" id="no">no</li>';
    		  html += '</ul>';

    		  his_self.updateStatusWithOptions(msg, html);

	          $('.option').off();
	          $('.option').on('click', function () {
	            let action = $(this).attr("id");
		    if (action === "yes") {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ak_key + "\t" + ak_idx + "\t" + "land" + spacekey);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    } else {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    }
		  });

		} else {
		  his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		  his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		  his_self.endTurn();
		}

	  },

	  null

	);

        return 0;
      },
    }
    deck['003'] = { 
      img : "cards/HIS-003.svg" , 
      name : "Six Wives of Henry VIII" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "england" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['004'] = { 
      img : "cards/HIS-004.svg" , 
      name : "Patron of the Arts" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "french" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.leaders.francis_i == 1) {
	  if (!his_self.isCaptured("france", "francis-i")) { return 1; }
	}
	return 0;
      },
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("patron-of-the-arts");
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "patron-of-the-arts") {

          his_self.game.queue.splice(qe, 1);

	  let roll = his_self.rollDice(6);

	  his_self.updateLog("France rolls " + roll + " for Patron of the Arts");

	  if (his_self.isSpaceControlled("milan", "france")) {
	    his_self.updateLog("French control Milan - roll adjusted to 6");
	    roll = 6;
	  };

	  //
	  // France wins 1 VP
	  //
	  if (roll >= 3) {
	    if (his_self.game.state.french_chateaux_vp < 6) {
	      his_self.updateLog("SUCCESS: France gains 1VP from Patron of the Arts");
	      his_self.game.state.french_chateaux_vp++;
              his_self.displayVictoryPoints();
	    }
	  }

          return 1;

        }

	return 1;
      },
    }
    if (this.game.players.length == 2) {
      deck['005'] = { 
        img : "cards/HIS-005.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" ,
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      }
    } else {
      deck['005'] = { 
        img : "cards/HIS-005-2P.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" , 
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      }
    }
    deck['006'] = { 
      img : "cards/HIS-006.svg" , 
      name : "Leipzig Debate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" , 
      faction : "papacy" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

        his_self.game.state.tmp_papacy_may_specify_debater = 1;
        his_self.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 1;

	if (his_self.game.player === p) {

          let msg = "Select Language Zone for Theological Debate:";
          let html = '<ul>';

          if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
            html += '<li class="option" style="" id="german">German</li>';
          }
          if (his_self.returnDebatersInLanguageZone("french", "france")) { 
            html += '<li class="option" style="" id="french">French</li>';
          }
          if (his_self.returnDebatersInLanguageZone("english", "france")) { 
            html += '<li class="option" style="" id="english">English</li>';
          }
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let language_zone = $(this).attr("id");

            let msg = "Leigzip Debate Format?";
            let html = '<ul>';
            html += '<li class="option" id="select">Pick My Debater</li>';
            if (1 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
              html += '<li class="option" id="prohibit">Prohibit Protestant Debater</li>';
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {

              let opt = $(this).attr("id");

	      if (opt === "select") {

                let msg = "Select Uncommitted Papal Debater:";
                let html = '<ul>';
		for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		  let d = his_self.game.state.debaters[i];
		  if (d.faction === "papacy") {
            	    html += `<li class="option" id="${i}">${d.name}</li>`;
		  }
		}
		html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
  
                $('.option').off();
                $('.option').on('click', function () {
                  let selected_papal_debater = $(this).attr("id");
	          his_self.addMove("theological_debate");
        	  his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	          his_self.addMove("SETVAR\tstate\ttheological_debate\tselected_papal_debater\t"+selected_papal_debater);
	          his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted");
		  his_self.endTurn();
		});
	
	      } else {

                let msg = "Prohibit Protestant Debater:";
                let html = '<ul>';
		for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		  let d = his_self.game.state.debaters[i];
		  if (d.faction !== "papacy" && d.language_zone === language_zone) {
            	    html += `<li class="option" id="${i}">${d.name}</li>`;
		  }
		}
		html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
  
                $('.option').off();
                $('.option').on('click', function () {
                  let prohibited_protestant_debater = $(this).attr("id");
	          his_self.addMove("theological_debate");
        	  his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	          his_self.addMove("SETVAR\tstate\ttheological_debate\tprohibited_protestant_debater\t"+prohibited_protestant_debater);
	          his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted");
		  his_self.endTurn();
		});
	
	      }
	    });
	  });

	} else {
	  his_self.updateStatus("Papacy calling a Theological Debate");
	}

	return 0;
      },

    }

    deck['007'] = { 
      img : "cards/HIS-007.svg" , 
      name : "Here I Stand" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      faction : "protestant" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.leaders.luther == 1) { return 1; }
	if (Object.keys(his_self.game.deck[0].discards).length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player === p) {

	  let msg = "Retrieve Card from Discard Pile: ";
          let html = '<ul>';
	  for (let key in his_self.game.deck[0].discards) {
            html += '<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let card = $(this).attr("id");

	    let msg = "Play or Hold Card? ";
            let html = '<ul>';
            html += '<li class="option" id="play}">play card</li>';
            html += '<li class="option" id="hold}">hold card</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action == "play") {

		his_self.addMove("card\tprotestant\t"+card);
		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      } else {

		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      }

	    });
	  });
	}

	return 0;
      },
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : '007', html : `<li class="option" id="007">Here I Stand (assign Luther)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "debate") {
	  if (his_self.game.state.leaders.luther == 1) {
	    if (player === his_self.returnPlayerOfFaction("protestant")) {
	      if (his_self.canPlayerPlayCard("protestant", "007")) { return 1; }
	    }
	  }
	}
	return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu === "debate") {
	  his_self.addMove("discard\tprotestant\t007");
	  his_self.addMove("NOTIFY\tHere I Stand played to substitute Luther into the Theological Debate");
	  his_self.addMove("here_i_stand_response");
	  his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "here_i_stand_event") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // first option not implemented
	  //
          let card = mv[1];

	  if (his_self.game.deck[0].discards[card]) {

	    let p = his_self.returnPlayerOfFaction("protestant");

	    //
	    // player returns to hand
	    //
	    if (his_self.game.player === p) {
              let fhand_idx = this.returnFactionHandIdx(p, faction);
	      his_self.game.deck[0].fhand[fhand_idx].push(card);
	    }

	    //
	    // everyone removes from discards
	    //
	    delete his_self.game.deck[0].discards[card];

	  }

	  return 1;
	}

        if (mv[0] === "here_i_stand_response") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // second option -- only possible if Wartburg not in-play
	  //
	  if (his_self.game.state.events.wartburg == 0) {

	    his_self.updateLog("Luther accepts the Debate Challenge - Here I Stand");


	    //
	    // existing protestant debater is committed, but de-activated (bonus does not apply)
	    //
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      let d = his_self.game.state.debaters[i];
	      if (his_self.game.state.theological_debate.attacker === "papacy") {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_defender_debater) {
	  	    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_defender_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      } else {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_attacker_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_attacker_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      }
	    }


	    let is_luther_committed = 0;
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      if (his_self.game.state.debaters[i].key === "luther-debater") {
		if (his_self.game.state.debaters[i].committed == 1) { is_luther_commited = 1; }
	      }
	    }


	    if (his_self.game.state.theological_debate.attacker === "papacy") {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      } else {
                his_self.game.state.theological_debate.round2_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      }
	    } else {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
	      } else {
                his_self.game.state.theological_debate.round2_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
	      }
	    }
	  }

	  return 1;

        }

	return 1;
      },
    }
    // 95 Theses
    deck['008'] = { 
      img : "cards/HIS-008.svg" , 
      name : "Luther's 95 Theses" ,
      ops : 0 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeck : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	// set player to protestant
	player = his_self.returnPlayerOfFaction("protestant");

	let players_to_go = [];
	for (let i = 1; i < his_self.game.players.length; i++) {
	  if (i != his_self.returnPlayerOfFaction("protestant")) {
	    players_to_go.push(i);
	  }
	}

	// protestant gets 2 roll bonus at start
	his_self.game.state.tmp_protestant_reformation_bonus = 2;
	his_self.game.state.tmp_protestant_reformation_bonus_spaces = [];
	his_self.game.state.tmp_catholic_reformation_bonus = 0;
	his_self.game.state.tmp_catholic_reformation_bonus_spaces = [];
	his_self.game.state.tmp_reformations_this_turn = [];

	his_self.game.queue.push("hide_overlay\ttheses");
        his_self.game.queue.push("ACKNOWLEDGE\tThe Reformation has begun!");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("STATUS\tProtestants selecting reformation targets...\t"+JSON.stringify(players_to_go));
	his_self.game.queue.push("show_overlay\ttheses");
        his_self.convertSpace("protestant", "wittenberg");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addReformer("protestant", "wittenberg", "luther-reformer");
        his_self.displaySpace("wittenberg");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "catholic_counter_reformation") {

          let player = parseInt(mv[1]);
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
          his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
	        space.religion === "protestant" &&
	        (space.language === language_zone || language_zone == "all") &&
	        !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
	        ( 
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
		  ||
		  space.university == 1
		  ||
		  his_self.doesSpaceContainCatholicReformer(space)
	        )
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );


	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

            his_self.playerSelectSpaceWithFilter(

	      "Select Counter-Reformation Attempt",

	      //
	      // protestant spaces adjacent to catholic 
	      //
	      function(space) {
		if (
		  space.religion === "protestant" &&
		  (space.language === language_zone || language_zone == "all") &&
		  !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch counter_reformation
	      //
	      function(spacekey) {
	  	his_self.updateStatus("Counter-Reformation attempt in "+spacekey);
		his_self.addMove("counter_reformation\t"+spacekey+"\t"+language_zone);
		let name = his_self.game.spaces[spacekey].name;
		his_self.addMove("counter_or_acknowledge\tCounter-Reformation Attempt in "+spacekey+"\tcatholic_counter_reformation\t"+name);
        	his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null, // cancel func

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tCatholic Counter-Reformation - no valid targets");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Catholic Counter-Reformation in Process");
	  }

          return 0;

        }

        if (mv[0] == "protestant_reformation") {

          let player = parseInt(mv[1]);
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
          his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
		space.religion === "catholic" &&
		!his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		(space.language === language_zone || language_zone == "all") &&
		(
			his_self.isSpaceAdjacentToReligion(space, "protestant")
			||
			his_self.doesSpaceContainProtestantReformer(space)
			||
			his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		)
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );

	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

            his_self.playerSelectSpaceWithFilter(

	      "Select Reformation Target",

	      //
	      // catholic spaces adjacent to protestant 
	      //
	      function(space) {
		if (
		  space.religion === "catholic" &&
		  !his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		  (space.language === language_zone || language_zone == "all") &&
		  his_self.isSpaceAdjacentToReligion(space, "protestant")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch reformation
	      //
	      function(spacekey) {
	  	his_self.updateStatus("Reformation attempt in "+spacekey);
		his_self.addMove("reformation\t"+spacekey+"\t"+language_zone);
		his_self.addMove("counter_or_acknowledge\tProtestant Reformation Attempt in "+spacekey+"\tprotestant_reformation\t"+spacekey);
        	his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null ,

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tProtestant Reformation - no valid targets");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Protestant Reformation...");
	  }

          return 0;

        }

	return 1;
      }
    }
    deck['009'] = { 
      img : "cards/HIS-009.svg" , 
      name : "Barbary Pirates" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// algiers space is now in play
	his_self.game.spaces['algiers'].home = "ottoman";
	his_self.game.spaces['algiers'].political = "ottoman";
	his_self.addRegular("ottoman", "algiers", 2);
	his_self.addCorsair("ottoman", "algiers", 2);
	his_self.game.state.events.barbary_pirates = 1;
	his_self.game.state.events.ottoman_piracy_enabled = 1;
	his_self.game.state.events.ottoman_corsairs_enabled = 1;

	return 1;
      },

    }
    deck['010'] = { 
      img : "cards/HIS-010.svg" , 
      name : "Clement VII" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 1;
	return 1;
      },

    }
    deck['011'] = { 
      img : "cards/HIS-011.svg" , 
      name : "Defender of the Faith" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let papacy = his_self.returnPlayerOfFaction("papacy");

	// deal extra card if player is england
	let player = his_self.returnPlayerOfFaction("england");

	if (player == his_self.game.player) {
	  let faction_hand_idx = his_self.returnFactionHandIdx(player, "england");   
 	  his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.state.players_info[player-1].factions[faction_hand_idx]);
	  his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
        }
	// three counter-reformation attempts
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);

	return 1;
      },
    }
    deck['012'] = { 
      img : "cards/HIS-012.svg" , 
      name : "Master of Italy" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let f = {};
	if (!f[his_self.game.spaces['genoa'].political]) { f[his_self.game.spaces['genoa'].political] = 1; }
	else { f[his_self.game.spaces['genoa'].political]++ }

	for (let key in f) {
	  if (f[key] >= 4) {
	    his_self.gainVictoryPoints(faction, 3);
	  }
	  if (f[key] == 3) {
	    his_self.gainVictoryPoints(faction, 2);
	  }
	  if (f[key] == 2) {
	    let faction_hand_idx = his_self.returnFactionHandIdx(player, key);
 	    his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.state.players_info[player-1].factions[faction_hand_idx]);
	    his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
	  }
	}

	his_self.displayVictoryTrack();

      }
    }
    if (this.game.players.length == 2) {
      deck['013'] = { 
        img : "cards/HIS-013-2P.svg" , 
        name : "Schmalkaldic League" ,
        ops : 2 ,
        turn : 1 ,
        type : "mandatory" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        onEvent : function(his_self, faction) {
          his_self.game.state.events.schmalkaldic_league = 1;
          his_self.game.state.activated_powers["papacy"].push("hapsburg");
	  return 1;
        }
      }
    } else {
      deck['013'] = { 
        img : "cards/HIS-013.svg" , 
        name : "Schmalkaldic League" ,
        ops : 2 ,
        turn : 1 ,
        type : "mandatory" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        onEvent : function(his_self, faction) {
          his_self.game.state.events.schmalkaldic_league = 1;
	  return 1;
        }
      }
    }
    deck['014'] = { 
      img : "cards/HIS-014.svg" , 
      name : "Paul III" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.removeCardFromGame('010'); // remove clement vii
	his_self.game.state.leaders.paul_iii = 1;
	return 1;
      },

    }
    deck['015'] = { 
      img : "cards/HIS-015.svg" , 
      name : "Society of Jesus" ,
      ops : 2 ,
      turn : 5 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {

	let papacy = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player === papacy) {
	  his_self.game.state.events.papacy_may_found_jesuit_universities = 1;
	  return 0;
	}

	return 0;
      }
    }
    deck['016'] = { 
      img : "cards/HIS-016.svg" , 
      name : "mandatory" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders['luther'] = 0;
	his_self.game.state.leaders['calvin'] = 1;

	let x = his_self.returnSpaceOfPersonage("protestant", "luther-reformer");
	let y = his_self.returnIndexOfPersonageInSpace("protestant", "luther-reformer", x);

	if (y > -1) {
	  his_self.game.spaces[x].units["protestant"].splice(y, 1);
	}

	for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	  if (his_self.game.state.debaters[i].type === "luther-debater") {
	    his_self.game.state.debaters.splice(i, 1);
	  }
	}

	his_self.updateLog("Luther dies and is replaced by Calvin");

	return 0;
      }
    }
    deck['017'] = { 
      img : "cards/HIS-017.svg" , 
      name : "Council of Trent" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.state.council_of_trent = {};
	his_self.game.state.council_of_trent.papacy = {};
	his_self.game.state.council_of_trent.protestants = {};

	his_self.game.queue.push("hide_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_results");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_protestants");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_papacy");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "council_of_trent_add_debaters") {

          his_self.game.queue.splice(qe, 1);
	  
	  let faction = mv[1];
	  let debaters = mv[2];

	  if (faction === "papacy") {
	    his_self.game.state.council_of_trent.papacy.debaters = JSON.parse(debaters);
	  } else {
	    his_self.game.state.council_of_trent.protestants.debaters = JSON.parse(debaters);
	  }

console.log("COUNCIL OF TRENT: " + JSON.stringify(his_self.game.state.council_of_trent));

	  return 1;

	}

        if (mv[0] === "council_of_trent_papacy") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("papacy");

	  return 0;

	}

        if (mv[0] === "council_of_trent_results") {

          his_self.game.queue.splice(qe, 1);
	  //
	  // this adds stuff to the queue -- so we pass through
	  //
	  his_self.council_of_trent_overlay.render("results");

	  return 1;

	}

        if (mv[0] === "council_of_trent_protestants") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("protestants");

	  return 0;

        }

	return 1;
      },
    }
    deck['018'] = { 
      img : "cards/HIS-018.svg" , 
      name : "Dragu" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
    }
    deck['019'] = { 
      img : "cards/HIS-019.svg" , 
      name : "Edward VI" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.edward_vi = 1;
	return 1;
      },
    }

    deck['020'] = { 
      img : "cards/HIS-020.svg" , 
      name :"Henry II" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.francis_i = 0;
	his_self.game.state.leaders.henry_ii = 1;
	return 1;
      },
    }
    deck['021'] = { 
      img : "cards/HIS-021.svg" , 
      name : "Mary I" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 1;
	his_self.removeCardFromGame('021');
	return 1;
      },
    }
    deck['022'] = { 
      img : "cards/HIS-022.svg" , 
      name : "Julius III" ,
      ops : 2 ,
      turn : 7 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.game.state.leaders.paul_iii = 0;
	his_self.game.state.leaders.julius_iii = 1;
	his_self.removeCardFromGame('010');
	his_self.removeCardFromGame('014');
	return 1;
      },
    }
    deck['023'] = { 
      img : "cards/HIS-023.svg" , 
      name : "Elizabeth I" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 0;
	his_self.game.state.leaders.elizabeth_i = 1;
	his_self.removeCardFromGame('019');
	his_self.removeCardFromGame('021');
	return 1;
      },
    }
    deck['024'] = { 
      img : "cards/HIS-024.svg" , 
      name : "Arquebusiers" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }

          return { faction : f , event : 'arquebusiers', html : `<li class="option" id="arquebusiers">arquebusiers (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
        }
        return 1;
      },
    }
    deck['025'] = { 
      img : "cards/HIS-025.svg" , 
      name : "Field Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'field_artillery', html : `<li class="option" id="field_artillery">field artillery (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
	  if (faction === "france" || faction === "ottoman") {
	    player.tmp_roll_bonus = 3;
	  }
        }
        return 1;
      },
    }
    deck['026'] = { 
      img : "cards/HIS-026.svg" , 
      name : "Mercenaries Bribed" ,
      ops : 3 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'mercenaries_bribed', html : `<li class="option" id="mercenaries_bribed">mercenaries bribed (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alet("Mercenaries Bribed...");

          //player = his_self.returnPlayerOfFaction(faction);
	  //if (faction === "france" || faction === "ottoman") {
	  //  player.tmp_roll_bonus = 3;
	  //}
        }
        return 1;
      },
    }
    deck['027'] = { 
      img : "cards/HIS-027.svg" , 
      name : "Mercenaries Grow Restless" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'mercenaries_grow_restless', html : `<li class="option" id="mercenaries_grow_restless">mercenaries grow restless (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
	  alet("Mercenaries Grow Restless...");

          //player = his_self.returnPlayerOfFaction(faction);
	  //if (faction === "france" || faction === "ottoman") {
	  //  player.tmp_roll_bonus = 3;
	  //}
        }
        return 1;
      },
    }
    deck['028'] = { 
      img : "cards/HIS-028.svg" , 
      name : "Siege Mining" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'siege_mining', html : `<li class="option" id="siege_mining">siege mining (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault" && his_self.game.player === his_self.game.state.active_player) {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_bonus = 3;
	  }
        }
        return 1;
      },
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'surprise_attack', html : `<li class="option" id="surprise_attack">surprise attack (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_first = 1;
	  }
        }
        return 1;
      },
    }
    deck['030'] = { 
      img : "cards/HIS-030.svg" , 
      name : "Tercios" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : 'tercois', html : `<li class="option" id="tercois">tercois (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('30')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alert("tercois is complicated...");
        }
        return 1;
      },
    }
    deck['031'] = { 
      img : "cards/HIS-031.svg" , 
      name : "Foul Weather" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['032'] = { 
      img : "cards/HIS-032.svg" , 
      name : "Gout" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "move") {
	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : 'gout', html : '<li class="option" id="gout">play gout</li>' };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "move") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "move") {
          his_self.endTurn();
          his_self.updateLog("looks like someone got gout");
        }
        return 0;
      },
    }
    deck['033'] = { 
      img : "cards/HIS-033.svg" , 
      name : "Landsknechts" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : 'landsknechts', html : `<li class="option" id="landsknechts">landsknechts (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("france", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "landsknechts") {

          let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (faction === "hapsburg") {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, "hapsburg",
	      function(space) {
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("hapsburg", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  } else {
	    if (faction === "ottoman") {
              his_self.playerRemoveUnitsInSpaceWithFilter("mercenary", 2, faction,
	        function(space) {

//		  if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
//		  if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
//		  if (!his_self.isSpaceFriendly(space.key)) { return 1; }

	        } ,
	        null ,
	        null ,
	        true
	      );

	    } else {
              his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction,
	        function(space) {
		  if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		  if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
		  if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	        } ,
	        null ,
	        null ,
	        true
	      );
	    }
	  }

          his_self.game.queue.splice(qe, 1);
	  return 0;

        }

	return 1;
      },
    }
    deck['034'] = { 
      img : "cards/HIS-034.svg" , 
      name : "Professional Rowers" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['035'] = { 
      img : "cards/HIS-035.svg" , 
      name : "Siege Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : 'swiss_mercenaries', html : `<li class="option" id="swiss_mercenaries">swiss mercenaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("france", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "swiss_mercenaries") {

          let faction = mv[1];
          let num = parseInt(mv[2]);
          his_self.game.queue.splice(qe, 1);

	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {

            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", num, faction,
	      function(space) {
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	  return 0;
        }

	return 1;
      },
    }
    deck['037'] = { 
      img : "cards/HIS-037.svg" , 
      name : "The Wartburg" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, card="") {
        if (menu == "event") {

	  let p = his_self.returnPlayerOfFaction();

          if (his_self.game.state.leaders.luther !== 1) { return {}; }
          if (card === "") { return {}; }
          if (!his_self.game.deck[0]) { return {}; }

	  //
	  // card evented
	  //
	  let cardobj = his_self.game.deck[0].cards[card];

	  //
	  // cannot cancel non-papal home cards
	  //
	  if (card === "001" || card == "002" || card == "003" || card == "004") { return {}; }

	  //
	  // cannot cancel these three types of cards
	  //
	  if (cardobj.type === "response") { return {}; }
	  if (cardobj.type === "mandatory") { return {}; }
	  if (cardobj.type === "combat") { return {}; }
	  
          return { faction : "protestant" , event : 'wartburg', html : `<li class="option" id="wartburg">jwartburg (protestant)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "event") {
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "event") {
          his_self.addMove("wartburg");
	  his_self.endTurn();
	  his_self.updateStatus("wartburg acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "wartburg") {

	  //
	  // 
	  //
	  his_self.game.state.events.wartburg = 1;
	  his_self.commitDebater("protestant", "luther-debater");

	  his_self.updateLog("Wartburg Updated!");
          his_self.game.queue.splice(qe, 1);

	  return 1;

        }

	return 1;
      },
    }
    deck['038'] = { 
      img : "cards/HIS-038.svg" , 
      name : "Halley's Comet" ,
      ops : 2 ,
      turn : 3 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['039'] = { 
      img : "cards/HIS-039.svg" , 
      name : "Ausburg Confession" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "MachiaveIIi: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	if (player == his_self.game.player) {

	  let powers = his_self.returnImpulseOrder();
	  let msg = "Declare War on which Power?";

          let html = '<ul>';
	  for (let i = 0; i < powers.length; i++) {
            html += '<li class="option" id="${powers[i]}">${powers[i]}</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

            his_self.addMove("ops\t"+faction+"\t"+"004"+"\t"+2);
            his_self.addMove("declare_war\t"+faction+"\t"+action);
	    his_self.endTurn();

	  });

          return 0;

        }

	return 1;
      },
    }

    deck['041'] = { 
      img : "cards/HIS-041.svg" , 
      name : "Marburg Colloquy" ,
      ops : 5 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['042'] = { 
      img : "cards/HIS-042.svg" , 
      name : "Roxelana" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['043'] = { 
      img : "cards/HIS-043.svg" , 
      name : "Zwingli Dons Armor" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['044'] = { 
      img : "cards/HIS-044.svg" , 
      name : "Affair of the Placards" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['045'] = { 
      img : "cards/HIS-045.svg" , 
      name : "Clavin Expelled" ,
      ops : 1 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Insitutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['047'] = { 
      img : "cards/HIS-047.svg" , 
      name : "Copernicus" ,
      ops : 6 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

        let home_spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].home === faction) {
	    }
	  }
	);

	let total = home_spaces.length;
	let count = 0;
	let double_vp = 0;

	for (let i = 0; i < home_spaces.length; i++) {
	  if (his_self.game.spaces[home_spaces[i]].religion === "protestant") { count++; }
	}

	if (count >= (total/2)) {
	  double_vp = 1;
	}

console.log(faction + " has " + total + " home spaces, protestant count is " + count + " for " + (double_vp+1) + " VP");

	//
	//
	//
	if (double_vp == 1) {

	  // faction will gain when counted
	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;
	  his_self.displayVictoryTrack();

	} else {

	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;

	  let p = his_self.returnPlayerOfFaction(faction);

	  //
	  // player processes and adds move / ends turn
	  //
	  if (his_self.game.player == p) {

	    let msg = "Which would you prefer?";
    	    let html = '<ul>';
                html += '<li class="option" id="draw">draw 1 card</li>';
                html += '<li class="option" id="discard">protestants discard</li>';
    		html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      let action = $(this).attr("id");

	      if (action === "draw") {

	 	//	
	 	// deal a card	
	 	//
	        let cardnum = 1;

                his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
                his_self.addMove("DEAL\t1\t"+p+"\t"+(cardnum));
		his_self.endTurn();

	      } else {

                his_self.addMove("discard_random\tprotestant\t1");
		his_self.endTurn();

	      }
	    });

	  }
	}

	return 0;

      },

    }
    deck['048'] = { 
      img : "cards/HIS-048.svg" , 
      name : "Galleons" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['049'] = { 
      img : "cards/HIS-049.svg" , 
      name : "Huguenot Raiders" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['050'] = { 
      img : "cards/HIS-050.svg" , 
      name : "Mercator's Map" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['051'] = { 
      img : "cards/HIS-051.svg" , 
      name : "Michael Servetus" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.updateLog(faction + " gets 1 VP from Michael Servetus");
	his_self.game.state.events.michael_servetus = faction;
	his_self.game.queue.push("discard_random\tprotestant\t1");

      }
    }
    deck['052'] = { 
      img : "cards/HIS-052.svg" , 
      name : "Michelangelo" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['053'] = { 
      img : "cards/HIS-053.svg" , 
      name : "Plantations" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['054'] = { 
      img : "cards/HIS-054.svg" , 
      name : "Potosi Silver Mines " ,
      ops : 3 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['055'] = { 
      img : "cards/HIS-055.svg" , 
      name : "Jesuit Education" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['056'] = { 
      img : "cards/HIS-056.svg" , 
      name : "Ppal Inquistion" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['057'] = { 
      img : "cards/HIS-057.svg" , 
      name : "Philip of Hesse's Bigamy" ,
      ops : 2 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['058'] = { 
      img : "cards/HIS-058.svg" , 
      name : "Spanish Inquisition" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['059'] = { 
      img : "cards/HIS-059.svg" , 
      name : "Lady Jane Grey" ,
      ops : 3 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['060'] = { 
      img : "cards/HIS-060.svg" , 
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['061'] = { 
      img : "cards/HIS-061.svg" , 
      name : "Mary Defies Council" ,
      ops : 1 ,
      turn : 7 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['062'] = { 
      img : "cards/HIS-062.svg" , 
      name : "Card" ,
      ops : 2 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['063'] = { 
      img : "cards/HIS-063.svg" , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['064'] = { 
      img : "cards/HIS-064.svg" , 
      name : "Pilgrimage of Grace" ,
      ops : 3 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['065'] = { 
      img : "cards/HIS-065.svg" , 
      name : "A Mighty Fortress" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.isDebaterCommitted("luther-debater")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	player = his_self.returnPlayerOfFaction("protestant");

	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        his_self.game.queue.push("ACKNOWLEDGE\tThe Protestants - A Mighty Fortress - 6 Reformation Attempts in German Zone");
	his_self.commitDebater("protestant", "luther-debater");

	return 1;
      },
    }
    deck['066'] = { 
      img : "cards/HIS-066.svg" , 
      name : "Akinji Raiders" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {

	let enemies = his_self.returnEnemies("ottoman");
	let neighbours = [];
	let spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
		    return 1;
		  }
	        }
	      }
	    }
	  }
        );

	//
	// two hops !
	//
	for (let i = 0; i < spaces.length; i++) {
	  let s = his_self.game.spaces[spaces[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	  }
	}
	for (let i = 0; i < neighbours.length; i++) {
	  let s = his_self.game.spaces[neighbours[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	}

	//
	// enemy control any of these neighbours?
	//
	for (let i = 0; i < neighbours.length; i++) {
	  for (let ii = 0; ii < enemies.length; ii++) {
	    if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	      return 1;
	    }
	  }
	}

	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	let target_which_faction = [];

	if (his_self.game.player == p) {

	  let enemies = his_self.returnEnemies("ottoman");
	  let neighbours = [];
	  let spaces = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
	  	    return 1;
		  }
	        }     
	      }
	    }
	  });

	  //
	  // two hops !
	  //
	  for (let i = 0; i < spaces.length; i++) {
	    let s = his_self.game.spaces[spaces[i]];
	    for (let ii = 0; ii < s.neighbours.length; ii++) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	  for (let i = 0; i < neighbours.length; i++) {
	    let s = his_self.game.spaces[neighbours[i]];
	    for (let ii = 0; ii < neighbours.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[ii], "ottoman")) {
	        if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	      }
	    }
	  }

	  //
	  // enemy control any of these neighbours?
	  //
	  for (let i = 0; i < neighbours.length; i++) {
	    for (let ii = 0; ii < enemies.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	        if (!target_which_faction.includes(enemies[ii])) { target_which_faction.push(enemies[ii]); }
	      }
	    }
	  }
	}

        let msg = "Steal Random Card from Which Faction?";
        let html = '<ul>';
        for (let i = 0; i < target_which_faction.length; i++) {
           html += '<li class="option" id="${target_which_faction}">${target_which_faction[i]}</li>';
	}
	html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	$('.option').off();
	$('.option').on('click', function () {

	  let action = $(this).attr("id");
	  his_self.addMove("pull_card\tottoman\t"+action);
          his_self.endTurn();

	});

        return 0;
      }
    }
    deck['067'] = { 
      img : "cards/HIS-067.svg" , 
      name : "Anabaptists" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.selectPlayerOfFaction(faction);
	if (p == his_self.game.player) {
          his_self.playerSelectSpaceWithFilter(

	    "Select First Space to Convert", 

	    function(space) {
	      if (space.religion === "protestant" && his_self.isOccupied(space) == 0 && his_self.isElectorate(space)) {
		return 1;
	      }
	      return 0;
	    },

	    function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let first_choice = space.key;


              his_self.playerSelectSpaceWithFilter(

	        "Select Second Space to Convert", 

	        function(spacekey) {
	          if (spacekey !== first_choice && his_self.game.spaces[spacekey].religion === "protestant" && his_self.isOccupied(his_self.game.spaces[spacekey]) == 0 && his_self.isElectorate(spacekey)) {
		    return 1;
	          }
	          return 0;
	        },

	        function(space) {

	          let second_choice = space.key;

		  his_self.addMove("convert\t"+second_choice+"\tcatholic");
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();

	        },
	      );
	    }
	  );
	}
	return 0;
      }
    }
    deck['068'] = { 
      img : "cards/HIS-068.svg" , 
      name : "Andrea Doria" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	if (faction !== f) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	his_self.deactivateMinorPower(f, "genoa");
	his_self.activateMinorPower(faction, "genoa");
	return 1;
      },
    }
    deck['069'] = { 
      img : "cards/HIS-069.svg" , 
      name : "Auld Alliance" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
        if (faction === "france") {
	  return 1;
	}
        if (faction === "england" && f !== "") {
	  return 1;
	} 
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
	if (faction === "england") {
 	  if (f !== "") {
	    his_self.deactivateMinorPower(f, "scotland");
	  }
	}
	if (faction === "france") {
	  if (f == "") {
	    his_self.activateMinorPower(faction, "scotland");
	  } else {
	    if (f === "france") {


	      let p = his_self.returnPlayerOfFaction("france");
	      if (p === his_self.game.player) {

	        //
	        // add upto 3 new French regulars in any Scottishhome space under French control that isnot under siege.
	        //
   	        his_self.playerSelectSpaceWithFilter(

	  	  "Select Unbesieged Scottish Home Space Under French Control", 

		  function(space) {
		    if (space.home == "scotland") {
		      if (his_self.isSpaceControlled(space, "france")) {
		        if (!space.besieged) {
		          return 1;
		        }
		      }
		    }
		  },

		  function(spacekey) {
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
		    his_self.endTurn();
		  }
	        );

		return 0;

	      } else {
		return 0;
	      }
	    } else {
	      his_self.deactivateMinorPower(f, "scotland");
	    }
	  }
	}
	return 1;
      },
    }
    deck['070'] = { 
      img : "cards/HIS-070.svg" , 
      name : "Charles Bourbon" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Unbeseiged Space You Control",

	    function(space) {
	      if (space.beseiged) { return 0; }
	      if (his_self.isSpaceControlled(space, faction)) { return 1; }
	      return 0;
	    },

	    function(spacekey) {
	      let space = his_self.game.spaces[spacekey];
	      his_self.addMove("add_army_leader\t"+faction+"\t"+spacekey+"\t"+"renegade");
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
	      his_self.endTurn();
	    }
	  );
	}

	return 0;
      },
    }
    deck['071'] = { 
      img : "cards/HIS-071.svg" , 
      name : "City State Rebels" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Space to Target",

	    function(space) {

	      // captured key
	      if (space.home === "independent" && space.political != space.home) { return 1; }

	      // captured non-allied home
	      if (space.home !== space.political && space.political !== "") {
		if (!space.beseiged) {
	          if (!his_self.areAllies(space.home, space.political)) { return 1; }
	        }
	      }

	      // electorate under hapsburg control
	      if (his_self.game.state.events.schmalkaldic_league == 1) {
		if (his_self.isElectorate(space.key)) {
		  if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
		}
	      }

	      return 0;
	    },

	    function(spacekey) {
	      his_self.addMove("city-state-rebels\t"+faction+"\t"+spacekey);
	      his_self.endTurn();
	    }
	  );
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "city-state-rebels") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let respondent = his_self.returnFactionControllingSpace(spacekey);

          his_self.game.queue.splice(qe, 1);

          his_self.updateLog(faction + " plays City State Rebels against " + spacekey);

	  let hits = 0;
	  for (let i = 0; i < 5; i++) {
	    let roll = his_self.rollDice(6);
	    if (roll >= 5) {
	      hits++;
	    }
	  }

	  //
	  // TODO, return zero and add choice of unit removal, for now remove army before navy
	  //
	  let p = his_self.returnPlayerOfFaction(respondent);	  
	  if (his_self.game.player == p) {
	    his_self.addMove("finish-city-state-rebels\t"+faction+"\t"+respondent+"\t"+spacekey);
	    his_self.playerAssignHits(faction, spacekey, hits, 1);
	  }
	  
	  return 0;
        }


	if (mv[0] === "finish-city-state-rebels") {

	  let faction    = mv[1];
	  let respondent = mv[2];
	  let spacekey   = mv[3];
	  let space      = his_self.game.spaces[spacekey];

	  // do land or naval units remain
	  let anything_left = 0; 
	  for (let i = 0; i < space.units[respondent].length; i++) {
	    if (!space.units[respondent][i].personage) { anything_left = 1; }
	  }

	  if (!anything_left) {
            for (let i = 0; i < space.units[f].length; i++) {
              his_self.captureLeader(faction, respondent, spacekey, space.units[f][i]);
              space.units[f].splice(i, 1);
              i--;
            }
          }

	  let who_gets_control = his_self.returnAllyOfMinorPower(space.home);
	  space.political = who_gets_control;

	  // add 1 regular - to home minor ally if needed
          this.addRegular(space.home, space.key, 1);

	  return 1;
	}

	return 1;

      },
    }
    deck['072'] = { 
      img : "cards/HIS-072.svg" , 
      name : "Cloth Price Fluctuate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.isSpaceControlled("calais", "england") && his_self.isSpaceControlled("antwerp", "hapsburg")) {

          let p1 = his_self.returnPlayerOfFaction("england");
          let p2 = his_self.returnPlayerOfFaction("hapsburg");

          his_self.game.queue.push("cloth-prices-fluctuate-option1\t"+faction);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p1+"\t"+"england");
          his_self.game.queue.push("DEAL\t1\t"+p1+"\t"+1);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p2+"\t"+"hapsburg");
          his_self.game.queue.push("DEAL\t1\t"+p2+"\t"+1);

	} else {

          his_self.game.queue.push("cloth-prices-fluctuate-option2\t"+faction);

	}
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "cloth-prices-fluctuate-option1") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (faction === "ottoman") {

	    //
	    // place 2 cavalry in home space not under seige
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Seige",
	      function(space) {
	        if (space.beseiged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );

	  } else {

	    //
	    // place 2 mercenaries in home space not under seige
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Seige",
	      function(space) {
	        if (space.beseiged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );
	  }
        }


        if (mv[0] == "cloth-prices-fluctuate-option2") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let f = his_self.returnFactionControllingSpace("antwerp");
	  if (f === "") { f = his_self.game.spaces["antwerp"].home; }

	  // f discards a card
          his_self.addMove("discard_random\t"+f+"\t"+1);

	  //
	  // add unrest
	  //
          his_self.playerSelectSpaceWithFilter(
	    "Add Unrest",
	    function(space) {
	      if (space.key == "antwerp") { return 1; }
	      if (space.key == "brussels") { return 1; }
	      if (space.key == "amsterdam") { return 1; }
	      if (space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "german") { return 1; }
	      return 0;
	    },
	    function(unrest_spacekey1) {
              his_self.addMove("unrest\t"+unrest_spacekey1);
              his_self.playerSelectSpaceWithFilter(
  	        "Add Unrest",
	        function(space) {
	          if (space.key == unrest_spacekey1) { return 1; }
	          if (space.key == "antwerp") { return 1; }
	          if (space.key == "brussels") { return 1; }
	          if (space.key == "amsterdam") { return 1; }
	          if (space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "german") { return 1; }
	        return 0;
	        },
	        function(unrest_spacekey2) {
                  his_self.addMove("unrest\t"+unrest_spacekey2);
	          his_self.endTurn();
	        }
              );
	    }
          );
	  return 0;
	}

	return 1;

      },
    }
    deck['073'] = { 
      img : "cards/HIS-073.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        ca.push(mp[i]);
	      } else {
	        cd.push(mp[i]);
	      }
	    }
	  }
	
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (ca.includes(action)) {
	      his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	    } else {
	      his_self.addMove("deactivate_minor_power\t"+faction+"\t"+action);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['074'] = { 
      img : "cards/HIS-074.svg" , 
      name : "Diplomatic Overture" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  // deal 2 cards to faction
	  his_self.game_queue.push("diplomatic-overturn\t"+faction);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "diplomatic-overturn") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == p) {

	    his_self.playerSelectFactionWithFilter(
	      "Select Faction to Give Card",
	      function(f) { if (f !== faction) { return 1; } },
	      function(recipient) {
 	        his_self.playerFactionSelectCardWithFilter(
	          faction,
	          "Select Card to Give Away",
	          function(card) { return 1; },
	          function(card) {
                    his_self.addMove("give_card\t"+recipient+"\t"+faction+"\t"+card);
	  	    his_self.endTurn();
	          }
	        );
	      }
	    );
	  }
	  return 0;
	}
	return 1;
      },
    }
    deck['075'] = { 
      img : "cards/HIS-075.svg" , 
      name : "Erasmus" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.game.state.round < 3) {

	  let player = his_self.returnPlayerOfFaction("protestant");

          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");

	} else {

	  let player = his_self.returnPlayerOfFaction("papacy");   

          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
	}

	return 1;
      },
    }
    deck['076'] = { 
      img : "cards/HIS-076.svg" , 
      name : "Foreign Recruits" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['077'] = { 
      img : "cards/HIS-077.svg" , 
      name : "Card" ,
      ops : "Fountain of Youth" ,
      turn : 2 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['078'] = { 
      img : "cards/HIS-078.svg" , 
      name : "Frederick the Wise" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");

	//
	// get wartburg card if in discards
	//
        if (his_self.game.deck[0].discards["037"]) {
	  delete his_self.game.deck[0].discards["037"];
	  if (his_self.game.player == p) {
            let fhand_idx = this.returnFactionHandIdx(p, faction);
	    his_self.game.deck[0].fhand[fhand_idx].push("037");
	  }
	}

	let res  = [];
	let res2 = [];

	res = his_self.returnNearestSpaceWithFilter(
	  "wittenberg",
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].religious == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  },
	  function(propagation_filter) {
	    return 1;
	  },
	  0,
	  1,
	);

	if (res.length == 1) {
	  res2 = his_self.returnNearestSpaceWithFilter(
	    "wittenberg",
	    function(spacekey) {
	      if (spacekey === res[0].key) { return 0; }
	      if (his_self.game.spaces[spacekey].religious == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	      return 0;
	    },
	    function(propagation_filter) {
	      return 1;
	    },
	    0,
	    1,
	  );
	}

	for (let i = 0; i < res.length; i++) {
	  res3.push(res[i]);
	}
	for (let i = 0; i < res2.length; i++) {
	  res3.push(res2[i]);
	}

	let msg = "Select Towns to Flip Protestant: ";
        let html = '<ul>';
        for (let i = 0; i < res3.length; i++) {
	  html += `<li class="option" id="${res3[i].key}">${res3[i].key}</li>`;
	}
        html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	let total_picked = 0;
	let picked = [];

	$('.option').off();
	$('.option').on('click', function () {

	  let action = $(this).attr("id");

	  if (!picked.includes(action)) {
	    picked.push(action);
	    total_picked++;
	    document.getElementById(action).remove();
	  }

	  if (total_picked >= 2) {
	    $('option').off();
	    for (let i = 0; i < 2; i++) {
	      his_self.addMove("convert" + "\t" + picked[i] + "\t" + "protestant");
	    }
	    his_self.endTurn();
	  }

	});
      },
    }
    deck['079'] = { 
      img : "cards/HIS-079.svg" , 
      name : "Fuggers" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	his_self.game.state.events.fuggers = faction;

	return 1;
      },
    }
    deck['080'] = { 
      img : "cards/HIS-080.svg" , 
      name : "Gabelle Revolt" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == p) {

	  let space1 = "";
	  let space2 = "";

          his_self.playerSelectSpaceWithFilter(
	    "Select 1st Unoccupied French Home Space: ",
	    function(space) {
	      if (
		space.home === "france" &&
		!his_self.isOccupied(space)
	      ) {
		return 1;
	      }
	      return 0;
	    },
	    function(spacekey) {

	      space1 = spacekey;

              his_self.playerSelectSpaceWithFilter(
	        "Select 1st Unoccupied French Home Space: ",
	        function(space) {
	          if (
	  	    space.home === "france" &&
	  	    space.key != space1 &&
		    !his_self.isOccupied(space)
	          ) {
		    return 1;
	          }
	          return 0;
	        },
		function(spacekey2) {

		  space2 = spacekey2;
		  his_self.addMove("unrest\t"+space1);
		  his_self.addMove("unrest\t"+space2);
		  his_self.endTurn();

		}
	      );
	    },
	  );
        }

        return 0;
      },
    }
    deck['081'] = { 
      img : "cards/HIS-081.svg" , 
      name : "Indulgence Vendor" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.queue.push("indulgence-vendor\t"+faction);
	his_self.game.queue.push("pull_card\t"+faction+"\tprotestant");

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "indulgence-vendor") {

	  let faction = mv[1];
  
	  let p = this.returnPlayerOfFaction(faction);
          let fhand_idx = this.returnFactionHandIdx(p, faction);
	  let card = this.game.state.last_pulled_card;
	  let ops = this.game.deck[0].cards[card].ops;

	  for (let i = 0; i < card.ops; i++) {
  	    his_self.game.queue.push("build_saint_peters");
	  }

  	  his_self.game.queue.push("discard\t"+faction+"\t"+card);
          his_self.game.queue.splice(qe, 1);

	  return 1;

        }

	return 1;

      },
    }
    deck['082'] = { 
      img : "cards/HIS-082.svg" , 
      name : "Janissaries Rebel" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let at_war = false;
	let f = his_self.returnImpulseOrder();
	for (let i = 0; i < f.length; i++) {
	  if (f[i] !== "ottoman") {
	    if (his_self.areEnemies(f[1], "ottoman")) {
	      at_war = true;
	    }
	  }
	}

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].home !== "ottoman") { return 0; }
	    if (his_self.game.spaces[spacekey].unrest) { return 0; }
	    if (his_self.isOccupied(his_self.game.spaces[spacekey])) { return 0; }
	    return 1;
	  });

	  let spaces_to_select = 4;
	  if (at_war) { spaces_to_select = 2; }

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['083'] = { 
      img : "cards/HIS-083.svg" , 
      name : "John Zapolya" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	//
	//
	if (his_self.game.spaces["buda"].beseiged) {

	} else {

	  //
	  //
	  //
	  if (his_self.game.spaces["buda"].political === "" || his_self.game.spaces["buda"].political === "hungary") {
	    his_self.addRegular("hungary", "buda", 4);
	  } else {
	    his_self.addRegular(his_self.game.spaces["buda"].political, "buda", 4);
	  }
	}

	return 1;
      },
    }
    deck['084'] = { 
      img : "cards/HIS-084.svg" , 
      name : "Julia Gonzaga" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.barbary_pirates) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
alert("NOT IMPLEMENTED: need to connect this with actual piracy for hits-scoring");
	his_self.game.state.events.julia_gonzaga_activated = 1;
	his_self.game.state.events.julia_gonzaga = "ottoman";

	return 1;
      },
    }
    deck['085'] = { 
      img : "cards/HIS-085.svg" , 
      name : "Katherina Bora" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (!his_self.isDebaterCommitted("luther-debater")) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	//
	// protestant player gets 5 Reformation Attempts
	//
	let p = his_self.returnPlayerOfFaction("protestant");

	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");

	//
	// and commit luther
	//
	his_self.commitDebater("protestant", "luther-debater");
	  
	return 1;
      },
    }
    deck['086'] = { 
      img : "cards/HIS-086.svg" , 
      name : "Knights of St. John" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['087'] = { 
      img : "cards/HIS-087.svg" , 
      name : "Mercenaries Demand Pay" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	// protestant player gets 5 Reformation Attempts
	//
	let p = his_self.returnPlayerOfFaction("faction");

	if (his_self.game.player == p) {

	  // pick a faction
  	  his_self.playerSelectFactionWithFilter(

	    "Select Faction to Target: ",

	    function(f) {
	      if (f !== faction) { return 1; }
	      return 0;
	    },

	    function (target) {
	      his_self.addMove("mercendaries-demand-pay\t"+target);
	      his_self.endTurn();
	    }
	  );
	}
	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "mercenaries-demand-pay") {

          his_self.game.queue.splice(qe, 1);

	  let target = mv[1];
	  let player = his_self.returnPlayerOfFaction(target);

	  if (player == his_self.game.player) {

            his_self.playerFactionSelectCardWithFilter(

	      target,

	      "Select Card to Discard: ",

	      function(card) {
		let c = his_self.game.deck[0].cards[card];
	        if (c.type === "mandatory") { return 0; }
		return 1;
	      },

	      function(card) {

		let c = his_self.game.deck[0].cards[card].ops;	      

  	  	his_self.game.queue.push("discard\t"+faction+"\t"+card);

		let retained = 2;
		if (c == 2) { retained = 4; }
		if (c == 3) { retained = 6; }
		if (c == 4) { retained = 10; }
		if (c >= 5) {
		  his_self.endTurn();
		  return;
		}

		//
		// player must discard down to N (retained) mercenaries
		//
		his_self.playerRetainUnitsWithFilter(
		  target,
		  function(spacekey, unit_idx) {
		    if (this.game.spaces[spacekey].units[target][unit_idx].type == "mercenary") { return 1; }
		    return 0;
		  },
		  retained
		);
	      }
	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['088'] = { 
      img : "cards/HIS-088.svg" , 
      name : "Peasants' War" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (!his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  });


	  let spaces_to_select = 5;

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['089'] = { 
      img : "cards/HIS-089.svg" , 
      name : "Pirate Haven" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['090'] = { 
      img : "cards/HIS-090.svg" , 
      name : "Printing Press" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

        his_self.game.state.tmp_protestant_reformation_bonus++;
        his_self.game.state.printing_press_active = 1;

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");

	return 1;
      },
    }
    deck['091'] = { 
      img : "cards/HIS-091.svg" , 
      name : "Ransom" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

  	  //
	  // list of all captured leaders
	  //
	  let captured_leaders = [];
	  let options = [];

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < this.game.state.players_info[i].captured.length; ii++) {
	      captured_leaders.push({ leader : this.game.state.players_info[i].captured[ii].type , player : i , idx : ii });
	      options.push(this.game.state.players_info[i].captured[ii].type);
	    } 	
	  }	

	  his_self.playerSelectOptions(res, options, false, (selected) => {
	    if (selected.length == 0) {
	      this.endTurn();
	      return;
	    }
	    his_self.addMove("random\t"+selected[0]);
	  });

	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "ransom_placement") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let spacekey = mv[2];

	  if (his_self.game.state.ransomed_leader != null) {
	    his_self.game.spaces[spacekey].units[faction].push(his_self.game.state.ransomed_leader);
	    his_self.game.state.ransomed_leader = null;
	  } 

	  return 1;

	}

        if (mv[0] == "ransom") {

          his_self.game.queue.splice(qe, 1);

	  his_self.game.state.ransomed_leader = null;
	  let ransomed_leader_type = mv[1];
	  let ransomed_leader = null;

	  for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	      if (his_self.game.state.players_info[i].captured[ii].type == ransomed_leader_type) {
	        randomed_leader = his_self.game.state.players_info[i].captured[ii];
		his_self.game.state.players_info[i].captured.splice(ii, 1);
	      }
	    } 	
	  }	

	  if (ransomed_leader === null) { return; }

	  let player = his_self.returnPlayerOfFaction(ransomed_leader.owner);
	  if (player == his_self.game.player) {

            his_self.playerFactionSelectSpaceWithFilter(

	      ransomed_leader.owner,

	      "Select Fortified Home Space: ",

	      function(spacekey) {
		if (his_self.game.spaces[spacekey].type == "fortress" && his_self.game.spaces[spacekey].home == ransomed_leader.owner) {
		  return 1;
		}
		return 0;
	      },

	      function(space) {
		his_self.addMove("ransom_placement\t"+ransomed_leader.owner+"\t"+space.key);
		his_self.endTurn();
	      }
	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['092'] = { 
      img : "cards/HIS-092.svg" , 
      name : "Revolt in Egypt" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_egypt = 1;

	his_self.game.queue.push("revolt_in_egypt");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_egypt_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		3,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"egypt" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }

    }
    deck['093'] = { 
      img : "cards/HIS-093.svg" , 
      name : "Revolt in Ireland" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_ireland = 1;

	if (faction === "france" || faction === "hapsburg") {
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (this.game.player == p) {
	    his_self.addMove("revolt_in_ireland_placement");
	    his_self.addMove("revolt_in_ireland_bonus_resistance\t"+faction);
	    his_self.endTurn();
	  }
	  return 0;
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_ireland_bonus_resistance") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player === p) {

            let msg = "Remove 1 Land Unit to Fortify Irish Resistance?";
            let html = '<ul>';
            html += '<li class="option" id="yes">yes</li>';
            html += '<li class="option" id="no">no</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");

              if (action === "yes") {
		
		//
		// pick unit on map with player land units and select one to remove
		//
 	 	his_self.playerSelectSpaceWithFilter(

		  "Select Space to Remove 1 Land Unit",

		  (space) => { return his_self.returnFactionLandUnitsInSpace(faction, space.key); },

		  (spacekey) => {
		    
      		    let opts = his_self.returnFactionLandUnitsInSpace(faction, spacekey);
		    let space = his_self.game.spaces[spacekey];

            	    let msg = "Remove which Land Unit?";
            	    let html = '<ul>';

		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "cavalry") {
   	                html += '<li class="option" id="${i}">cavalry</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "regular") {
   	                html += '<li class="option" id="${i}">regular</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "mercenary") {
   	                html += '<li class="option" id="${i}">mercenary</li>';
			break;
		      }
		    }

            	    html += '</ul>';


            	    his_self.updateStatusWithOptions(msg, html);

	            $('.option').off();
        	    $('.option').on('click', function () {

	              let action = $(this).attr("id");

		      his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					faction + "\t" +
					space.units[faction][i].type + "\t" +
					space.key );
		      his_self.addMove("NOTIFY\t"+faction+" removes unit from " + space.key);
		      his_self.endTurn();

		    });
		  },
		);
		return 0;
	      }
              if (action === "no") {
		his_self.addMove("NOTIFY\t"+faction+" does not support Irish rebels");
		his_self.endTurn();
	      }
	    });
	  }
	  return 0;
        }


        if (mv[0] == "revolt_in_ireland_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "england";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		4,

		true,

		(selected) => {

		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"ireland" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		    his_self.addMove("remove_unit\t");
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['094'] = { 
      img : "cards/HIS-094.svg" , 
      name : "Revolt of the Communeros" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].language == "spanish") { return 1; }
	    return 0;
	  });

	  let spaces_to_select = 3;

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      name : "Sack of Rome" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['096'] = { 
      img : "cards/HIS-096.svg" , 
      name : "Sale of Moluccas" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['097'] = { 
      img : "cards/HIS-097.svg" , 
      name : "Scots Raid" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['098'] = { 
      img : "cards/HIS-098.svg" , 
      name : "Search for Cibola" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['099'] = { 
      img : "cards/HIS-099.svg" , 
      name : "Sebastian Cabot" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['100'] = { 
      img : "cards/HIS-100.svg" , 
      name : "Shipbuilding" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (faction == "protestant") { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {
alert("NOT IMPLEMENTED");
	return 0;
      },
    }
    deck['101'] = { 
      img : "cards/HIS-101.svg" , 
      name : "Smallpox" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['102'] = { 
      img : "cards/HIS-102.svg" , 
      name : "Spring Preparations" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['103'] = { 
      img : "cards/HIS-103.svg" , 
      name : "Threat to Power" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['104'] = { 
      img : "cards/HIS-104.svg" , 
      name : "Trace Italienne" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['105'] = { 
      img : "cards/HIS-105.svg" , 
      name : "Treachery!" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['106'] = { 
      img : "cards/HIS-106.svg" , 
      name : "Unpaid Mercenaries" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['107'] = { 
      img : "cards/HIS-107.svg" , 
      name : "Unsanitary Camp" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['108'] = { 
      img : "cards/HIS-108.svg" , 
      name : "Venetian Alliance" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['109'] = { 
      img : "cards/HIS-109.svg" , 
      name : "Venetian Informant" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['110'] = { 
      img : "cards/HIS-110.svg" , 
      name : "War in Persia" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);

        his_self.game.state.events.war_in_persia = 1;

	his_self.game.queue.push("war_in_persia_placement");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "war_in_persia_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		5,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"persia" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['111'] = { 
      img : "cards/HIS-111.svg" , 
      name : "Colonial Governor/Native Uprising" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['112'] = { 
      img : "cards/HIS-112.svg" , 
      name : "Thomas More" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['113'] = { 
      img : "cards/HIS-113.svg" , 
      name : "Imperial Coronation" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['114'] = { 
      img : "cards/HIS-114.svg" , 
      name : "La Forets's Embassy in Istanbul" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['115'] = { 
      img : "cards/HIS-115.svg" , 
      name : "Thomos Cromwell" ,
      ops : 3 ,
      turn : 4 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['116'] = { 
      img : "cards/HIS-116.svg" , 
      name : "Rough Wooing" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }



  resetBesiegedSpaces() {
    for (let space in this.game.spaces) {
      if (space.besieged == 2) { space.besieged = 1; }
    }
  }
  resetLockedTroops() {
    for (let space in this.game.spaces) {
      for (let f in this.game.spaces[space].units) {
        for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
          this.game.spaces[space].units[f][z].locked = false;
        }
      }
    }
  }

  addUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 1;
  }

  removeUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 0;
  }

  hasProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["england"].length; i++) {
      let unit = space.units["england"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["france"].length; i++) {
      let unit = space.units["france"][i];
      if (unit.reformer) { return true; }
    }
    return false;
  }


  hasProtestantLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    //
    // only protestant units count
    //
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.type == "regular" || unit.type == "mercenary") { return true; }
    }

    //
    // unless Edward VI or Elizabeth I are on the throne
    //
    if (this.game.state.leaders.edward_vi == 1 || this.game.state.leaders.elizabeth_i == 1) {

      //
      // then british mercenaries and regulars count
      //
      for (let i = 0; i < space.units["england"].length; i++) {
        let unit = space.units["england"][i];
        if (unit.type == "regular" || unit.type == "mercenary") { return true; }
      }

      //
      // or Scottish ones if Scotland is allied to England
      //
      if (this.areAllies("england", "scotland")) {
        for (let i = 0; i < space.units["scotland"].length; i++) {
          let unit = space.units["scotland"][i];
          if (unit.type == "regular" || unit.type == "mercenary") { return true; }
        }
      }

    }

    return false;

  }

  hasCatholicLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {

	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	} else {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	}
      }
    }

    return false;
  }

  isSpaceFriendly(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return true; }
    return this.areAllies(cf, faction);
  }

  isSpaceHostile(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return false; }
    return this.areEnemies(cf, faction);
  }

  isSpaceControlled(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == "") { return true; }

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == faction) { return true; }

    // independent (gray) spaces seized by the power.
    if (space.home === "independent" && space.political === faction) { return true; }

    // home spaces of other powers seized by the power.
    if (space.home !== faction && space.political === faction) { return true; }

    // home spaces of allied minor powers. 
    if (space.home !== faction && this.isAlliedMinorPower(space.home, faction)) { return true; }

    return false;
  }

  isSpaceFortified(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.type === "key" || space.type === "fortress") { return false; }
    return false;
  }

  //
  // similar to above, except it can cross a sea-zone
  //
  isSpaceConnectedToCapitalSpringDeployment(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      },

      // transit passes? 0
      0,

      // transit seas? 1
      1,
     
      // faction? optional
      faction,

      // already crossed sea zone optional
      0 
    );

    return 1;
  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  doesSpaceContainProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      if (space.units["protestant"][i].reformer == true) { return true; }
    }
    return false;
  }

  doesSpaceContainCatholicReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["papacy"].length; i++) {
      if (space.units["papacy"][i].reformer == true) { return true; }
    }
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "protestant" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }


  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let spacekey in this.game.spaces) {
      if (filter_func(spacekey) == 1) { spaces.push(spacekey); }
    }
    return spaces;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceUnderSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged > 0) { return true; }
    return false;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }










  returnFactionControllingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let factions = this.returnImpulseOrder(); 
    for (let i = 0; i < factions.length; i++) {
      if (this.isSpaceControlled(space, factions[i])) { return factions[i]; }
    }
    if (space.political) { return space.political; }
    return space.home;
  }



  returnSpaceOfPersonage(faction, personage) {
    for (let key in this.game.spaces) {
      for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	if (this.game.spaces[key].units[faction][i].type === personage) {
	  return key;
        }
      }
    }
    return "";
  }

  returnIndexOfPersonageInSpace(faction, personage, spacekey="") {
    if (spacekey === "") { return -1; }
    if (!this.game.spaces[spacekey]) { return -1; }
    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
      if (this.game.spaces[spacekey].units[faction][i].type === personage) {
        return i;
      }
    }
    return -1;
  }

  returnNavalTransportDestinations(faction, space, ops) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let viable_destinations = [];
    let viable_navalspaces = [];
    let options = [];
    let ops_remaining = ops-1;    

    for (let i = 0; i < space.ports.length; i++) {
      if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	viable_navalspaces.push({key : space.ports[i] , ops_remaining : ops_remaining});
      }
    }

    //
    // TODO check for blocking fleet
    //
    while (ops_remaining > 1) {
      ops_remaining--;
      for (let i = 0; i < viable_navalspaces.length; i++) {
	for (let z = 0; z < this.game.navalspaces[viable_navalspaces[i]].neighbours.length; z++) {
          if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	    let ns = this.game.navalspaces[viable_navalspaces[i].key].neighbours[z];
	    let already_included = 0;
	    for (let z = 0; z < viable_navalspaces.length; z++) {
	      if (viable_navalspaces[z].key == ns) { already_included = 1; }
	    }
	    if (aready_included == 0) {
	      viable_navalspaces.push({ key : ns , ops_remaining : ops_remaining });
	    }
	  }
	}
      }
    }

    //
    //
    //
    for (let i = 0; i < viable_navalspaces.length; i++) {
      let key = viable_navalspaces[i].key;
      for (let z = 0; z < this.game.navalspaces[key].ports.length; z++) {      
	let port = this.game.navalspaces[key].ports[z];
	if (port != space.key) {
	  viable_destinations.push({ key : port , cost : (ops - ops_remaining)});
	}
      }
    }

    return viable_destinations;

  }


  returnFactionNavalUnitsToMove(faction) {

    let units = [];

    //
    // include minor-activated factions
    //
    let fip = [];
        fip.push(faction);
    if (this.game.state.activated_powers[faction]) {
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        fip.push(this.game.state.activated_powers[faction][i]);
      }
    }

    //
    // find units
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.spaces) {

	//
	// we only care about units in ports
	//
	if (this.game.spaces[key].ports) {
	if (this.game.spaces[key].ports.length > 0) {
	  let ships = [];
	  let leaders = [];
	  for (let z = 0; z < this.game.spaces[key].units[fip[i]].length; z++) {

	    //
	    // only add leaders if there is a ship in port
	    //
	    let u = this.game.spaces[key].units[fip[i]][z];
	    u.idx = z;
	    if (u.land_or_sea === "sea") {
	      if (u.navy_leader == true) {
		leaders.push(u);
	      } else {
		ships.push(u);
	      }
	    }
	  }

	  //
	  // add and include location
	  //
	  if (ships.length > 0) {
	    for (let y = 0; y < ships.length; y++) {
	      ships[y].spacekey = key;
	      units.push(ships[y]);
	    }
	    for (let y = 0; y < leaders.length; y++) {
	      leaders[y].spacekey = key;
	      units.push(leaders[y]);
	    }
	  }
	}
        }
      }
    }

    //
    // add ships and leaders out-of-port
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.navalspaces) {
	for (let z = 0; z < this.game.navalspaces[key].units[fip[i]].length; z++) {
	  this.game.navalspaces[key].units[fip[i]][z].spacekey = key;
	  units.push(this.game.navalspaces[key].units[fip[i]][z]);
	}
      }
    }

    return units;
  }








  returnNearestFriendlyFortifiedSpaces(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // fortified spaces
      function(spacekey) {
        if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	  if (his_self.isSpaceControlled(space, faction)) {
	    return 1;
	  }
	  if (his_self.isSpaceFriendly(space, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return res;

  }


  returnNearestFactionControlledPorts(faction, space) {
    try { if (this.game.navelspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestNavalSpaceOrPortWithFilter(

      space.key,

      // ports
      function(spacekey) {
        if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceControlled(space, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this
      function(spacekey) {	
        if (his_self.game.spaces[spacekey]) { return 0; }
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	return 1;
      }
    );

    return res;

  }


  canFactionRetreatToSpace(faction, space, attacker_comes_from_this_space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.spaces[attacker_comes_from_this_space]) { attacker_comes_from_this_space = this.game.spaces[invalid_space]; } } catch (err) {}
    if (space === attacker_comes_from_this_space) { return 0; }
    if (this.isSpaceInUnrest(space) == 1) { return 0; }
    if (this.isSpaceFriendly(space, faction) == 1) { return 1; }
    return 0;
  }

  canFactionRetreatToNavalSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    return 1;
  }

  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.political = faction;
    space.occupier = faction;
  }


  returnDefenderFaction(attacker_faction, space) {
    // called in combat, this finds whichever faction is there but isn't allied to the attacker
    // or -- failing that -- whichever faction is recorded as occupying the space.
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      let luis = this.returnFactionLandUnitsInSpace(f, space.key);
      if (luis > 0) {
        if (!this.areAllies(attacker_faction, f) && f !== attacker_faction) {
	  return f;
	}
      }
    }
    return this.returnFactionOccupyingSpace(space);
  }

  returnFactionOccupyingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.occupier != "" && space.occupier != undefined && space.occupier != "undefined" && space.occupier != 'undefined') { 
      // whoever had units here first
      if (space.units[space.occupier]) {
        if (space.units[space.occupier].length > 0) {
          return space.occupier; 
        }
      }
    }
    // or whoever has political control
    if (space.political != "") { return space.political; }
    // or whoever has home control
    if (space.owner != -1) { return space.owner; }
    return space.home;
  }

  returnFriendlyLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionSeaUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "squadron") { luis++; }
      if (space.units[faction][i].type === "corsair") { luis++; }
    }
    return luis;
  }

  doesOtherFactionHaveNavalUnitsInSpace(exclude_faction, key) {
    if (this.game.spaces[key]) {
      for (let f in this.game.spaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.spaces[key].units[faction]) {
            for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    if (this.game.navalspaces[key]) {
      for (let f in this.game.navalspaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.navalspaces[key].units[faction]) {
            for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsInSpace(faction, key) {
    if (this.game.spaces[key]) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
          if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    if (this.game.navalspaces[key]) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
          if (this.game.navalspaces[key].units[faction][i].type === "squadron" || this.game.navalspaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (this.returnFactionLandUnitsInSpace(f, space)) {
        if (f == faction1) {
          faction_map[f] = faction1;
        } else {
          if (f == faction2) {
            faction_map[f] = faction2;
          } else {
            if (this.areAllies(f, faction1)) {
              faction_map[f] = faction1;
            }
            if (this.areAllies(f, faction2)) {
              faction_map[f] = faction2;
            }
          }
        }
      }
    }
    return faction_map;
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  //
  // transit seas calculates neighbours across a sea zone
  //
  // if transit_seas and faction is specified, we can only cross if
  // there are no ports in a zone with non-faction ships.
  //
  returnNeighbours(space, transit_passes=1, transit_seas=0, faction="") {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (transit_seas == 0) {
      if (transit_passes == 1) {
        return space.neighbours;
      }
      let neighbours = [];
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];      
        if (!space.pass.includes[x]) {
  	  neighbours.push(x);
        }
      }
      return neighbours;
    } else {

      let neighbours = [];

      if (transit_passes == 1) {
        neighbours = JSON.parse(JSON.stringify(space.neighbours));
      } else {
        for (let i = 0; i < space.neighbours.length; i++) {
          let x = space.neighbours[i];  
          if (!space.pass.includes[x]) {
            neighbours.push(x);
          }
        }
      }

      //
      // any ports ?
      //
      if (space.ports) {
        if (space.ports.length > 0) {
	  for (let i = 0; i < space.ports.length; i++) {
	    let navalspace = this.game.navalspaces[space.ports[i]];
	    let any_unfriendly_ships = false;
	    if (navalspace.ports) {
	      if (faction != "") {
	        for (let z = 0; z < navalspace.ports.length; z++) {
	          if (this.doesOtherFactionHaveNavalUnitsInSpace(faction, navalspace.ports[z])) { any_unfriendly_ships = true; }
	        }
	      }
              for (let z = 0; z < navalspace.ports.length; z++) {
	        if (!neighbours.includes(navalspace.ports[z])) {
	          neighbours.push(navalspace.ports[z]);
	        };
	      }
	    }
 	  }
        }
      }
      return neighbours;
    }
  }


  //
  // only calculates moves from naval spaces, not outbound from ports
  //
  returnNavalNeighbours(space, transit_passes=1) {
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let neighbours = [];
    for (let i = 0; i < space.ports.length; i++) {
      let x = space.ports[i];
      neighbours.push(x);
    }
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];
      neighbours.push(x);
    }

    return neighbours;
  }




  //
  // returns adjacent naval and port spaces
  //
  returnNavalAndPortNeighbours(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let key = space.key;
    let neighbours = [];

    //
    // ports add only naval spaces
    //
    if (this.game.spaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
    }

    //
    // naval spaces add ports
    //
    if (this.game.navalspaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];
        neighbours.push(x);
      }
    }

    return neighbours;
  }


  //
  // returns both naval and port movement options
  //
  returnNavalMoveOptions(spacekey) {

    let neighbours = [];

    if (this.game.navalspaces[spacekey]) {
      for (let i = 0; i < this.game.navalspaces[spacekey].neighbours.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].neighbours[i]);
      }
      for (let i = 0; i < this.game.navalspaces[spacekey].ports.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].ports[i]);
      }
    } else {
      if (this.game.spaces[spacekey]) {
        for (let i = 0; i < this.game.spaces[spacekey].ports.length; i++) {
	  neighbours.push(this.game.spaces[spacekey].ports[i]);
        }
      }
    }

    return neighbours;
  }


  //
  // find the nearest destination.
  //
  returnNearestNavalSpaceOrPortWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNavalNeighbours(sourcekey);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.navalspaces[key].neighbours.length; i++) {
	      if (!searched_spaces.hasOwnProperty[this.game.navalspaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[n[i]] = { hops : (hops+1) , key : n[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) { continue_searching = 0; }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  //
  // find the nearest destination.
  //
  // transit_eas = filters on spring deploment criteria of two friendly ports on either side of the zone + no uncontrolled ships in zone
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0, transit_seas=0, faction="", already_crossed_sea_zone=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes, transit_seas, faction);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      if (!searched_spaces.hasOwnProperty[this.game.spaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[n[i]] = { hops : (hops+1) , key : n[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) { continue_searching = 0; }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  returnNumberOfCatholicElectorates() {
    let controlled_keys = 0;
    if (!this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfProtestantElectorates() {
    let controlled_keys = 0;
    if (this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.state.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }

  returnNumberOfCatholicSpacesInLanguageZone(language="") {  
    let catholic_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "catholic") {
	if (language == "" || this.game.spaces[key].language == language) {
	  catholic_spaces++;
	}
      }
    }
    return catholic_spaces;
  }

  returnNumberOfProtestantSpacesInLanguageZone(language="") {  
    let protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
	if (language == "" || this.game.spaces[key].language == language) {
	  protestant_spaces++;
	}
      }
    }
    return protestant_spaces;
  }


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      ports : ["glasgow"] ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      ports : ["brest", "nantes", "bordeaux", "corunna" ] ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      ports : ["gibraltar" , "seville" , "corunna"] ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      ports : ["brest", "plymouth", "portsmouth", "rouen", "bolougne", "calais" ] ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      ports : ["london", "norwich", "berwick", "edinburgh", "calais", "antwerp", "amsterdam", "bremen", "hamburg" ] ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      ports : ["lubeck", "stettin" ] ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      ports : ["cartagena", "valencia", "palma", "barcelona" , "marseille", "nice" , "genoa", "bastia" ] ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      ports : ["gibraltar", "oran", "cartagena", "algiers" , "tunis", "cagliari" , "palma" ] ,
      neighbours : ["gulflyon","tyrrhenian","ionian","africa"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      ports : ["genoa" , "bastia" , "rome" , "naples" , "palermo" , "caliari" , "messina" ] ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      ports : ["tunis" , "tripoli" , "malta" , "candia" , "rhodes" ] ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      ports : ["rhodes" , "candia" , "coron" , "athens" , "salonika" , "istanbul" ] ,
      neighbours : ["black","africa","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      ports : ["malta" , "messina" , "coron", "lepanto" , "corfu" , "taranto" ] ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      ports : ["corfu" , "durazzo" , "scutari" , "ragusa" , "trieste" , "venice" , "ravenna" , "ancona" ] ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      ports : ["istanbul" , "varna" ] ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
    }

    return seas;
  }

  returnSpaceName(key) {
    if (this.game.spaces[key]) { return this.game.spaces[key].name; }
    if (this.game.navalspaces[key]) { return this.game.navalspaces[key].name; }
    return "Unknown";
  }


  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithFactionInfantry(faction) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
      }
    }
    return spaces_with_infantry;
  }

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["glasgow","edinburgh"],
      language: "english",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["stirling","edinburgh","carlisle"],
      language: "english",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      ports: ["north"],
      neighbours: ["edinburgh","carlisle","york"],
      language: "english",
      religion: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["glasgow","berwick","york","shrewsbury"],
      language: "english",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["berwick","carlisle","shrewsbury","lincoln"],
      language: "english",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["shrewsbury","bristol"],
      language: "english",
      type: "key"

    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["wales","carlisle","york","london","bristol"],
      language: "english",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["london","york"],
      language: "english",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours:["london"],
      language: "english",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religion: "catholic",
      language: "english",
      ports: ["irish"],
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["norwich","lincoln","bristol","portsmouth","shrewsbury"],
      language: "english",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["bristol","portsmouth"],
      language: "english",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["plymouth","bristol","london"],
      language: "english",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religion: "catholic",
      ports:["north"], 
      neighbours: ["boulogne","brussels","antwerp"],
      language: "french",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      name: "St. Quentin",
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      name: "St. Dizier",
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizier","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      ports: ["channel"],
      religion: "channelc",
      neighbours: ["boulogne","paris","tours","nantes"],
      language: "french",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["paris","tours","dijon","lyon"],
      language: "french",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["stdizier","paris","orleans","lyon","besancon"],
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["tours","bordeaux","lyon"],
      language: "french",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","nantes","bordeaux","limoges","orleans"],
      language: "french",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["brest","rouen","tours","bordeaux"],
      language: "french",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channnel","biscay"],
      neighbours: ["nantes"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["navarre", "nantes","tours","limoges"],
      pass: ["navarre"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limoges","orleans","dijon","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["turin","lyon","geneva"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","toulouse","lyon","marseille"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["lyon"],
      neighbours: ["avignon","nice"],
      language: "french",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","bordeaux","avignon"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["nantes","tours","limoges","toulouse"],
      language: "french",
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","kassel","cologne","amsterdam"],
      language: "german",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours:["munster","brunswick","hamburg"],
      language: "german",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["bremen","brunswick","lubeck"],
      language: "german",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["hamburg","magdeburg","brandenburg","stettin"],
      language: "german",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 467,
      left: 3080,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 610,
      left: 3133,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzig","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 536,
      left: 2935,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenberg","erfurt","brunswick"],
      language: "german",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","hamburg","magdeburg","kassel"],
      language: "german",
      type: "town"
    }
    spaces['cologne'] = {
      top: 726,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","mainz","liege"],
      language: "german",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","brunswick","erfurt","nuremberg","mainz"],
      language: "german",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["magdeburg","kassel","leipzig"],
      language: "german",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["wittenberg","prague","nuremberg","erfurt"],
      language: "german",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["nuremberg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["graz","linz","regensburg","augsburg","innsbruck"],
      pass: ["graz"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1084,
      left: 2864,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["innsbruck","worms","nuremberg","regensburg","salzburg"],
      pass: ["innsbruck"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 930,
      left: 2837,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 872,
      left: 2668,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 897,
      left: 2521,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "town"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["metz","besancon","basel","worms"],
      language: "german",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["strasburg","mainz","nuremberg","augsburg"],
      language: "german",
      type: "town"
    }
    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["zaragoza","bilbao"],
      language: "spanish",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","valladolid","zaragoza","navarre"],
      language: "spanish",
      type: "town"
    }
    spaces['corunna'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["biscay","atlantic"],
      neighbours: ["bilbao","valladolid"],
      language: "spanish",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","bilbao","madrid"],
      language: "spanish",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["navarre","bilbao","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["toulouse","avignon","zaragoza","valencia"],
      pass: ["toulouse","avignon"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      ports: ["gulflyon","barbary"],
      neighbours: ["cartagena","cagliari"],
      language: "other",
      religion: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","valladolid","zaragoza","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["cartagena","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","barbary"],
      neighbours: ["granada","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","gibraltar","cartagena"],
      language: "spanish",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic"],
      neighbours: ["cordoba","gibraltar"],
      language: "spanish",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["madrid","seville","granada"],
      language: "spanish",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic","barbary"],
      neighbours: ["seville","granada"],
      language: "spanish",
      type: "fortress"
    }
    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary","africa"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports:["tyrrhenian","barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["messina"],
      language: "italian",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian","ionian"],
      neighbours: ["palermo","naples","taranto"],
      language: "italian",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["taranto","ancona","rome"],
      language: "italian",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian"],
      neighbours: ["cerignola","naples","messina"],
      language: "italian",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["rome","taranto","messina"],
      language: "italian",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["brunn","linz","graz","pressburg"],
      language: "german",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["prague","regensburg","salzburg","vienna"],
      language: "german",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["salzburg","vienna","mohacs","agram","trieste"],
      pass: ["salzburg"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["graz","agram","zara","venice"],
      language: "italian",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["augsburg","trent","zurich","salzburg"],
      pass: ["augsburg","trent"],
      language: "german",
      type: "town"
    }
    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
      ports:["ionian","aegean"],
      neighbours: ["athens"],
      language: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["aegean"],
      neighbours: ["larissa","lepanto","coron"],
      language: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["ionian"],
      neighbours: ["larissa","athens"],
      language: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["durazzo","lepanto","athens","salonika"],
      pass: ["durazzo"],
      language: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["larissa","edirne"],
      language: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["larissa","scutari"],
      pass: ["larissa"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["nezh","ragusa","durazzo"],
      pass: ["nezh"],
      language: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["varna","istanbul","salonika","sofia",],
      language: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black","aegean"],
      neighbours: ["edirne","varna"],
      language: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black"],
      neighbours: ["bucharest","edirne","istanbul"],
      language: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","varna"],
      language: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["szegedin","sofia","bucharest","belgrade"],
      pass: ["szegedin","sofia"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","nezh","edirne"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["scutari","belgrade","sofia"],
      pass: ["scutari"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["ragusa","szegedin","mohacs","agram","nezh","nicopolis"],
      pass: ["ragusa"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["nicopolis","buda","belgrade"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["buda","graz","agram","belgrade"],
      language: "other",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","mohacs","agram","trieste"],
      language: "german",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["zara","graz","trieste","belgrade","mohacs"],
      pass: ["zara"],
      language: "other",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["pressburg","mohacs","szegedin"],
      language: "other",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","buda"],
      language: "other",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["breslau","prague","vienna"],
      language: "other",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["brandenburg","wittenberg","brunn"],
      language: "other",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["wittenberg","leipzig","linz"],
      language: "other",
      type: "key"
    }
    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","munster"],
      language: "other",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","liege","brussels","calais"],
      language: "other",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["antwerp","calais","stquentin","stdizier","liege"],
      language: "french",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["cologne","trier","metz","brussels","antwerp"],
      language: "french",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["liege","trier","strasburg","besancon","stdizier"],
      language: "french",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["metz","dijon","geneva","basel","strasburg"],
      language: "french",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["strasburg","besancon","geneva","zurich"],
      language: "german",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","innsbruck"],
      language: "german",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","besancon","lyon","turin","grenoble"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["trent","modena","pavia","turin"],
      language: "italian",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["innsbruck","milan","modena","venice"],
      pass: ["innsbruck"],
      language: "italian",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["trent","milan","pavia","florence","ravenna","venice"],
      language: "italian",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["milan","turin","genoa","modena"],
      language: "italian",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["milan","pavia","geneva","grenoble","genoa"],
      pass: ["grenoble","geneva"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["genoa","marseille"],
      pass: ["genoa"],
      language: "french",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["modena","genoa","siena"],
      language: "italian",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["genoa","florence","rome"],
      language: "italian",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: ["nice","pavia","turin","modena","siena"],
      pass: ["nice"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["siena","ancona","cerignola","naples"],
      language: "italian",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["ravenna","rome","cerignola"],
      language: "italian",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["venice","modena","ancona"],
      language: "italian",
      type: "key"
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religion: "catholic",
      ports:["adriatic"],
      neighbours: ["trent","modena","ravenna","trieste"],
      language: "italian",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religion: "catholic",
      neighbours: ["agram","ragusa","trieste"],
      pass: ["agram"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["belgrade","zara","scutari"],
      pass: ["belgrade"],
      language: "italian",
      type: "town"
    }

    //
    // foreign war cards are spaces
    //
    spaces['egypt'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['ireland'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['persia'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }

    for (let key in spaces) {
      spaces[key].units = {};
      spaces[key].units['england'] = [];
      spaces[key].units['france'] = [];
      spaces[key].units['hapsburg'] = [];
      spaces[key].units['ottoman'] = [];
      spaces[key].units['papacy'] = [];
      spaces[key].units['protestant'] = [];
      spaces[key].units['venice'] = [];
      spaces[key].units['genoa'] = [];
      spaces[key].units['hungary'] = [];
      spaces[key].units['scotland'] = [];
      spaces[key].units['independent'] = [];
      spaces[key].university = 0;
      spaces[key].unrest = 0;
      if (!spaces[key].ports) { spaces[key].ports = []; }
      if (!spaces[key].pass) { spaces[key].pass = []; }
      if (!spaces[key].name) { spaces[key].name = key.charAt(0).toUpperCase() + key.slice(1); }
      if (!spaces[key].key) { spaces[key].key = spaces[key].name; }
      if (!spaces[key].besieged) { spaces[key].besieged = 0; }
      if (!spaces[key].besieged_factions) { spaces[key].besieged_factions = []; }
    }

    return spaces;

  }


  isOccupied(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    for (let key in this.game.spaces[space].units) {
      if (this.game.spaces[space].units[key].length > 0) { return 1; }
    }

    return 0;
  }

  isElectorate(spacekey) {

    try { if (spacekey.key) { spacekey = spacekey.key; } } catch (err) {}

    if (spacekey === "augsburg") { return 1; }
    if (spacekey === "trier") { return 1; }
    if (spacekey === "cologne") { return 1; }
    if (spacekey === "wittenberg") { return 1; }
    if (spacekey === "mainz") { return 1; }
    if (spacekey === "brandenburg") { return 1; }
    return 0;
  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    let his_self = this;

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {

	let html = '<div class="space_view" id="">';

        for (let f in this.units) {
	  if (this.units[f].length > 0) {

	    html += `<div class="space_faction">${his_self.returnFactionName(f)}</div>`;
            for (let i = 0; i < this.units[f].length; i++) {

	      let b = "";
	      if (this.units[f][i].besieged) { b = ' (besieged)'; }

	      html += `<div class="space_unit">1 - ${this.units[f][i].type} ${b}</div>`;
	    }
	  }
	}

	html += `</div>`;

	return html;

      };

    }

    return obj;

  }


  //
  // Allies
  //
  // are by definition major powers as opposed minor / activated powers, although 
  // if you ask areAllies() or areEnemies() on combinations of faction names that 
  // include minor-activated powers like scotland or genoa these functions will 
  // politely let you know if those minor-powers are activated to an ally or enemy
  //

  returnAllies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areAllies(faction, io[i])) { f.push(io[i]); }
      }
    }
    return f;
  }

  returnEnemies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areEnemies(faction, io[i])) { f.push(io[i]); }
      }
    }
    return f;
  }

  areAllies(faction1, faction2) {
console.log("DIPLOMACY: " + JSON.stringify(this.game.state.diplomacy));
console.log("checking if allies: " + faction1 + " -- " + faction2);
    try { if (this.game.state.diplomacy[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 1; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
console.log("minor power...");
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      console.log(f1cp + " -- " + f2cp + " -- " + faction1 + " -- " + faction2);
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f1cp][f2cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
    }
console.log("saying no!");
    return 0;
  }

  areEnemies(faction1, faction2) {
    try { if (this.game.state.diplomacy[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 0; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 0; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.state.diplomacy[f1cp][f2cp].enemies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].enemies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  setAllies(faction1, faction2, amp=1) {

console.log("set allies: " + faction1 + " || " + faction2);

    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 1; } catch (err) {}

    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }

  }

  unsetAllies(faction1, faction2, amp=1) {
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}

    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }
  }

  setEnemies(faction1, faction2) {
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 1; } catch (err) {}
  }

  unsetEnemies(faction1, faction2) {
    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
  }


  isMajorPower(power) {
    if (power === "france" || power === "hapsburg" || power === "england" || power === "protestant" || power === "ottoman" || power === "papacy") { return true; }
    return false;
  }

  isMinorPower(power) {
    if (power === "genoa" || power === "hungary" || power === "scotland" || power === "venice") { return 1; }
    return 0;
  }

  isAlliedMinorPower(mp, faction) {
    if (faction === this.returnAllyOfMinorPower(mp)) { return true; }
    return false;
  }

  returnMinorPowers() {
    return ["genoa", "hungary", "scotland", "venice"];
  }

  returnControllingPower(power) {
    this.returnAllyOfMinorPower(power);
  }

  returnAllyOfMinorPower(power) {
    if (!this.game.state.minor_activated_powers.includes(power)) { return ""; }
    for (let key in this.game.state.activated_powers) {
      if (this.game.state.activated_powers[key].includes(power)) {
	return key;
      }
    }
    return power;
  }

  activateMinorPower(faction, power) {
    if (this.returnAllyOfMinorPower(power) != power) {
      this.deactivateMinorPower(this.returnAllyOfMinorPower(power), power);
    }
    this.setAllies(faction, power, 0);
    this.game.state.activated_powers[faction].push(power);
    this.game.state.minor_activated_powers.push(power);
  }

  deactivateMinorPower(faction, power) {
    this.unsetAllies(faction, power, 0);
    for (let key in this.game.state.activated_powers) {
console.log("KEY IS: " + key);
console.log(JSON.stringify(this.game.state.activated_powers[key]));
      for (let i = 0; i < this.game.state.activated_powers[key].length; i++) {
        if (this.game.state.activated_powers[key][i] === power) {
  	  this.game.state.activated_powers[key].splice(i, 1);
        }
      }
    }
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (this.game.state.minor_activated_powers[i] === power) {
	this.game.state.minor_activated_powers.splice(i, 1);
      }
    }
  }

  canFactionDeactivateMinorPower(faction, power) {
    if (power == "genoa") { return 1; }
    if (power == "scotland") { return 1; }
    if (power == "venice") { return 1; }
    return 0;
  }

  canFactionActivateMinorPower(faction, power) {
    if (power == "genoa") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    if (power == "hungary") {
      if (faction == "hapsburg") { return 1; }
    }
    if (power == "scotland") {
      if (faction == "france") { return 1; }
      if (faction == "england") { return 1; }
    }
    if (power == "venice") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    return 0;
  }

  isMinorActivatedPower(power) {
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (power === this.game.state.minor_activated_powers[i]) {
	return 1;
      }
    }
    return 0;
  }

  isMinorUnactivatedPower(power) {
    if (power === "genoa" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "scotland" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "hungary" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "venice" && this.isMinorActivatedPower(power) != 1) { return 1; }
    return 0;
  }


  returnLoanedUnits() {
    for (let i in this.game.spaces) {
      space = this.game.spaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
    for (let i in this.game.navalspaces) {
      space = this.game.navalspaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
  }

  isCaptured(faction, unittype) {
    for (let i = 0; i < this.game.players.length; i++) {
      let p = this.game.state.players_info[i];
      if (p.captured.includes(unittype)) { return 1; }
    }
    return 0;
  }
  isSpaceBesieged(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged == true) { return true; }
    return false;
  }
  isBesieged(faction, unittype) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].besieged) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].type == unittype) {
	    if (this.game.spaces[key].units[faction][i].besieged == true) {
	      return 1;
	    }
	  }
	}
      }
    }
    return 0;
  }



  captureLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let p = this.returnPlayerOfFaction(winning_faction);
    let unitjson = JSON.stringify(unit);
    for (let z = 0; z < p.captured.length; z++) {
      if (JSON.stringify(p.captured[z]) === unitjson) { return; }
    }
    p.captured.push(unit);
  }

  captureNavalLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    this.game.state.naval_leaders_lost_at_sea.push(unit);
  }

  isPersonageOnMap(faction, personage) {
    for (let s in this.game.spaces) {
      if (this.game.spaces[s].units[faction].length > 0) {
	for (let i = 0; i < this.game.spaces[s].units[faction].length; i++) {
	  let unit = this.game.spaces[s].units[faction][i];
	  if (unit.key === personage) { return unit; }
	}
      }
    }
    return null;
  }

  addUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newUnit(faction, type));
  }

  removeUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = space.units[faction].length - 1; i >= 0; i--) {
      if (space.units[faction].type === type) {
	space.units[faction].splice(i, 1);
	return;
      }
    }
  }

  isLandUnit(unit) {
    if (unit.type === "regular") { return 1; }
    if (unit.type === "mercenary") { return 1; }
    if (unit.type === "cavalry") { return 1; }
    return 0;
  }

  addRegular(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "regular"));
    }
  }

  addMercenary(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "mercenary"));
    }
  }

  addCavalry(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "cavalry"));
    }
  }

  addNavalSquadron(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "squadron"));
    }
  }

  addCorsair(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "corsair"));
    }
  }

  //
  // figure out how many base points people have
  //
  calculateVictoryPoints() {

    let factions = {};

    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
        factions[this.game.state.players_info[i].factions[ii]] = {
	  faction : this.game.state.players_info[i].factions[ii] ,
	  vp_base : 0 ,
	  vp_bonus : 0 ,
	  vp_special : 0 ,
	  vp : 0 ,
	  keys : 0 ,
	  religious : 0 ,
	  victory : 0,	  
	  details : "",
	};
      }
    }
    //
    // let factions calculate their VP
    //
    for (let f in factions) {
      factions[f].vp_base = this.factions[f].calculateBaseVictoryPoints(this);
      factions[f].vp_bonus = this.factions[f].calculateBonusVictoryPoints(this);
      factions[f].vp_special = this.factions[f].calculateSpecialVictoryPoints(this);
      factions[f].vp = (factions[f].vp_base + factions[f].vp_bonus + factions[f].vp_special);
    }

    //
    // calculate keys controlled
    //
    for (let f in factions) {
      factions[f].keys = this.returnNumberOfKeysControlledByFaction(f);
      if (f === "protestant") {
	factions[f].religious = this.returnNumberOfProtestantSpacesInLanguageZone();
      }
    }

    //
    // military victory
    //
    if (factions['hapsburg']) {
      if (factions['hapsburg'].keys >= this.game.state.autowin_hapsburg_keys_controlled) {
        factions['hapsburg'].victory = 1;
        factions['hapsburg'].details = "military victory";
      }
    }
    if (factions['ottoman']) {
      if (factions['ottoman'].keys >= this.game.state.autowin_ottoman_keys_controlled) {
        factions['ottoman'].victory = 1;
        factions['ottoman'].details = "military victory";
      }
    }
    if (factions['france']) {
      if (factions['france'].keys >= this.game.state.autowin_france_keys_controlled) {
        factions['france'].victory = 1;
        factions['france'].details = "military victory";
      }
    }
    if (factions['england']) {
      if (factions['england'].keys >= this.game.state.autowin_england_keys_controlled) {
        factions['england'].victory = 1;
        factions['england'].details = "military victory";
      }
    }
    if (factions['papacy']) {
      if (factions['papacy'].keys >= this.game.state.autowin_papacy_keys_controlled) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "military victory";
      }
    }

    //
    // religious victory
    //
    if (factions['protestant']) {
      if (factions['protestant'].religious >= 50) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "religious victory";
      }
    }

    //
    // PROCESS BONUS VP
    //
    //• Copernicus (2 VP) or Michael Servetus (1 VP) event
    if (this.game.state.events.michael_servetus) {
      factions[this.game.state.events.michael_servetus].vp_special++;
      factions[this.game.state.events.michael_servetus].vp++;
    }
    if (this.game.state.events.copernicus) {
      factions[this.game.state.events.copernicus].vp_special += this.game.state.events.copernicus_vp;
      factions[this.game.state.events.copernicus].vp += this.game.state.events.copernicus_vp;
    }


    // base

    // protestant spaces

    // bonus vp
    //• Bible translation completed (1 VP for each language)    ***
    //• Protestant debater burned (1 per debate rating)         ***
    //• Papal debater disgraced (1 per debate rating)           ***
    //• Successful voyage of exploration
    //• Successful voyage of conquest
    //• JuliaGonzaga(1VP)followed by successful Ottoman piracy in Tyrrhenian Sea
    //• War Winner marker received during Peace Segment
    //• Master of Italy VP marker received during Action Phase

    return factions;

  }


  //
  // faction is papacy or (anything), since debaters aren't really owned by factions outside
  // papcy and protestants, even if they are tagged as would be historically appropriate
  //
  returnDebatersInLanguageZone(language_zone="german", faction="papacy", committed=-1) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].language_zone === language_zone || this.game.state.debaters[i].langauge_zone === "any") {
        if (this.game.state.debaters[i].faction === faction || (faction != "papacy" && this.game.state.debaters[i].faction != "papacy")) {
          if (this.game.state.debaters[i].committed === committed || committed == -1) {
	    num++;
          }
        }
      }
    }
    return num;
  }


  returnImpulseOrder() {
    return ["ottoman","hapsburg","england","france","papacy","protestant"];
  }

  returnNumberOfUncommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfUncommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  /////////////////////
  // Core Game State //
  /////////////////////
  returnState() {

    let state = {};

    state.skip_counter_or_acknowledge = 0; // don't skip

    state.scenario = "1517";
    if (this.game.options.scenario) { state.scenario = this.game.options.scenario; }
    state.round = 0;
    state.players = [];
    state.events = {};

    state.diplomacy = this.returnDiplomacyAlliance();

    // whose turn is it? (attacker)
    state.active_player = -1;

    // which ones are activated
    state.minor_activated_powers = [];

    state.naval_leaders_lost_at_sea = [];

    state.activated_powers = {};
    state.activated_powers['ottoman'] = [];
    state.activated_powers['hapsburg'] = [];
    state.activated_powers['france'] = [];
    state.activated_powers['england'] = [];
    state.activated_powers['papacy'] = [];
    state.activated_powers['protestant'] = [];

    state.translations = {};
    state.translations['new'] = {};
    state.translations['new']['german'] = 0;
    state.translations['new']['french'] = 0;
    state.translations['new']['english'] = 0;
    state.translations['full'] = {};
    state.translations['full']['german'] = 0;
    state.translations['full']['french'] = 0;
    state.translations['full']['english'] = 0;

    state.saint_peters_cathedral = {};
    state.saint_peters_cathedral['state'] = 0;
    state.saint_peters_cathedral['vp'] = 0;    

    state.papal_debaters_disgraced_vp = 0;
    state.protestant_debaters_burned_vp = 0;

    state.events.michael_servetus = "";  // faction that gets VP
    state.events.copernicus = "";        // faction that gets VP
    state.events.copernicus_vp = 0;     // 1 or 2 VP

    state.french_chateaux_vp = 0;

    state.tmp_reformations_this_turn = [];
    state.tmp_counter_reformations_this_turn = [];
    state.tmp_protestant_reformation_bonus = 0;
    state.tmp_protestant_reformation_bonus_spaces = [];
    state.tmp_catholic_reformation_bonus = 0;
    state.tmp_catholic_reformation_bonus_spaces = [];

    state.tmp_protestant_counter_reformation_bonus = 0;
    state.tmp_protestant_counter_reformation_bonus_spaces = [];
    state.tmp_catholic_counter_reformation_bonus = 0;
    state.tmp_catholic_counter_reformation_bonus_spaces = [];
    state.tmp_papacy_may_specify_debater = 0;
    state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    state.tmp_bonus_protestant_translation_german_zone = 0;
    state.tmp_bonus_protestant_translation_french_zone = 0;
    state.tmp_bonus_protestant_translation_english_zone = 0;
    state.tmp_bonus_papacy_burn_books = 0;

    //
    // foreign wars
    //
    state.events.war_in_persia = 0;
    state.events.revolt_in_ireland = 0;
    state.events.revolt_in_egypt = 0;


    state.augsburg_electoral_bonus = 0;
    state.mainz_electoral_bonus = 0;
    state.trier_electoral_bonus = 0;
    state.cologne_electoral_bonus = 0;
    state.wittenberg_electoral_bonus = 0;
    state.brandenburg_electoral_bonus = 0;

    state.autowin_hapsburg_keys_controlled = 14;
    state.autowin_ottoman_keys_controlled = 11;
    state.autowin_papacy_keys_controlled = 7;
    state.autowin_france_keys_controlled = 11;
    state.autowin_england_keys_controlled = 9;

    state.debaters = [];
    state.explorers = [];
    state.conquistadors = [];


    state.leaders = {};
    state.leaders.francis_i = 1;
    state.leaders.henry_viii = 1;
    state.leaders.charles_v = 1;
    state.leaders.suleiman = 1;
    state.leaders.leo_x = 1;
    state.leaders.luther = 1
    state.leaders.clement_vii = 0;
    state.leaders.paul_iii = 0;
    state.leaders.edward_vi = 0;
    state.leaders.henry_ii = 0;
    state.leaders.mary_i = 0;
    state.leaders.julius_iii = 0;
    state.leaders.elizabeth_i = 0;
    state.leaders.calvin = 0;

    state.events.ottoman_piracy_enabled = 0;
    state.events.ottoman_corsairs_enabled = 0;
    state.events.papacy_may_found_jesuit_universities = 0;
    state.events.schmalkaldic_league = 0;
    state.events.edward_vi_born = 0;
    state.events.wartburg = 0;

    return state;

  }



  returnPregnancyChart() {

    let chart = {};

    chart['1'] = {
      top : 1307,
      left : 4075,
    }

    chart['2'] = {
      top : 1220,
      left : 4075,
    }

    chart['3'] = {
      top : 1135,
      left : 4075,
    }

    chart['4'] = {
      top : 1051,
      left : 4075,
    }

    chart['5'] = {
      top : 963,
      left : 4075,
    }

    chart['1'] = {
      top : 850,
      left : 4075,
    }

    return chart;

  }

  returnColonies() {

    let colonies = {};

    colonies['1'] = {
      top : 1007,
      left : 55
    }
    colonies['2'] = {
      top : 1120,
      left : 55
    }
    colonies['3'] = {
      top : 1232,
      left : 55
    }
    colonies['4'] = {
      top : 1344,
      left : 55
    }
    colonies['5'] = {
      top : 1456,
      left : 55
    }
    colonies['6'] = {
      top : 1568,
      left : 55
    }
    colonies['7'] = {
      top : 1680,
      left : 55
    }

    return colonies;

  }


  returnNewWorld() {

    let nw = {};

    nw['greatlakes'] = {
      top : 1906 ,
      left : 280,
      vp : 1
    }
    nw['stlawrence'] = {
      top : 1886 ,
      left : 515,
      vp : 1
    }
    nw['mississippi'] = {
      top : 2075 ,
      left : 280 ,
      vp : 1
    }
    nw['aztec'] = {
      top : 2258 ,
      left : 168 ,
      vp : 2
    }
    nw['maya'] = {
      top : 2300 ,
      left : 302 ,
      vp : 2
    }
    nw['amazon'] = {
      top : 2536 ,
      left : 668 ,
      vp : 2
    }
    nw['inca'] = {
      top : 2660 ,
      left : 225,
      vp : 2
    }
    nw['circumnavigation'] = {
      top : 2698,
      left : 128,
      vp : 3
    }
    nw['pacificstrait'] = {
      top : 2996 ,
      left : 486 ,
      vp : 1
    }


    return nw;

  }


  returnConquest() {

    let conquest = {};

    conquest['1'] = {
      top : 1007,
      left : 178
    }
    conquest['2'] = {
      top : 1120,
      left : 178
    }
    conquest['3'] = {
      top : 1232,
      left : 178
    }
    conquest['4'] = {
      top : 1344,
      left : 178
    }
    conquest['5'] = {
      top : 1456,
      left : 178
    }
    conquest['6'] = {
      top : 1568,
      left : 178
    }
    conquest['7'] = {
      top : 1680,
      left : 178
    }

    return conquest;

  }

  returnVictoryPointTrack() {

    let track = {};

    track['0'] = {
      top : 2912,
      left : 2025
    }
    track['1'] = {
      top : 2912,
      left : 2138
    }
    track['2'] = {
      top : 2912,
      left : 2252
    }
    track['3'] = {
      top : 2912,
      left : 2366
    }
    track['4'] = {
      top : 2912,
      left : 2480
    }
    track['5'] = {
      top : 2912,
      left : 2594
    }
    track['6'] = {
      top : 2912,
      left : 2708
    }
    track['7'] = {
      top : 2912,
      left : 2822
    }
    track['8'] = {
      top : 2912,
      left : 2936
    }
    track['9'] = {
      top : 2912,
      left : 3050
    }
    track['10'] = {
      top : 3026,
      left : 884
    }
    track['11'] = {
      top : 3026,
      left : 998
    }
    track['12'] = {
      top : 3026,
      left : 1112
    }
    track['13'] = {
      top : 1226,
      left : 1
    }
    track['14'] = {
      top : 3026,
      left : 1340
    }
    track['15'] = {
      top : 3026,
      left : 1454
    }
    track['16'] = {
      top : 3026,
      left : 1568
    }
    track['17'] = {
      top : 3026,
      left : 1682
    }
    track['18'] = {
      top : 3026,
      left : 1796
    }
    track['19'] = {
      top : 3026,
      left : 1910
    }
    track['20'] = {
      top : 3026,
      left : 2024
    }
    track['21'] = {
      top : 3026,
      left : 2138
    }
    track['22'] = {
      top : 3026,
      left : 2252
    }
    track['23'] = {
      top : 3026,
      left : 2366
    }
    track['24'] = {
      top : 3026,
      left : 2480
    }
    track['25'] = {
      top : 3026,
      left : 2594
    }
    track['26'] = {
      top : 3026,
      left : 2708
    }
    track['27'] = {
      top : 3026,
      left : 2822
    }
    track['28'] = {
      top : 3026,
      left : 2936
    }
    track['29'] = {
      top : 3026,
      left : 3050
    }

    return track;
  }


  returnElectorateDisplay() {

    let electorates = {};

    electorates['augsburg'] = {
      top: 190,
      left: 3380,
    }
    electorates['trier'] = {
      top: 190,
      left: 3510,
    }
    electorates['cologne'] = {
      top: 190,
      left: 3642,
    }
    electorates['wittenberg'] = {
      top: 376,
      left: 3380,
    }
    electorates['mainz'] = {
      top: 376,
      left: 3510,
    }
    electorates['brandenburg'] = {
      top: 376,
      left: 3642,
    }

    return electorates;

  }


  returnDiplomacyAlliance() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["england"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["france"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["papacy"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["protestant"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hapsburg"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["venice"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["genoa"] 		= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hungary"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["scotland"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
    };

    return diplomacy;
  }

  returnDiplomacyTable() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {};
    diplomacy["england"] 	= {};
    diplomacy["france"] 	= {};
    diplomacy["papacy"] 	= {};
    diplomacy["protestant"] 	= {};
    diplomacy["hapsburg"] 	= {};

    diplomacy["ottoman"]["hapsburg"] = {
        top 	:	205 ,
        left	:	4128 ,
    }
    diplomacy["ottoman"]["england"] = {
        top 	:	205 ,
        left	:	4222 ,
    }
    diplomacy["ottoman"]["france"] = {
        top 	:             205 ,
        left	:	4310 ,
    }
    diplomacy["ottoman"]["papacy"] = {
        top 	:	205 ,
        left	:	4400 ,
    }
    diplomacy["ottoman"]["protestant"] = {
        top 	:	205 ,
        left	:	4490 ,
    }
    diplomacy["ottoman"]["genoa"] = {
        top 	:	205 ,
        left	:	4580 ,
    }
    diplomacy["ottoman"]["hungary"] = {
        top 	:	205 ,
        left	:	4670 ,
    }
    diplomacy["ottoman"]["scotland"] = {
        top 	:	205 ,
        left	:	4760 ,
    }
    diplomacy["ottoman"]["venice"] = {
        top 	:	205 ,
        left	:	4851 ,
    }

    diplomacy["hapsburg"]["ottoman"] = {
        top 	:	205 ,
        left	:	4128 ,
    }
    diplomacy["hapsburg"]["england"] = {
        top 	:	297 ,
        left	:	4220 ,
    }
    diplomacy["hapsburg"]["france"] = {
        top 	:	297 ,
        left	:	4310 ,
    }
    diplomacy["hapsburg"]["papacy"] = {
        top 	:	297 ,
        left	:	4400 ,
    }
    diplomacy["hapsburg"]["protestant"] = {
        top 	:	297 ,
        left	:	4490 ,
    }
    diplomacy["hapsburg"]["genoa"] = {
        top 	:	297 ,
        left	:	4580 ,
    }
    diplomacy["hapsburg"]["hungary"] = {
        top 	:	297 ,
        left	:	4670 ,
    }
    diplomacy["hapsburg"]["scotland"] = {
        top 	:	297 ,
        left	:	4760 ,
    }
    diplomacy["hapsburg"]["venice"] = {
        top 	:	297 ,
        left	:	4851 ,
    }


    diplomacy["england"]["ottoman"] = {
        top 	:	205 ,
        left	:	4222 ,
    }
    diplomacy["england"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4220 ,
    }
    diplomacy["england"]["france"] = {
        top 	:	386 ,
        left	:	4310 ,
    }
    diplomacy["england"]["papacy"] = {
        top 	:	386 ,
        left	:	4400 ,
    }
    diplomacy["england"]["protestant"] = {
        top 	:	386 ,
        left	:	4490 ,
    }
    diplomacy["england"]["genoa"] = {
        top 	:	386 ,
        left	:	4580 ,
    }
    diplomacy["england"]["hungary"] = {
        top 	:	386 ,
        left	:	4670 ,
    }
    diplomacy["england"]["scotland"] = {
        top 	:	386 ,
        left	:	4760 ,
    }
    diplomacy["england"]["venice"] = {
        top 	:	386 ,
        left	:	4851 ,
    }

    diplomacy["france"]["ottoman"] = {
        top 	:       205 ,
        left	:	4310 ,
    }
    diplomacy["france"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4310 ,
    }
    diplomacy["france"]["england"] = {
        top 	:	386 ,
        left	:	4310 ,
    }
    diplomacy["france"]["papacy"] = {
        top     :       478 ,
        left    :       4400 ,    
    }
    diplomacy["france"]["protestant"] = {
        top     :       478 ,
        left    :       4490 ,    
    }
    diplomacy["france"]["genoa"] = {
        top     :       478 ,
        left    :       4580 ,    
    }
    diplomacy["france"]["hungary"] = {
        top     :       478 ,
        left    :       4670 ,    
    }
    diplomacy["france"]["scotland"] = {
        top     :       478 ,
        left    :       4760 ,    
    }
    diplomacy["france"]["venice"] = {
        top     :       478 ,
        left    :       4851 ,    
    }


    diplomacy["papacy"]["ottoman"] = {
        top 	:	205 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["england"] = {
        top 	:	386 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["france"] = {
        top     :       478 ,
        left    :       4400 ,    
    }
    diplomacy["papacy"]["protestant"] = {
        top     :       568 ,
        left    :       4490 ,    
    }
    diplomacy["papacy"]["genoa"] = {
        top     :       568 ,
        left    :       4580 ,    
    }
    diplomacy["papacy"]["hungary"] = {
        top     :       568 ,
        left    :       4670 ,    
    }
    diplomacy["papacy"]["scotland"] = {
        top     :       568 ,
        left    :       4760 ,    
    }
    diplomacy["papacy"]["venice"] = {
        top     :       568 ,
        left    :       4851 ,    
    }

    diplomacy["protestant"]["ottoman"] = {
        top 	:	205 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["hapsburg"] = {
        top 	:	297 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["england"] = {
        top 	:	386 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["france"] = {
        top     :       478 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["papacy"] = {
        top     :       568 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["genoa"] = {
        top     :       658 ,
        left    :       4580 ,    
    }
    diplomacy["protestant"]["hungary"] = {
        top     :       658 ,
        left    :       4670 ,    
    }
    diplomacy["protestant"]["scotland"] = {
        top     :       658 ,
        left    :       4760 ,    
    }
    diplomacy["protestant"]["venice"] = {
        top     :       568 ,
        left    :       4851 ,    
    }

    return diplomacy;

  }




  returnEventObjects() {

    let z = [];

    //
    // factions in-play
    //
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.factions[this.game.state.players_info[i].faction] != undefined) {
        z.push(this.factions[this.game.state.players_info[i].faction]);
      }
    }


    //
    // cards in the deck can modify gameloop
    //
    for (let key in this.deck) {
      z.push(this.deck[key]);
    }
    for (let key in this.diplomatic_deck) {
      z.push(this.diplomatic_deck[key]);
    }

    //
    // debaters have bonuses which modify gameplay
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let key = d.key;
      z.push(this.debaters[key]);
    }

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    //
    // these events run at various points of the game. They are attached to objs
    // on object initialization, so that the objects can have these events 
    // triggered at various points of the game automatically.
    //
    //
    // 
    // 1 = fall through, 0 = halt game
    //
    if (obj.onCommit == null) {
      obj.onCommit = function(his_self, faction) { return 1; } // 1 means fall through
    }
    if (obj.onEvent == null) {
      obj.onEvent = function(his_self, player) { return 1; } // 1 means fall-through / no-stop
    }
    if (obj.canEvent == null) {
      obj.canEvent = function(his_self, faction) { return 0; } // 0 means cannot event
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }





    //
    // functions for convenience
    //
    if (obj.removeFromDeck == null) {
      obj.removeFromDeck = function(his_self, player) { return 0; } 
    }
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    }

    return obj;

  }




  //
  // Core Game Logic
  //
  handleGameLoop() {

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("QUEUE: " + JSON.stringify(this.game.queue));
console.log("MOVE: " + mv[0]);

	//
	// entry point for every round in the game
	//
        if (mv[0] === "round") {


	  this.game.state.round++;

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    this.resetPlayerRound((i+1));
          }

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("action_phase");
//	  this.game.queue.push("spring_deployment_phase");
//	  this.game.queue.push("diplomacy_phase");

	  //
	  // start the game with the Protestant Reformation
	  //
	  if (this.game.state.round == 1) {

//  	    this.game.queue.push("hide_overlay\tdiet_of_worms");
//  	    this.game.queue.push("diet_of_worms");
//  	    this.game.queue.push("show_overlay\tdiet_of_worms");
	    //
	    // cards dealt before diet of worms
	    //
this.game.queue.push("is_testing");
	    this.game.queue.push("card_draw_phase");
//	    this.updateLog("Luther's 95 Theses!");
//	    this.game.queue.push("event\t1\t008");

	  } else {
	    this.game.queue.push("card_draw_phase");
	  }


	  this.game.queue.push("ACKNOWLEDGE\tFACTION: "+JSON.stringify(this.returnPlayerFactions(this.game.player)));

	  if (this.game.state.round > 1) {
	    this.updateStatus("Game Over");
	    return 0;
	  }

          return 1;
        }

        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

	if (mv[0] === "halt") {
	  return 0;
	}

	if (mv[0] === "show_overlay") {

	  if (mv[1] === "theses") { this.theses_overlay.render(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.render(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.render(); }
	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "burn_books") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "publish_treatise") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "theological_debate") { this.debate_overlay.render(); }
	  if (mv[1] === "field_battle") {
	    if (mv[2] === "post_field_battle_attackers_win") { this.field_battle_overlay.attackersWin(his_self.game.state.field_battle); }
	    if (mv[2] === "post_field_battle_defenders_win") { this.field_battle_overlay.defendersWin(his_self.game.state.field_battle); }
	  }
          this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "hide_overlay") {
	  if (mv[1] === "theses") { this.theses_overlay.hide(); }
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
	  if (mv[1] === "burn_books") { this.theses_overlay.hide(); }
	  if (mv[1] === "publish_treatise") { this.theses_overlay.hide(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.hide(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.hide(); }
	  if (mv[1] === "theological_debate") { this.debate_overlay.hide(); }
	  if (mv[1] === "field_battle") { this.field_battle_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "pass") {
          let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

          for (let z = 0; z < this.game.state.players_info[player-1].factions.length; z++) {
	    if (this.game.state.players_info[player-1].factions[z] == faction) {
	      this.game.state.players_info[player-1].factions_passed[z] = true;
	    }
	  }

	  this.updateLog(faction + " passes");

          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "build") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.game.spaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	    if (land_or_sea === "sea") {
	      this.game.navalspaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	  }

	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "activate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.activateMinorPower(faction, power);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "deactivate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.deactivateMinorPower(faction, power);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "remove_unit") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.removeUnit(faction, spacekey, unit_type);
	    }
	    if (land_or_sea === "sea") {
	      this.removeUnit(faction, unit_type, spacekey);
	    }
	  }

	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "retreat_to_winter_spaces") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.spaces) {
	    for (let key in this.game.spaces[i].units) {
	      if (this.game.spaces[i].units[key].length > 0) {
	        let space = this.game.spaces[i];
		if (!this.isSpaceFortified(space)) {
		  let res = this.returnNearestFriendlyFortifiedSpaces(key, space);
		  moves.push("retreat_to_winter_spaces_player_select\t"+key+"\t"+space.key);
		}
	      }
	    }
	  }

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_spaces_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolveWinterRetreat(mv[1], mv[2]);
	    return 0;
	  } else {
	    this.updateStatus(mv[1] + " is selecting winter retreat options from " + mv[2]);
	    if (x > 0) { return 0; }
	  }

	  //
	  // non-player controlled factions skip winter retreat
	  //
	  return 1;

        }


	if (mv[0] === "retreat_to_winter_spaces_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.spaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.spaces[from].units[faction][i]);
	    this.game.spaces[from].units[faction].splice(i, 1);
	  }

	  return 1;

        }




	if (mv[0] === "retreat_to_winter_ports") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.navalspaces) {
	    for (let key in this.game.navalspaces[i].units) {
	      if (this.game.navalspaces[i].units[key].length > 0) {
	        let space = this.game.navalspaces[i];
		let res = this.returnNearestFactionControlledPorts(key, space);
		moves.push("retreat_to_winter_ports_player_select\t"+key+"\t"+space.key);
	      }
	    }
	  }

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_ports_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolvePortsWinterRetreat(mv[1], mv[2]);
	  } else {
	    this.updateStatus(mv[1] + " is selecting winter port retreat options from " + mv[2]);
	  }

	  return 0;

        }


	if (mv[0] === "retreat_to_winter_ports_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.navalspaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.navalspaces[from].units[faction][i]);
	    this.game.navalspaces[from].units[faction].splice(i, 1);
	  }

	  return 1;

        }

	if (mv[0] === "add_army_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  this.addArmyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}

	if (mv[0] === "add_navy_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  this.addNavyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}



	if (mv[0] === "is_testing") {

	  //this.game.queue.push("retreat_to_winter_spaces");

    	  //
    	  // IS_TESTING -- TEMPORARY
    	  //
    	  this.addDebater("papacy", "bucer-debater");
    	  this.addDebater("protestant", "aleander-debater");
    	  this.addDebater("protestant", "bullinger-debater");
    	  this.addDebater("protestant", "campeggio-debater");


    	  this.activateMinorPower("papacy", "venice");

    	  this.convertSpace("protestant", "graz");
    	  this.controlSpace("protestant", "graz");
    	  this.addRegular("protestant", "graz", 3);
    	  this.addRegular("venice", "trieste", 4);
    	  this.addRegular("venice", "agram", 4);
    	  this.game.spaces['agram'].type = "fortress";

    	  this.addCard("papacy", "017");
//    	  this.addCard("protestant", "036");
//    	  this.addCard("protestant", "026");
//    	  this.addCard("protestant", "027");
//    	  this.addCard("protestant", "028");
//    	  this.addCard("papacy", "029");
//    	  this.addCard("papacy", "030");
//    	  this.addCard("papacy", "024");
//    	  this.addCard("papacy", "025");

    	  this.game.spaces['graz'].type = 'key';
    	  this.game.spaces['graz'].occupier = 'protestant';

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}

        if (mv[0] === "diplomacy_card_event") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.diplomatic_deck[card].onEvent(this, faction)) { return 0; }

	  return 1;
	}


        if (mv[0] === "event") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.deck[card].onEvent(this, faction)) { 
console.log("onEvent RETURNED 0 -- STOPPING");
return 0; }

	  return 1;
	}


        if (mv[0] === "card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayCard(card, p, faction);
	  }
	  
	  return 0;

	}

        if (mv[0] === "ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayOps(card, faction, opsnum);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing ops");
	  }
	  
	  return 0;

	}

	if (mv[0] === "moveunit") {

	  let faction   = mv[1];
	  let from_type = mv[2];
	  let from_key  = mv[3];
	  let from_idx  = mv[4];
	  let to_type   = mv[5];
	  let to_key    = mv[6];

	  let unit_to_move;

	  this.game.queue.splice(qe, 1);

	  if (from_type === "sea") {
	    unit_to_move = this.game.navalspaces[from_key].units[faction][from_idx];
	  }
	  if (from_type === "land") {
	    unit_to_move = this.game.spaces[from_key].units[faction][from_idx];
	  }

	  if (to_type === "sea") {
	    this.game.navalspaces[to_key].units[faction].push(unit_to_move);
	  }
	  if (to_type === "land") {
	    this.game.spaces[to_key].units[faction].push(unit_to_move);
	  }

	  return 1;

	}

        if (mv[0] === "lock") {

	  let faction = mv[1];
	  let source = mv[2];

	  this.game.queue.splice(qe, 1);

	  for (let i = 0; i < this.game.spaces[source].units[faction].length; i++) {
	    this.game.spaces[source].units[faction][i].locked = true;
	  }

          return 1;

        }


        if (mv[0] === "move") {

	  let faction = mv[1];
	  let movetype = mv[2];
	  let source = mv[3];
	  let destination = mv[4];
	  let unitidx = parseInt(mv[5]);
	  let skip_avoid_battle = parseInt(mv[6]);

	  this.game.queue.splice(qe, 1);

	  if (movetype === "sea") {

	    //
	    // source = land, destination = sea
	    //
	    if (this.game.spaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.spaces[source].units[faction][unitidx];
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.spaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displaySpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = sea
	    //
	    if (this.game.navalspaces[source] && this.game.navalspaces[destination]) {
	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = land
	    //
	    if (this.game.navalspaces[source] && this.game.spaces[destination]) {

	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
              this.game.spaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displaySpace(destination);
	    }

	    //
	    // do we have a jolly sea battle?
	    //
            let space;
	    if (this.game.spaces[destination]) {
	      space = this.game.spaces[destination];
	    }
	    if (this.game.navalspaces[destination]) {
	      space = this.game.navalspaces[destination];
	    }

            let anyone_else_here = 0;

            let lqe = qe-1;
            if (lqe >= 0) {
              let lmv = this.game.queue[lqe].split("\t");
              if (lmv[0] == "naval_interception_check") {
                for (let f in space.units) {
                  if (space.units[f].length > 0 && f != faction) {
                    anyone_else_here = 1;
                  }
                  if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
                    if (lqe-1 >= 0) {
                      // added in reverse order
                      if (skip_avoid_battle != 1) {
                        this.game.queue.splice(lqe, 0, "naval_retreat_check\t"+faction+"\t"+destination+"\t"+source);
                      }
                      this.game.queue.splice(lqe, 0, "RESETCONFIRMSNEEDED\tall");
                      this.game.queue.splice(lqe, 0, "counter_or_acknowledge\tNaval Battle is about to begin in "+destination + "\tnaval_battle");
                      this.game.queue.splice(lqe, 0, "naval_battle\t"+space.key+"\t"+faction);
                    }
                  }
                }
              } else {
                //
                // we only update the occupier of the space if the next move is not a "move"
                // as we require interception check to find out if there are units here already.
                //
                if (lmv[0] !== "move") {
                  if (anyone_else_here == 0) {
                    space.occupier = faction;
                  }
                }
              }
            }
	  }


	  if (movetype === "land") {

console.log("SOURCE: " + JSON.stringify(this.game.spaces[source].units[faction])); 
	    let unit_to_move = this.game.spaces[source].units[faction][unitidx];
            this.game.spaces[destination].units[faction].push(unit_to_move);
            this.game.spaces[source].units[faction].splice(unitidx, 1);
console.log("UNIT TO MOVE: " + JSON.stringify(unit_to_move));
	    this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	    this.displaySpace(source);
	    this.displaySpace(destination);

	    //
	    // if this space contains two non-allies, field-battle or siege must occur
	    //
	    let space = this.game.spaces[destination];
	    let anyone_else_here = 0;

	    let lqe = qe-1;
	    if (lqe >= 0) {
	      let lmv = this.game.queue[lqe].split("\t");
	      if (lmv[0] == "interception_check") {
	        for (let f in space.units) {
	          if (space.units[f].length > 0 && f != faction) {
		    anyone_else_here = 1;
	          }
	          if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
		    if (lqe-1 >= 0) {
		      // added in reverse order
		      if (skip_avoid_battle != 1) {
	                this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
	                this.game.queue.splice(lqe, 0, "fortification_check\t"+faction+"\t"+destination+"\t"+source);
		      }
	              this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	            }
	          }
	        }
	      } else {
		//
		// we only update the occupier of the space if the next move is not a "move"
		// as we require interception check to find out if there are units here already.
		//
		if (lmv[0] !== "move") {
	          if (anyone_else_here == 0) {
	            space.occupier = faction;
		  }
		}
	      }
	    }

console.log("SOURCE: " + JSON.stringify(this.game.spaces[source].units));
console.log("DESTIN: " + JSON.stringify(this.game.spaces[destination].units));

	    this.displaySpace(source);
	    this.displaySpace(destination);

	  }

          return 1;
	}


        if (mv[0] === "fortification_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];

	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.type !== "key" && space.type !== "fortress") {
	    return 1;
	  }

	  //
	  // whoever is being attacked can retreat into the fortification if they
	  // have 4 or less land units
	  //
	  for (f in this.factions) {
	    if (f !== attacker && this.isSpaceControlled(spacekey, f)) {

	      let fluis = this.returnFactionLandUnitsInSpace(f, spacekey);

	      if (fluis == 0) {
		//
		// no troops - skip
		//
	      } else {

	        if (fluis > 4) {

		  // must land battle

	        } else {

		  if (this.isMinorPower(f)) {

		    if (this.isMinorUnactivatedPower(f)) {

		      //
		      // auto-handled -- we retreat for siege
		      //
		      this.game.queue.push("fortification\t"+attacker+"\t"+f+"\t"+spacekey);

		    } else {

		      //
 		      // major power decides
		      //
		      let cf = "";
		      let mp = f;

		      if (this.game.state.activated_powers['ottoman'].includes(f)) { cf = "ottoman"; }
		      if (this.game.state.activated_powers['hapsburg'].includes(f)) { cf = "hapsburg"; }
		      if (this.game.state.activated_powers['france'].includes(f)) { cf = "france"; }
		      if (this.game.state.activated_powers['england'].includes(f)) { cf = "england"; }
		      if (this.game.state.activated_powers['papacy'].includes(f)) { cf = "papacy"; }
		      if (this.game.state.activated_powers['protestant'].includes(f)) { cf = "protestant"; }

		      let cp = this.returnPlayerOfFaction(cf);

		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+mp+"\t"+spacekey);

		    }

	          } else {

		    //
		    // major or independent power - some player decides
		    //
		    let cp = this.returnPlayerOfFaction(f);
		    if (cp != 0) {
		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+f+"\t"+spacekey);
		    } else {

	              //
		      // independent key
	              //
	              // non-player controlled, minor power or independent, so auto-handle
	              //
	              // If there are 4 or fewer land units in a space, they will always withdraw into
	              // the fortifications and try to withstand a siege if their space is entered.
	              // if there are 5 or more land units,they will hold their ground and fight a field
	              // battle. If they lose that field battle, do not retreat their units from the
	              // space as usual. Instead, they retain up to 4 units which withdraw into the
	              // fortifications; all other land units in excess of 4 are eliminated.
	              //
	              // fortify everything
	              //
	              for (let i = 0; i < space.units[f].length; i++) {
	                his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(space.units[f][i]));
	              }
		    }
	          }
	        }
	      }

	    } else {

	      //
	      // no land units (skip)
	      //

	    }
	  }

          return 1;

	}

        if (mv[0] === "post_field_battle_player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
          let space = this.game.spaces[spacekey];

	  //
	  // if this is not a fortified space, clear and continue
	  //
	  if (space.type !== "fortress" && space.type !== "electorate" && space.type !== "key") {
	    return 1;
	  }

	  //
	  // otherwise, we have to evaluate fortifying
	  //
	  if (this.game.player == player) {
	    this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	      this.field_battle_overlay.updateinstructions(faction + " considering fortification");
	      this.updateStatus(faction + " considering fortification");
	      this.updateLog(faction + " evaluating retreat into fortification");
	    } else {

	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into 
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field 
	      // battle. If they lose that field battle, do not retreat their units from the 
	      // space as usual. Instead, they retain up to 4 units which withdraw into the 
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
      	      // this only runs after we have had a battle, so we fortify everything if we still
	      // exist. 
      	      //
	      //
	      // fortify everything
	      //
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	      return 1;
	    }
	  }
	
          return 0;

	}

        if (mv[0] === "player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
	  let space = this.game.spaces[spacekey];

	  if (this.game.player == player) {
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.updateStatus(faction + " considering fortification");
	      this.updateLog(faction + " evaluating retreat into fortification");
	    } else {
	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into 
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field 
	      // battle. If they lose that field battle, do not retreat their units from the 
	      // space as usual. Instead, they retain up to 4 units which withdraw into the 
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
      	      // this only runs after we have had a battle, so we fortify everything if we still
	      // exist. 
      	      //
	      //
	      // fortify everything
	      //
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	      return 1;
	    }
	  }
	
          return 0;

	}



	if (mv[0] === "fortify_unit") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let units = JSON.parse(mv[3]);
	  let space = this.game.spaces[spacekey];

          space.besieged = 2; // 2 = cannot attack this round
          space.besieged_factions.push(f);
	  for (let i = 0; i < units.length; i++) {
	    space.units[faction][units[i]].besieged = 1;
	  }

	  return 1;

        }


        if (mv[0] === "fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let faction = mv[2];
	  let spacekey = mv[3];
	  let space = this.game.spaces[spacekey];

	  let faction_map = this.returnFactionMap(space, attacker, faction);
	  let player = this.returnPlayerOfFaction(faction);

console.log("REMOVING EVERYTHING BEFORE FIELD BATTLE");
	  
	  for (let i = this.game.queue.length-1; i >= 0; i--) {
	    let lmv = this.game.queue[i].split("\t");
	    //
	    // remove everything before field_battle
	    //
	    if (lmv[0] !== "field_battle") {
	      this.game.queue.splice(i, 1);
	    } else {
	      break;
	    }
	  }

	  if (this.game.player === player) {
console.log("0. this player is fortifying space: " + faction + " / " + attacker + " / " + spacekey);
	    this.playerFortifySpace(faction, attacker, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
console.log("1. PLAYER IS CONTROLLED as: " + player);
	      this.updateStatus(this.returnFactionName(faction) + " handling retreat into fortification");
	    } else {
console.log("2. PLAYER IS DEFINED as: " + player);
	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into 
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field 
	      // battle. If they lose that field battle, do not retreat their units from the 
	      // space as usual. Instead, they retain up to 4 units which withdraw into the 
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
	      if (space.units[faction].length <= 4) {
		// fortify everything
		for (let i = 0; i < space.units[faction].length; i++) {
		  his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
		}
	      } else {
		//
		// go into field battle
		//
	      }
	      return 1;
	    }
	  }
	
          return 0;

	}





        if (mv[0] === "retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];
	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerOfFaction(attacker);


	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker) {
console.log("considering retreat options for " + io[i]);
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.canFactionRetreatToSpace(io[i], neighbours[zz], attacker_comes_from_this_spacekey);
console.log("possible? " + fluis);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i]);
	          }
	        }
	      }
	    }
	    for (let zz = 0; zz < this.game.state.activated_powers[io[i]].length; zz++) {
	      let ap = this.game.state.activated_powers[io[i]][zz];
	      if (ap != attacker) {
console.log("considering retreat options for " + ap);
	        let fluis = this.canFactionRetreatToSpace(ap, neighbours[zz], attacker_comes_from_this_spacekey);
console.log("possible? " + fluis);
	        if (fluis > 0) {
	          this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap);
	        }
	      }
	    }
	  }

          return 1;

	}



        if (mv[0] === "player_evaluate_retreat_opportunity") {

console.log("pero");
console.log(JSON.stringify(mv));

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  let defender = mv[4];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender)) {
	    this.playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
	  } else {
	    this.updateStatus(defender + " considering retreat");
	  }

	  return 0;

	}


	if (mv[0] === "naval_retreat") {

	  let faction = mv[1];
	  let source_spacekey = mv[2];
	  let destination_spacekey = mv[3];

	  let source;
	  if (this.game.spaces[source_spacekey]) { source = this.game.spaces[source_spacekey]; }
	  if (this.game.navalspaces[source_spacekey]) { source = this.game.navalspaces[source_spacekey]; }

	  let destination;
	  if (this.game.spaces[destination_spacekey]) { source = this.game.spaces[destination_spacekey]; }
	  if (this.game.navalspaces[destination_spacekey]) { source = this.game.navalspaces[destination_spacekey]; }

	  for (let i = source.units[faction].length-1; i >= 0; i--) {
	    if (source.units[faction][i].land_or_sea == "sea" || source.units[faction][i].land_or_sea == "both") {
	      destination.units[faction].push(source.units[faction][i]);
	      source.units[faction].splice(i, 1);
	    }
	  }

	  this.displaySpace(source_spacekey);
	  this.displayNavalSpace(source_spacekey);
	  this.displaySpace(destination_spacekey);
	  this.displayNavalSpace(destination_spacekey);
	  
	  return 1;

	}



        if (mv[0] === "retreat") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

	  let source = this.game.spaces[from];
	  let destination = this.game.spaces[to];

	  for (let i = 0; i < source.units[faction].length; i++) {
	    source.units[faction][i].locked = true;
	    destination.units[faction].push(source.units[faction][i]);
	  }

	  source.units[faction] = [];
	  this.displaySpace(from);
	  this.displaySpace(to);

          return 1;

	}


        if (mv[0] === "naval_battle_hits_assignment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let hits_to_assign = parseInt(mv[2]);
	  let space = mv[3];

	  let player = this.returnPlayerOfFaction(faction);
	  if (player > 0) {
	    if (this.game.player === player) {
	      this.playerAssignNavalHits(faction, space, hits_to_assign);
	    } else {
	      this.updateStatus(faction + " assigning hits [ " + hits_to_assigns + " ]");
	    }
	  } else {
	    return 1;
	  }

	  return 0;
	}




        if (mv[0] === "interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let includes_cavalry = parseInt(mv[3]);

	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes

	  let attacking_player = this.returnPlayerOfFaction(faction);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction != 0) {
  	      if (io[i] !== faction) {
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.returnFactionLandUnitsInSpace(io[i], neighbours[zz]);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+includes_cavalry+"\t"+io[i]+"\t"+neighbours[zz]);
	          }
	        }
	      }
	    }

	    for (let zz = 0; zz < this.game.state.activated_powers[io[i]].length; zz++) {
	      let ap = this.game.state.activated_powers[io[i]][zz];
	      if (ap != faction) {
	        let fluis = this.returnFactionLandUnitsInSpace(ap, neighbours[zz]);
	        if (fluis > 0) {
	          this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"0"+"\t"+ap+"\t"+neighbours[zz]);
	        }
	      }
	    }
	  }
          return 1;
	}


        if (mv[0] === "naval_interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];

	  let neighbours = this.returnNavalAndPortNeighbours(spacekey);
	  let attacking_player = this.returnPlayerOfFaction(faction);

	  //
	  // interception at port is not possible
	  //
	  if (this.game.spaces[spacekey]) {
	    console.log("INTERCEPTIONS INVOLVING PORTS NOT SUPPORTED YET");
	  }

	  //
	  //
	  //
	  if (this.game.navalspaces[spacekey]) {

	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i>= 0; i--) {
	      let player_of_faction = this.returnPlayerOfFaction(io[i]);
	      if (player_of_faction != attacking_player && player_of_faction != 0) {
  	        if (io[i] !== faction) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.returnFactionSeaUnitsInSpace(io[i], neighbours[zz]);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+io[i]+"\t"+neighbours[zz]);
	            }
	          }
	        }
	      }

	      for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	        let ap = this.game.state.activated_powers[io[i]][z];
	        if (ap != faction) {
	          let fluis = this.returnFactionSeaUnitsInSpace(ap, neighbours[z]);
	          if (fluis > 0) {
	            this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+ap+"\t"+neighbours[z]);
	          }
	        }
	      }
	    }
	  }
          return 1;
	}


        if (mv[0] === "player_evaluate_naval_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender)) {
	    this.playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering naval interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "player_evaluate_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = mv[3];
	  let defender = mv[4];
	  let defender_spacekey = mv[5];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender)) {
	    this.playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "intercept") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = parseInt(mv[3]);
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let units_to_move_idx = JSON.parse(mv[6]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for cavalry, leaders
	  //
	  let s = this.game.spaces[defender_spacekey];
          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_has_cavalry = 0;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].type === "cavalry") { defender_has_cavalry = 1; }
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " moves to intercept from " + this.returnSpaceName(defender_spacekey));

	  if (attacker === "ottoman" && attacker_includes_cavalry) {
	    this.updateLog("Ottoman +1 cavalry bonus");
	    hits_on++; 
	  }
	  if (defender === "ottoman" && defender_has_cavalry) {
	    this.updateLog("Ottoman -1 cavalry bonus");
	    hits_on--; 
	  }
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from formation leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

	  // IS_TESTING
// HACK -- always win at 2
hits_on = 2;

	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

console.log("1. insert index: " + index_to_insert_moves);

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_navel_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[3] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
		}
	      } 
	    }

console.log("2. insert index: " + index_to_insert_moves);

	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    
	    for (let i = units_to_move_idx.length-1; i >= 0; i--) {
	      let m = "move\t"+defender+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i]+"\t"+1; // 1 = skip avoid battle
	      his_self.game.queue.splice((index_to_insert_moves+1), 0, m);
	    }
	    let m = "lock\t"+defender+"\t"+spacekey; // 1 = skip avoid battle
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, m);
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, ("field_battle\t"+spacekey+"\t"+attacker));

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}




        if (mv[0] === "naval_intercept") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];
	  let units_to_move_idx = JSON.parse(mv[5]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for squadrons, corsairs, navy leaders
	  //
	  let s;
	  if (this.game.spaces[defender_spacekey]) {
	    s = this.game.spaces[defender_spacekey];
	  }
	  if (this.game.navalspaces[defender_spacekey]) {
	    s = this.game.navalspaces[defender_spacekey];
	  }

          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " navy moves to intercept from " + this.returnSpaceName(defender_spacekey));
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from navy leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

	  // IS_TESTING
	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE FOR THIS DESTINATION
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_naval_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[2] != spacekey) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	          index_to_insert_moves = i;
		  break;
		}
	        if (lmv[3] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	        } 
	      }
	    }


	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+defender+"\tsea\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i+"\t"+1]; // 1 = skip avoid battle
	      his_self.game.queue.splice(index_to_insert_moves, 0, m);
	    }

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}


        if (mv[0] === "diet_of_worms") {

	  let game_self = this;

          game_self.game.queue.push("resolve_diet_of_worms");

	  //
	  // flip hapsburg card from deck if 2-player game
	  //
	  if (game_self.game.players.length == 2) {
	    // hapsburg card goes to pool
            game_self.game.queue.push("POOLDEAL\t1\t1\t1"); // deck 1
            game_self.game.queue.push("POOL\t1"); // deck 1
	  }

          //
          // remove mandatory events from both hands
	  //
	  let x = [];
	  for (let i = 0; i < this.game.deck[0].fhand[0].length; i++) {
console.log("CARDS: " + JSON.stringify(this.game.deck[0].fhand));
	    if (this.game.deck[0].cards[this.game.deck[0].fhand[0][i]].type === "mandatory") {} else { x.push(this.game.deck[0].fhand[0][i]); }
	  }

          this.updateStatusAndListCards("Pick your Card for the Diet of Worms", x);
          this.attachCardboxEvents(function(card) {

            game_self.updateStatus("You picked: " + game_self.deck[card].name); 
 
            let hash1 = game_self.app.crypto.hash(card);    // my card
            let hash2 = game_self.app.crypto.hash(Math.random().toString());  // my secret
            let hash3 = game_self.app.crypto.hash(hash2 + hash1);             // combined hash

            let card_sig = game_self.app.crypto.signMessage(card, game_self.app.wallet.returnPrivateKey());
            let hash2_sig = game_self.app.crypto.signMessage(hash2, game_self.app.wallet.returnPrivateKey());
            let hash3_sig = game_self.app.crypto.signMessage(hash3, game_self.app.wallet.returnPrivateKey());

            game_self.game.spick_card = card;
            game_self.game.spick_hash = hash2;

            game_self.addMove("SIMULTANEOUS_PICK\t"+game_self.game.player+"\t"+hash3+"\t"+hash3_sig);
            game_self.endTurn();

          });

	  this.game.queue.splice(qe, 1);
          return 0;
        }

	if (mv[0] === "resolve_diet_of_worms") {

	  this.game.queue.splice(qe, 1);

	  let protestant = this.returnPlayerOfFaction("protestant");
	  let papacy = this.returnPlayerOfFaction("papacy");
	  let protestant_arolls = [];
	  let papacy_arolls = [];

	  let all_players_but_protestant = [];
	  let all_players_but_papacy = [];
          for (let i = 1; i <= this.game.players.length; i++) {
	    if (i != protestant) { all_players_but_protestant.push(i); }
	    if (i != papacy) { all_players_but_papacy.push(i); }
	  }

	  let protestant_card = this.game.deck[0].cards[this.game.state.sp[protestant-1]];
	  let papacy_card = this.game.deck[0].cards[this.game.state.sp[papacy-1]];
	  let hapsburg_card = this.game.pool[0].hand[0];

console.log("X: " + JSON.stringify(this.game.pool[0].hand));
console.log("POOL: " + hapsburg_card);


	  //
	  // show card in overlay
	  //
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[protestant-1], "protestant");
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[papacy-1], "catholic");
	  this.diet_of_worms_overlay.addCardToCardfan(hapsburg_card, "catholic");


	  //
	  // discard the selected cards
	  //
	  this.game.queue.push("discard\tprotestant\t"+this.game.state.sp[protestant-1]);
	  this.game.queue.push("discard\tpapacy\t"+this.game.state.sp[papacy-1]);
	  this.game.queue.push("discard\tall\t"+hapsburg_card);

	  //
	  // 3. roll protestant dice: The Protestant player adds 4 to the CP value of his card. 
	  // This total represents the number of dice he now rolls. Each roll of a “5” or a “6” 
	  // is considered to be a hit.
	  //
	  // 4. roll papal and Hapsburg dice: The Papal player rolls a num- ber of dice equal to 
	  // the CP value of his card. The Hapsburg player does the same. Each roll of a “5” or a
	  // “6” is considered to be a hit. These two powers combine their hits into a Catholic total.
	  // 
	  // 5. protestant victory: If the number of Protestant hits exceeds the number of Catholic 
	  // hits, the Protestant power flips a number of spaces equal to the number of extra hits he 
	  // rolled to Protestant influence. All spaces flipped must be in the German language zone. 
	  // Spaces flipped must be adjacent to another Protestant space; spaces that were just 
	  // flipped in this step can be used as the required adjacent Protestant space.
	  //
	  // 6. Catholic Victory: If the number of Catholic hits exceeds the number of Protestant hits,
	  // the Papacy flips a number of spaces equal to the number of extra hits he rolled to Catholic 
	  // influence. All spaces flipped must be in the German language zone. Spaces flipped must be 
	  // adjacent to another Catholic space; spaces that were just flipped in this step can be used 
	  // as the required adjacent Catholic space.
	  //

	  let protestant_rolls = protestant_card.ops + 4;
	  let protestant_hits = 0;

	  for (let i = 0; i < protestant_rolls; i++) {
	    let x = this.rollDice(6);
	    protestant_arolls.push(x);
	    this.updateLog("Protestants roll: " + x);
	    if (x >= 5) { protestant_hits++; }
	  }

	  let papacy_rolls = papacy_card.ops;
	  let papacy_hits = 0;

	  for (let i = 0; i < papacy_rolls; i++) {
	    let x = this.rollDice(6);
	    papacy_arolls.push(x);
	    this.updateLog("Papacy rolls: " + x);
	    if (x >= 5) { papacy_hits++; }
	  }

	  //
	  // TODO: do the hapsburgs get rolls in the 2P game?
	  //
	  // yes -- card pulled from top of deck, or 2 if mandatory event pulled
	  // in which case the event is ignored.
	  //
	  for (let i = 0; i < 2; i++) {
	    let x = this.rollDice(6);
	    papacy_arolls.push(x);
	    this.updateLog("Hapsburg rolls: " + x);
	    if (x >= 5) { papacy_hits++; }
	  }

	  if (protestant_hits > papacy_hits) {
	    this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "protestant" , difference : (protestant_hits - papacy_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	    this.game.queue.push("hide_overlay\ttheses");
	    let total_conversion_attempts = protestant_hits - papacy_hits;
	    for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfCatholicSpacesInLanguageZone(); i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
  	    this.game.queue.push("STATUS\tProtestants selecting towns to convert...\t"+JSON.stringify(all_players_but_protestant));
  	    this.game.queue.push("show_overlay\ttheses");
  	    this.game.queue.push("ACKNOWLEDGE\tProtestants win Diet of Worms");

	  } else {
	    if (protestant_hits < papacy_hits) {
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "papacy" , difference : (papacy_hits - protestant_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("hide_overlay\ttheses");
	      let total_conversion_attempts = papacy_hits - protestant_hits;
	      for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfProtestantSpacesInLanguageZone(); i++) {
	        this.game.queue.push("select_for_catholic_conversion\tpapacy\tgerman");
	      }
  	      this.game.queue.push("STATUS\tPapacy selecting towns to convert...\t"+JSON.stringify(all_players_but_papacy));
  	      this.game.queue.push("show_overlay\ttheses");
  	      this.game.queue.push("ACKNOWLEDGE\tPapacy wins Diet of Worms");
	    } else {
  	      //
              // report results
              //
	      this.updateLog("Diet of Worms ends in tie.");
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "none" , difference : 0 , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("ACKNOWLEDGE\tDiet of Worms ends in a Stalemate");
	    }
	  }

          return 1;

	}

	//
	// this does not auto-remove, it needs to be preceded by a RESETCONFIRMSNEEDED
	// for however many people need to have the opportunity to counter or acknowledge.
	//
	if (mv[0] === "insert_before_counter_or_acknowledge") {
	
          this.game.queue.splice(qe, 1);

	  let insert = "";
	  for (let i = 1; i < mv.length; i++) {
	    if (i > 1) { insert += "\t"; }
	    insert += mv[i];
	  }

	  for (let i = this.game.queue.length-1; i >= 0; i--) {
	    let lqe = this.game.queue[i];
	    let lmv = lqe.split("\t");
	    if (lmv[0] === "counter_or_acknowledge") {
	      this.game.queue.splice(i, 0, insert);
	      i = 0;
	    } 
	  }
	  
	  return 1;

        }
	if (mv[0] === "counter_or_acknowledge") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();


	  if (this.game.state.skip_counter_or_acknowledge == 1) {
            this.game.queue.splice(qe, 1);
	    return 1;
 	  }

	  //
	  // return 1
	  //
	  if (this.game.confirms_needed[this.game.player-1] == 0) {
	    let ack = 1;

	    for (let i = 0; i < this.game.confirms_needed.length; i++) {
	      if (this.game.confirms_needed[i] == 1) { ack = 0; }
	    }
	    if (ack == 1) { this.game.queue.splice(qe, 1);}
	    this.updateStatus("acknowledged");
	    return ack;
	  }

	  let msg = mv[1];
	  let stage = mv[2];
	  let extra = "";
	  if (mv[3]) { extra = mv[3]; }

	  //
	  // this is run when players have the opportunity to counter
	  // or intercede in a move made by another player. we cannot
	  // automatically handle without leaking information about 
	  // game state, so we let players determine themselves how to
	  // handle. if they are able to, they can respond. if not they
	  // click acknowledge and the msg counts as notification of an
	  // important game development.
	  //
	  let his_self = this;

	  let html = '<ul>';

	  let menu_index = [];
	  let menu_triggers = [];
	  let attach_menu_events = 0;

    	  html += '<li class="option" id="ok">acknowledge</li>';

          let z = this.returnEventObjects();
	  for (let i = 0; i < z.length; i++) {
            if (z[i].menuOptionTriggers(this, stage, this.game.player, extra) == 1) {
              let x = z[i].menuOption(this, stage, this.game.player, extra);
              html += x.html;
	      z[i].faction = x.faction; // add faction
	      menu_index.push(i);
	      menu_triggers.push(x.event);
	      attach_menu_events = 1;
	    }
	  }
	  html += '</ul>';

	  this.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.show(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.show(action2);
	    }
          });
	  $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	  });
          $('.option').on('click', function () {

            let action2 = $(this).attr("id");

	    //
	    // this ensures we clear regardless of choice
	    //
            his_self.addMove("RESOLVE\t"+his_self.app.wallet.returnPublicKey());

            //
            // events in play
            //
            if (attach_menu_events == 1) {
              for (let i = 0; i < menu_triggers.length; i++) {
                if (action2 == menu_triggers[i]) {
                  $(this).remove();
                  z[menu_index[i]].menuOptionActivated(his_self, stage, his_self.game.player, z[menu_index[i]].faction);
                  return;
                }
              }
            }

            if (action2 == "ok") {
	      his_self.updateStatus("acknowledged");
              his_self.endTurn();
              return;
            }

          });

	  return 0;

	}



	if (mv[0] === "naval_battle") {

          this.game.queue.splice(qe, 1);

	  this.game.state.naval_battle = {};

	  //
	  // count units
	  //
          let calculate_units = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 1; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 2; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }

	  //
	  // this is run when a naval battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) { space = this.game.spaces[mv[1]]; }
	  if (this.game.navalspaces[mv[1]]) { space = this.game.navalspaces[mv[1]]; }
	  let attacker = mv[2];
	  let stage = "naval_battle";

	  //
	  // ok -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);


	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let fp = his_self.returnPlayerOfFaction(f);
	      let p = {};
	      if (fp > 0) { p = his_self.game.state.players_info[fp-1]; }
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) { 
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	          } 
		}
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === defender_faction) {
	      let fp = his_self.returnPlayerOfFaction(f);
	      if (fp > 0) {
  	        let p = {};
	        if (fp > 0) { let p = his_self.game.state.players_info[fp-1]; }
	        let dp = his_self.game.state.players_info[defender_player-1];
	        if (p && dp) {
	          if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	          if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	          if (p.tmp_roll_modifiers.length > 0) { 
	      	    for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	              dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	            } 
	          } 
	        } 
	      }
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = 0;
          let defender_units = 0;
	  let defender_port_bonus = 0;
	  if (this.game.spaces[mv[1]]) { defender_port_bonus++; defender_rolls++; }

	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_units += calculate_units(f);
	      attacker_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_units += calculate_units(f);
	      defender_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }
	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // "professional rowers" may be played after dice are rolled, so we roll the dice
	  // now and break ("naval_battle_continued" afterwards...
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Professional Rowers may 
	  // be played to modify dice rolls.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue.
	  //

	  //
	  // save battle state
	  //
	  his_self.game.state.naval_battle.attacker_units = attacker_units;
	  his_self.game.state.naval_battle.defender_units = defender_units;
	  his_self.game.state.naval_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.naval_battle.defender_rolls = defender_rolls;
	  his_self.game.state.naval_battle.attacker_results = attacker_results;
	  his_self.game.state.naval_battle.defender_results = defender_results;
	  his_self.game.state.naval_battle.attacker_faction = attacker_faction;
	  his_self.game.state.naval_battle.defender_faction = defender_faction;
	  his_self.game.state.naval_battle.faction_map = faction_map;

	  his_self.game.queue.push(`naval_battle_continue\t${mv[1]}`);
	  his_self.game.queue.push(`counter_or_acknowledge\tNaval Battle Hits Assigmentt\tnaval_battle_hits_assignment`);
	  his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);

	  return 1;

        }





	if (mv[0] === "field_battle") {

          this.game.queue.splice(qe, 1);

	  //
	  // we will create this object dynamically
	  //
	  this.game.state.field_battle = {};

	  //
	  // calculate rolls 
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
	    let units = [];
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].personage == false) {
		if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	          rolls++;
		  units.push(space.units[faction][i].type);
	        }
	      }
	    }
	    return { rolls : rolls , units : units };
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }

	  //
	  // this is run when a field battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, the rest of this function moves to to handle the on-the-
	  // ground conflict.
	  //
	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  let attacker = mv[2];
	  let stage = "field_battle";


	  //
	  // the first thing we check is whether the land units that control the space have 
	  // withdrawn into fortifications, as if that is the case then land battle is avoided
	  //
	  if (space.besieged == 2) {
	    this.updateLog("Field Battle avoided by defenders withdrawing into fortifications");
	    this.game.queue.push("counter_or_acknowledge\tField Battle avoided by defenders retreating into fortification\tsiege");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    // besieged becomes 1 and start of next impulse
	    return 1;
	  }

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);

	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

console.log("defender faction is: " + defender_faction);
console.log("faction_map: " + JSON.stringify(faction_map));


	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) { 
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	          } 
	        } 
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.state.players_info[defender_player-1];
	      if (p && dp) {
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) { 
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	          } 
	        } 
	      } 
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //
	  // we can how start building the field_battle object, which will contain
	  // the information, die rolls, modified die rolls, needed to carry out the 
	  // conflict.
	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = [];
	  let defender_units = ['defender'];
	  let attacker_units_faction = [];
	  let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {

	      let x = calculate_rolls(f);
	      attacker_rolls += x.rolls;
	      attacker_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { attacker_units_faction.push(f); }

	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {

	      let x = calculate_rolls(f);
	      defender_rolls += x.rolls;
	      defender_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { defender_units_faction.push(f); }

	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }

	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to 
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // modify rolls as needed
	  //
	  let attacker_modified_rolls = attacker_results;
	  let defender_modified_rolls = attacker_results;
  	  if (his_self.game.state.field_battle.attacker_player > 0) {
	    attacker_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.attacker_player-1], attacker_results);
	  } 
  	  if (his_self.game.state.field_battle.defender_player > 0) {
 	    defender_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.defender_player-1], defender_results);
	  }

	  for (let i = 0; i < attacker_modified_rolls; i++) {
	    if (attacker_modified_rolls[i] >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_modified_rolls; i++) {
	    if (defender_modified_rolls[i] >= 5) { defender_hits++; }
	  }

	  //
	  // we have now rolled all of the dice that we need to roll at this stage
	  // and the results have been pushed into the field_battle object. but there
	  // is still the possibility that someone might want to intervene...
	  //
	  // things get extra messy and conditional now, because Ottomans may play 
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue via counter/acknowledge. those independent
	  // functions can then manipulate the field_battle object directly before
	  // permitting it to fall-through..
	  //

	  //
	  // save battle state
	  //
          his_self.game.state.field_battle.spacekey = mv[1];
	  his_self.game.state.field_battle.attacker_units = attacker_units;
	  his_self.game.state.field_battle.defender_units = defender_units;
	  his_self.game.state.field_battle.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.field_battle.defender_units_faction = defender_units_faction;
	  his_self.game.state.field_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.field_battle.defender_rolls = defender_rolls;
	  his_self.game.state.field_battle.attacker_modified_rolls = attacker_modified_rolls;
	  his_self.game.state.field_battle.defender_modified_rolls = defender_modified_rolls;
	  his_self.game.state.field_battle.attacker_hits = attacker_hits;
	  his_self.game.state.field_battle.defender_hits = defender_hits;
	  his_self.game.state.field_battle.attacker_units_destroyed = [];
	  his_self.game.state.field_battle.defender_units_destroyed = [];
	  his_self.game.state.field_battle.attacker_results = attacker_results;
	  his_self.game.state.field_battle.defender_results = defender_results;
	  his_self.game.state.field_battle.attacker_faction = attacker_faction;
	  his_self.game.state.field_battle.defender_faction = defender_faction;
	  his_self.game.state.field_battle.attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
	  his_self.game.state.field_battle.defender_player = his_self.returnPlayerOfFaction(defender_faction);
	  his_self.game.state.field_battle.attacker_hits_first = 0;
	  his_self.game.state.field_battle.defender_hits_first = 0;
	  his_self.game.state.field_battle.faction_map = faction_map;

	  let ap = {};
	  let dp = {};

	  if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
	  if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

	  //
	  // ottomans may play Janissaries, and some players may attack before each other, so
	  // we take conditional action and move to COUNTER_OR_ACKNOWLEDGE based on the details
	  // of how the battle should execute. the most important division is if one player
	  // "goes first" in which case they knock away from potential hits from the other 
	  // side.
	  //
	  his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);

	  if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
	    his_self.game.state.field_battle.attacker_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	  } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
	    his_self.game.state.field_battle.defender_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  } else {
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  }


	  //
	  // this should stop execution while we are looking at the pre-field battle overlay
	  //
	  his_self.game.queue.push("field_battle_assign_hits_render");
	  his_self.game.queue.push("counter_or_acknowledge\tField Battle is about to begin in "+space.name + "\tpre_field_battle_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");


          his_self.field_battle_overlay.renderPreFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();

	  return 1;

        }




        if (mv[0] === "field_battle_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies, but they have
	  // to split hits, with a random roll used to determine who takes the extra
	  // hit ON DEFENSE. the active power assigns hits independently to any land
	  // units who attack.
	  //

	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // we auto-assign the hits to independent, non-player controlled units
	  // this function handles that.
	  //
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;
	    let faction_map = his_self.game.state.field_battle.faction_map;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in his_self.game.state.faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }

	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {

			    //
			    // and remove from field battle unit
			    //
		            if (faction === his_self.game.state.field_battle_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.attacker_units.length; z++) {
			        let u = his_self.game.state.field_battle.attacker_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.attacker_units_destroyed.push(z);
				    z = 100000;
				  }			
			        }
			      }
			    }
		            if (faction === his_self.game.state.field_battle_defender_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.defender_units.length; z++) {
			        let u = his_self.game.state.field_battle.defender_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.defender_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.defender_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }

		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "mercenary"; }
                    if (zzz == 1) { cannon_fodder = "regular"; }
                    if (zzz == 2) { cannon_fodder = "cavalry"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {

			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
alert("Units Destroyed Requires Check");
	  		his_self.game.state.field_battle.attacker_units_destroyed = [];
	  		his_self.game.state.field_battle.defender_units_destroyed = [];

                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }


	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {
	    if (faction === this.game.state.field_battle.attacker_faction) {
	      assign_hits(faction, this.game.state.field_battle.defender_hits);
	    } else {
	      assign_hits(faction, this.game.state.field_battle.attacker_hits);
	    }

            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions("Independent Hits Assigned");

	    return 1;
	  }

	  //
	  // no hits assignment if no hits
	  //
	  //
	  if (faction === this.game.state.field_battle.attacker_faction) {
	    if (this.game.state.field_battle.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.field_battle.attacker_hits == 0) { return 1; }
	  }

	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.field_battle.attacker_hits; 
          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  for (let f in this.game.state.field_battle.faction_map) {
	    if (this.game.state.field_battle.faction_map[f] === this.game.state.field_battle.defender_faction) {
	      if (this.isMajorPower(f)) {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
	  }

	  //
	  // every gets shared hits
	  //
	  while (hits_to_assign > defending_factions_hits.length) {
	    for (let i = 0; i < defending_factions_hits.length; i++) { defending_factions_hits[i]++; }
	    hits_to_assign -= defending_factions_hits.length;
	  }

	  //
	  // randomly assign remainder
	  //
	  let already_punished = [];
	  for (let i = 0; i < hits_to_assign; i++) {
	    let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    while (already_punished.includes(unlucky_faction)) {
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }
	  

	  //
	  // defending major powers
	  // 
	  if (defending_major_powers > 0 && this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.defender_faction) {
	    for (let i = 0; i < defending_factions_hits.length; i++) {
  	      this.game.queue.push(`field_battle_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
	    }
	    return 1;
	  }

console.log("DEFENDING FACTIONS: " + defending_factions);
console.log("FM: " + JSON.stringify(this.game.state.field_battle.faction_map));

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHits(his_self.game.state.field_battle, faction);
	  } else {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
	    his_self.updateStatus(this.returnFactionName(faction) + " Assigning Hits");
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;

	}

        //
        // variant of above when major powers have to split hits assignments
        //
	if (mv[0] === "field_battle_manually_assign_hits") {

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHitsManually(his_self.game.state.field_battle, faction, hits);
	  } else {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;
        }


	if (mv[0] === "field_battle_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.field_battle_overlay.render(his_self.game.state.field_battle);
	  return 1;
	}


 	if (mv[0] === "field_battle_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);
	  
	  let space = this.game.spaces[spacekey];
	  let unit_destroyed = false;

console.log(JSON.stringify(this.game.state.field_battle));

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.field_battle.attacker_units.length; z++) {
		  if (this.game.state.field_battle.attacker_units[z] === space.units[faction][i].type) {
		    if (!this.game.state.field_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.field_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.field_battle.defender_units.length; z++) {
		  if (this.game.state.field_battle.defender_units[z].type === space.units[faction][i].type) {
		    if (!this.game.state.field_battle.defender_units_destroyed.includes(z)) {
		      this.game.state.field_battle.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}


	if (mv[0] === "field_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  

	  //
	  // hits assignment happens here
	  //
	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.field_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.field_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + his_self.game.state.field_battle.attacker_hits);
	  his_self.updateLog("Defender Hits: " + his_self.game.state.field_battle.defender_hits);

	  this.field_battle_overlay.renderFieldBattle(this.game.state.field_battle);

	  //
	  // who won ?
	  //
	  let winner = his_self.game.state.field_battle.defender_faction;
	  if (his_self.game.state.field_battle.attacker_hits > his_self.game.state.field_battle.defender_hits) {
	    winner = his_self.game.state.field_battle.attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
          his_self.game.state.field_battle.attacker_land_units_remaining = his_self.game.state.field_battle.attacker_units.length - his_self.game.state.field_battle.defender_hits;
	  his_self.game.state.field_battle.defender_land_units_remaining = his_self.game.state.field_battle.defender_units.length - his_self.game.state.field_battle.attacker_hits;

	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0 && his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    if (his_self.game.state.field_battle.attacker_rolls > his_self.game.state.field_battle.defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.defender_faction, his_self.game.state.field_battle.attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.attacker_faction, his_self.game.state.field_battle.defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Winner: "+this.returnFactionName(winner));
	  this.updateLog("Attacker Units Remaining: "+his_self.game.state.field_battle.attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+his_self.game.state.field_battle.efender_land_units_remaining);

          //
          // conduct retreats
          //
          if (winner === his_self.game.state.field_battle.defender_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_defenders_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
                  this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                }
	        if (can_faction_retreat == 0) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	        }
              }
            }
          }
          if (winner === his_self.game.state.field_battle.attacker_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_attackers_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
                  this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                }
              }
            }
            this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.attacker_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.defender_faction)+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
          }

          //
          // redisplay
          //
          his_self.displaySpace(space.key);

	  //
	  // show field battle overlay
	  //
          his_self.field_battle_overlay.renderPostFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();


          return 1;

        }


 	if (mv[0] === "destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);

	  if (this.game.space[spacekey]) {
	    this.game.space[spacekey].units[faction].splice(i, 1);
	  }

          this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "destroy_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.space[spacekey]) { space = this.game.space[spacekey]; }

	  units_to_destroy.sort();
	  if (units_to_destroy[0] < units_to_destroy[units_to_destroy.length-1]) {
	    units_to_destroy.reverse();
	  }

	  //
	  // remove from max to minimum to avoid index-out-of-array errors
	  //
	  for (let i = 0; i < units_to_destroy.length; i++) {
	    space.units[faction].splice(i, 1);
	  }

	  return 1;

	}




 	if (mv[0] === "destroy_naval_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.space[spacekey]) { space = this.game.space[spacekey]; }
	  if (this.game.navalspace[spacekey]) { space = this.game.navalspace[spacekey]; }

	  units_to_destroy.sort();
	  if (units_to_destroy[0] < units_to_destroy[units_to_destroy.length-1]) {
	    units_to_destroy.reverse();
	  }

	  //
	  // remove from max to minimum to avoid index-out-of-array errors
	  //
	  for (let i = 0; i < units_to_destroy.length; i++) {
	    space.units[faction].splice(i, 1);
	  }

	  return 1;

	}


	if (mv[0] === "naval_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) {
	    space = this.game.spaces[mv[1]];
	  }
	  if (this.game.navalspaces[mv[1]]) {
	    space = this.game.navalspaces[mv[1]];
	  }


	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionSeaUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 2; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "corsair"; }
		        if (zzz == 1) { cannon_fodder = "squadron"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 2; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "corsair"; }
                    if (zzz == 1) { cannon_fodder = "squadron"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " sunk");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction sea units next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.naval_battle.faction_map;
	  let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	  let attacker_results = his_self.game.state.naval_battle.attacker_results;
	  let defender_results = his_self.game.state.naval_battle.defender_results;
	  let attacker_rolls   = his_self.game.state.naval_battle.attacker_rolls;
	  let defender_rolls   = his_self.game.state.naval_battle.defender_rolls;
	  let attacker_units   = his_self.game.state.naval_battle.attacker_units;
	  let defender_units   = his_self.game.state.naval_battle.defender_units;

	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // assign hits simultaneously
	  //
	  his_self.game.state.naval_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	  his_self.game.state.naval_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	  attacker_hits = calculate_hits(attacker_player, attacker_results);
	  defender_hits = calculate_hits(defender_player, defender_results);
	  assign_hits(defender_player, attacker_hits);
	  assign_hits(attacker_player, defender_hits);

	  his_self.game.state.naval_battle.attacker_hits = attacker_hits;
	  his_self.game.state.naval_battle.defender_hits = defender_hits;

	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.naval_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.naval_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_sea_units_remaining = attacker_units - defender_hits;
	  let defender_sea_units_remaining = defender_units - attacker_hits;

          his_self.game.state.naval_battle.attacker_sea_units_remaining = attacker_sea_units_remaining;
          his_self.game.state.naval_battle.defender_sea_units_remaining = defender_sea_units_remaining;

	  if (attacker_sea_units_remaining <= 0 && defender_sea_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 squadron");
	      his_self.addSquadron(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 squadron");
	      his_self.addSquadron(defender_faction, space);
	    }
	  }


	  //
	  // capture stranded leaders
	  //
	  if (attacker_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Winner: "+this.returnFactionName(winner));

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);

          //
          // conduct retreats
          //
	  if (this.game.spaces[space.key]) {

	    //
	    // attacker always retreats from ports
	    //
            this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);

	  } else {

	    //
	    // loser retreats on open seas
	    //
            if (winner === defender_faction) {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);
	    } else {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+defender_faction+"\t"+space.key);
	    }

	  }

          this.game.queue.push("naval_battle_hits_assignment\t"+defender_faction+"\t"+attacker_hits+"\t"+space.key);
          this.game.queue.push("naval_battle_hits_assignment\t"+attacker_faction+"\t"+defender_hits+"\t"+space.key);


          //
          // redisplay
          //
	  if (this.game.spaces[space.key]) {
            his_self.displaySpace(space.key);
	  } else {
            his_self.displayNavalSpace(space.key);
	  }

          return 1;

        }



	if (mv[0] === "assault") {

          this.game.queue.splice(qe, 1);

	  this.game.state.assault = {};

	  //
	  // calculate rolls 
	  //
          let calculate_units = function(faction) {
	    let num = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type != "cavalry" && space.units[faction][i].personage == false) { num++; }
	    }
	    return num;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_ranking = function(faction) {
	    let highest_battle_ranking = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_ranking > 0) {
	        if (highest_battle_ranking < space.units[faction][i].battle_ranking) {
		  highest_battle_ranking = space.units[faction][i].battle_ranking;
		}
	      }
	    }
	    return highest_battle_ranking;
          }

	  //
	  // this is run when a field battle starts. players have by now 
	  // interceded or played cards that allow them to respond to the 
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let attacker = mv[1];
	  let space = this.game.spaces[mv[2]];
	  let stage = "assault";

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on 
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);

	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) { 
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	        } 
	      } 
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      if (defender_player > 0) {
	        let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	        let dp = his_self.game.state.players_info[defender_player-1];
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) { 
	   	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]); 
	          } 
	        } 
	      } 
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any 
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_units = 0;
	  let defender_units = 0;
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_highest_battle_ranking = 0;
	  let defender_highest_battle_ranking = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_units += calculate_units(f);
	      if (calculate_highest_battle_ranking(f) > attacker_highest_battle_ranking) {
		attacker_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_units += calculate_units(f);
	      if (calculate_highest_battle_ranking(f) > defender_highest_battle_ranking) {
		defender_highest_battle_ranking = calculate_highest_battle_ranking(f);
	      }
	    }  
	  }

	  //
	  // calculate how many rolls attacker and defener get in this situation
	  //
	  if (defender_units == 0) {
	    attacker_rolls = attacker_units;
	    attacker_rolls += attacker_highest_battle_ranking;
	    defender_rolls = 1 + defender_highest_battle_ranking;
	  } else {
	    for (let i = 0; i < attacker_units; i++) {
	      if (i%2 === 1) { attacker_rolls++; }
	      attacker_rolls += attacker_highest_battle_ranking;
	    }
	    defender_rolls = 1 + defender_units + defender_highest_battle_ranking;
	  }

	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to 
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Ottomans may play 
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing 
	  // execution back to the game queue.
	  //


	  //
	  // save battle state
	  //
	  his_self.game.state.assault.attacker_units = attacker_units;
	  his_self.game.state.assault.defender_units = defender_units;
	  his_self.game.state.assault.attacker_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_rolls = defender_rolls;
	  his_self.game.state.assault.attacker_results = attacker_results;
	  his_self.game.state.assault.defender_results = defender_results;
	  his_self.game.state.assault.attacker_faction = attacker_faction;
	  his_self.game.state.assault.defender_faction = defender_faction;
	  his_self.game.state.assault.faction_map = faction_map;

	  his_self.game.queue.push(`assault_continue\t${mv[1]}\t${mv[2]}`);

	  return 1;

        }


	if (mv[0] === "assault_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[2]];

	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {

	    if (!player.tmp_roll_modifiers) {
	      return roll_array;
	    }	    

	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) { 
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) { 
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0 && number_of_targets > 0) {

	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "cavalry"; }
		        if (zzz == 1) { cannon_fodder = "mercenary"; }
		        if (zzz == 2) { cannon_fodder = "regular"; }

			let units_len = space.units[f].length;

  	     	        for (let i = 0; i < units_len; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
console.log("removing which unit: " + cannon_fodder + " from " + f);
		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = units_len + 1;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) { 
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

console.log("removing secondarily!");

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();
		
		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);
		
		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "cavalry"; }
                    if (zzz == 1) { cannon_fodder = "mercenary"; }
                    if (zzz == 2) { cannon_fodder = "regular"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 0);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.assault.faction_map;
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
	  let defender_faction = his_self.game.state.assault.defender_faction;
	  let ap = his_self.returnPlayerOfFaction(attacker_faction);
	  let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
	  if (ap > 0) { attacker_player  = his_self.game.state.players_info[ap-1]; }
          if (dp > 0) { defender_player  = his_self.game.state.players_info[dp-1]; }
	  let attacker_results = his_self.game.state.assault.attacker_results;
	  let defender_results = his_self.game.state.assault.defender_results;
	  let attacker_rolls   = his_self.game.state.assault.attacker_rolls;
	  let defender_rolls   = his_self.game.state.assault.defender_rolls;
	  let attacker_units   = his_self.game.state.assault.attacker_units;
	  let defender_units   = his_self.game.state.assault.defender_units;


	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // attacker goes first
	  //
          if (attacker_player.tmp_rolls_first == 1 && defender_player.tmp_rolls_first != 1) {

	    //
 	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    for (let i = 0; i < attacker_hits; i++) {
	      if (defender_results.length > 0) {
		defender_rolls.splice(defender_rolls.length-1, 1);
		defender_results.splice(defender_rolls.length-1, 1);
	      }
	    }

	    //
	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          //
          // defender goes first
          //
          } else if (attacker_player.tmp_rolls_first != 1 && defender_player.tmp_rolls_first == 1) {

	    //
 	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    for (let i = 0; i < defender_hits; i++) {
	      if (attacker_results.length > 0) {
		attacker_rolls.splice(attacker_rolls.length-1, 1);
		attacker_results.splice(attacker_rolls.length-1, 1);
	      }
	    }

	    //
	    // check if we can continue
	    //

	    //
	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          } else {

	    //
	    // assign hits simultaneously
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    attacker_hits = calculate_hits(attacker_player, attacker_results);
	    defender_hits = calculate_hits(defender_player, defender_results);
	    assign_hits(defender_player, attacker_hits);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          }

	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.assault.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.assault.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_land_units_remaining = attacker_units - defender_hits;
	  let defender_land_units_remaining = defender_units - attacker_hits;

          his_self.game.state.assault.attacker_land_units_remaining = attacker_land_units_remaining;
          his_self.game.state.assault.defender_land_units_remaining = defender_land_units_remaining;


	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          //
          // conduct retreats
          //
          if (defender_land_units_remaining < attacker_land_units_remaining) {
          }
          if (winner === attacker_faction) {
          }

console.log("SPACE IS: " + JSON.stringify(space));

          //
          // redisplay
          //
          his_self.displaySpace(space.key);

          return 1;

        }



	if (mv[0] === "purge_units_and_capture_leaders") {

console.log("purging units and capturing leader");

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


	if (mv[0] === "purge_naval_units_and_capture_leaders") {

console.log("purging naval units and capturing leader");

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space;
	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureNavalLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


        if (mv[0] === "player_evaluate_post_naval_battle_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

          let faction_map = his_self.game.state.naval_battle.faction_map;
          let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
          let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];

          if (this.game.player == this.returnPlayerOfFaction(loser)) {
            this.playerEvaluateNavalRetreatOpportunity(loser, spacekey);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat at sea");
          }

          return 0;

        }


        if (mv[0] === "post_field_battle_player_evaluate_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

	  //
	  // auto-skip if loser cannot retreat because they have no land units
	  //
	  let loser_can_retreat = false;
	  for (let i = 0; i < this.game.spaces[spacekey].units[loser].length; i++) {
	    if (["regular", "mercentary", "calvary"].includes(this.game.spaces[spacekey].units[loser][i].type)) { loser_can_retreat = true; }
	  }
	  if (loser_can_retreat == false) { return 1; }

          let faction_map = his_self.game.state.field_battle.faction_map;
          let attacker_faction = his_self.game.state.field_battle.attacker_faction;
          let defender_faction = his_self.game.state.field_battle.defender_faction;
          let ap = his_self.returnPlayerOfFaction(attacker_faction);
          let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
          if (ap > 0) { attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1]; }
	  if (dp > 0) { defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1]; }
          let attacker_results = his_self.game.state.field_battle.attacker_results;
          let defender_results = his_self.game.state.field_battle.defender_results;
          let attacker_rolls   = his_self.game.state.field_battle.attacker_rolls;
          let defender_rolls   = his_self.game.state.field_battle.defender_rolls;
          let attacker_units   = his_self.game.state.field_battle.attacker_units;
          let defender_units   = his_self.game.state.field_battle.defender_units;
          let attacker_land_units_remaining = his_self.game.state.field_battle.attacker_land_units_remaining;
          let defender_land_units_remaining = his_self.game.state.field_battle.defender_land_units_remaining;

          //
          // fortification has already happened. if the loser is the attacker, they have to retreat
          //
          if (this.game.player == this.returnPlayerOfFaction(loser)) {
	    let is_attacker_loser = false;
	    if (loser === attacker_faction) { is_attacker_loser = true; }
            this.playerEvaluateRetreatOpportunity(attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey, defender_faction, is_attacker_loser);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
          }

          return 0;

        }



        if (mv[0] === "found_jesuit_university") {

	  let spacekey = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.updateLog("Jesuit University founded in " + this.game.spaces[spacekey].name);
	  this.game.spaces[spacekey].university = 1;

	  return 1;

	}



	if (mv[0] === "pick_second_round_debaters") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let committed = this.game.state.theological_debate.committed;
	  this.game.state.theological_debate.round++;

	  let x = 0;

	  //
	  // attacker chosen randomly from uncommitted
	  //
          let ad = 0;
          let cd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (this.game.state.debaters[i].committed == 0) {
	        ad++;
	      } else {
	        cd++;
	      }
	    }
	  }

	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
	        dd++;
	      }
	    }
	  }

	  x = this.rollDice(dd) - 1;
	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
		}
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
		  this.game.state.theological_debate.defender_debater_bonus++;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
		}
	        dd++;
	      }
	    }
	  }

	  //
	  // attacker chosen from uncommitted
	  //
	  let tad = 0;
	  if (ad != 0) {
	    x = this.rollDice(ad) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	        if (x === tad) {
		  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
		}
	        tad++;
	      }
	    }
	  } else {
	    x = this.rollDice(cd) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
	        if (x === tad) {
		  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
		}
	        tad++;
	      }
	    }
	  }
	  
          this.game.state.theological_debate.round2_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round2_defender_debater = this.game.state.theological_debate.defender_debater;

	  //
	  //
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "pick_first_round_debaters") {

	  let attacker = mv[1];
	  let defender = mv[2];
	  let language_zone = mv[3];
	  let committed = mv[4];

	  this.game.state.theological_debate = {};
	  this.game.state.theological_debate.attacker_rolls = 0;
	  this.game.state.theological_debate.defender_rolls = 0;
	  this.game.state.theological_debate.adice = [];
	  this.game.state.theological_debate.ddice = [];
	  this.game.state.theological_debate.attacker = mv[1];
	  this.game.state.theological_debate.defender = mv[2];
	  this.game.state.theological_debate.language_zone = mv[3];
	  this.game.state.theological_debate.committed = mv[4];
	  this.game.state.theological_debate.round = 1;
	  this.game.state.theological_debate.round1_attacker_debater = "";
	  this.game.state.theological_debate.round1_defender_debater = "";
	  this.game.state.theological_debate.round2_attacker_debater = "";
	  this.game.state.theological_debate.round2_defender_debater = "";
	  this.game.state.theological_debate.attacker_debater = "";
	  this.game.state.theological_debate.defender_debater = "";
	  this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.attacker_debater_power = 0;
	  this.game.state.theological_debate.defender_debater_power = 0;
	  this.game.state.theological_debate.attacker_debater_bonus = 3;
	  this.game.state.theological_debate.defender_debater_bonus = 1;
	  this.game.state.theological_debate.selected_papal_debater = "";
	  this.game.state.theological_debate.prohibited_protestant_debater = "";
	  this.game.state.theological_debate.attacker_faction = attacker.charAt(0).toUpperCase() + attacker.slice(1);
	  this.game.state.theological_debate.defender_faction = defender.charAt(0).toUpperCase() + defender.slice(1);

	  let x = 0;

	  //
	  // attacker picks debater at random from uncommitted
	  //
          let ad = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (this.game.state.debaters[i].committed == 0) {
	        ad++;
	      }
	    }
	  }
	  x = this.rollDice(ad) - 1;
	  ad = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	      if (x === ad) {
		this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	        this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
	      }
	      ad++;
	    }
	  }
	  
	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
	        dd++;
	      }
	    }
	  }

	  x = this.rollDice(dd) - 1;
	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	        }
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
	          this.game.state.theological_debate.defender_debater_bonus++;
		}
	        dd++;
	      }
	    }
	  }

          this.game.state.theological_debate.round1_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round1_defender_debater = this.game.state.theological_debate.defender_debater;

	  //
	  // and show it...
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);


	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "commit") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let debater = mv[2];
	  this.commitDebater(faction, debater);

	  return 1;

        }


        if (mv[0] === "theological_debate") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let language_zone = this.game.state.theological_debate.language_zone;
	  let committed = this.game.state.theological_debate.committed;
	  let attacker_idx = 0;
	  let defender_idx = 0;
	  let was_defender_uncommitted = 0;

	  this.game.queue.splice(qe, 1);

	  //
	  // commit debaters if uncommitted
	  //
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      if (this.game.state.debaters[i].committed == 0) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater);
	      }
	    }
	  }

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.defender_debater) {
	      defender_idx = i;
	      if (this.game.state.debaters[i].committed == 0) {
	        was_defender_uncommitted = 1;
		this.commitDebater(this.game.state.theological_debate.defender, this.game.state.theological_debate.defender_debater);
	      }
	    }
	  }


	  //
	  // some wrangling lets defender switch up if Protestant
	  //
	  let attacker_rolls = this.game.state.debaters[attacker_idx].power + 3; // power of debater + 3;
	  let attacker_debater_power = this.game.state.debaters[attacker_idx].power;
	  let attacker_debater_bonus = 3;
	  let defender_rolls = this.game.state.debaters[defender_idx].power + 1 + was_defender_uncommitted;
	  let defender_debater_power = this.game.state.debaters[defender_idx].power;
	  let defender_debater_bonus = 1 + was_defender_uncommitted;


	  //
	  // eck-debator bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "eck-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }
	  //
	  // gardiner-debater bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "gardiner-debater" && this.game.state.theological_debate.language_zone === "english" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }


	  let attacker_hits = 0;
	  let defender_hits = 0;
	  let adice = [];
	  let ddice = [];

	  for (let i = 0; i < attacker_rolls; i++) {
	    let x = this.rollDice(6);
	    adice.push(x);
	    if (x >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let x = this.rollDice(6);
	    ddice.push(x);
	    if (x >= 5) { defender_hits++; }
	  }

	  //
	  //
	  //
	  this.game.state.theological_debate.attacker_rolls = attacker_rolls;
	  this.game.state.theological_debate.defender_rolls = defender_rolls;
	  this.game.state.theological_debate.adice = adice;
	  this.game.state.theological_debate.ddice = ddice;
	  this.game.state.theological_debate.attacker_debater_power = attacker_debater_power;
	  this.game.state.theological_debate.defender_debater_power = defender_debater_power;
	  this.game.state.theological_debate.attacker_debater_bonus = attacker_debater_bonus;
	  this.game.state.theological_debate.defender_debater_bonus = defender_debater_bonus;

	  if (attacker_hits == defender_hits) {
	    this.game.state.theological_debate.status = "Tie - Second Round";
	  } else {
	    if (attacker_hits > defender_hits) {
	      this.game.state.theological_debate.status = this.game.state.theological_debate.attacker_faction + " Wins";
	    } else {
	      this.game.state.theological_debate.status = this.game.state.theological_debate.defender_faction + " Wins";
	    }
	  }

	  //
	  // open theological debate UI
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  if (attacker_hits == defender_hits) {

	    //
	    // first round of debate moves into second
	    //
	    this.game.state.theological_debate.round++;
	    if (this.game.state.theological_debate.round > 2) {

	      this.game.queue.push("counter_or_acknowledge\tTie - Debate Ends Inconclusively");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    } else {

	      this.game.queue.push("theological_debate");
	      this.game.queue.push("counter_or_acknowledge\tThe Debate is Tied - Progress to 2nd Round\tdebate");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("pick_second_round_debaters");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    }

	  } else {

	    let bonus_conversions = 0;

	    //
	    // if aleander is in play, flip extra space
	    //
	    if ((this.game.state.theological_debate.attacker_debater === "aleander-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) || (this.game.state.theological_debate.defender_debater === "aleander-debater" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1)) {
	      bonus_conversions = 1;
	    }

	    if (attacker_hits > defender_hits) {

	      let total_spaces_to_convert = attacker_hits - defender_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (attacker === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }
	     
	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //

	      if (this.game.state.theological_debate.defender_debater === "campeggio-debater" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss sustained");
	 	}
	      }

	      if (total_spaces_to_convert == 1) {
	        this.updateLog(this.game.state.theological_debate.attacker_faction + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space}`);
	      } else {
	        this.updateLog(this.game.state.theological_debate.attacker_faction + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces}`);
	      }

console.log("TOTAL SPACES AVAILABLE: " + (total_spaces_to_convert+ " + " + bonus_conversions));
	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);


	      for (let i = (total_spaces_to_convert+bonus_conversions); i >= 1; i--) {
	        if (i > (total_spaces_in_zone+bonus_conversions)) {
		  if (attacker === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (attacker === "papacy") {
  		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      // 
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      this.game.queue.push("counter_or_acknowledge\t"+this.game.state.theological_debate.attacker_faction + ` Wins - Convert ${total_spaces_to_convert} Spaces}`);
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    } else {

	      let total_spaces_to_convert = defender_hits - attacker_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (defender === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }

	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //
	      if (this.game.state.theological_debate.attacker_debater === "campeggio-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss sustained");
	 	}
	      }


	      if (total_spaces_to_convert == 1) {
	        this.updateLog(this.game.state.theological_debate.defender_faction + ` Wins - Convert ${total_spaces_to_convert} Space}`);
	      } else {
	        this.updateLog(this.game.state.theological_debate.defender_faction + ` Wins - Convert ${total_spaces_to_convert} Spaces}`);
	      }


console.log("TOTAL SPACES AVAILABLE: " + total_spaces_to_convert);
	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);


	      for (let i = total_spaces_to_convert; i >= 1; i--) {
	        if (i > total_spaces_in_zone) {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      this.game.queue.push("counter_or_acknowledge\t"+this.game.state.theological_debate.defender_faction + ` Wins - Convert ${total_spaces_to_convert} Spaces}`);
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");
	    }
	  }

	  return 1;

	}



        if (mv[0] === "translation") {

	  let zone = mv[1];

	  this.game.queue.splice(qe, 1);

	  if (zone === "german") {
	    if (this.game.state.translations['new']['german'] >= 6) {
	      this.game.state.translations['full']['german']++;
	    } else {
	      this.game.state.translations['new']['german']++;
	    }
	  }
	  if (zone === "french") {
	    if (this.game.state.translations['new']['french'] >= 6) {
	      this.game.state.translations['full']['french']++;
	    } else {
	      this.game.state.translations['new']['french']++;
	    }
	  }
	  if (zone === "english") {
	    if (this.game.state.translations['new']['english'] >= 6) {
	      this.game.state.translations['full']['english']++;
	    } else {
	      this.game.state.translations['new']['english']++;
	    }
	  }

	  his_self.faction_overlay.render("protestant");

	  return 1;
        }


	if (mv[0] === "build_saint_peters_with_cp") {

	  let ops = parseInt(mv[1]);

	  this.game.queue.splice(qe, 1);

          for (let i = 0; i < ops; i++) {
            his_self.game.queue.push("build_saint_peters");
          }

	  return 1;

	}

        if (mv[0] === "build_saint_peters") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.saint_peters_cathedral['vp'] < 5) {
	    this.updateLog("Papacy progresses with construction of St. Peter's Basilica");
	    this.game.state.saint_peters_cathedral['state'] += 1;
	    if (this.game.state.saint_peters_cathedral['state'] >= 5) {
	      this.game.state.saint_peters_cathedral['state'] = 0;
	      this.game.state.saint_peters_cathedral['vp'] += 1;
	    }
	  }

	  his_self.faction_overlay.render("papacy");

	  return 1;

	}

        if (mv[0] === "victory_determination_phase") {


	  this.game.queue.splice(qe, 1);

	  let f = this.calculateVictoryPoints();

/****
//          faction : this.game.state.players_info[i].factions[ii] ,
//          vp : 0 ,
//          keys : 0 ,
//          religious : 0 ,
//          victory : 0,
//          details : "",
****/

	  for (let faction in f) {
	    if (f.victory == 1) {
	      let player = this.returnPlayerOfFaction(faction);
	      this.endGame([this.game.players[player-1]], f.details);
	    }
	  }

          return 1;
        }
        if (mv[0] === "new_world_phase") {

	  //
	  // no new world phase in 2P games
	  //
	  if (this.game.players.length > 2) {

console.log("NEW WORLD PHASE!");
	    // resolve voyages of exploration

	    // resolve voyages of conquest

	  }

	  //
	  // phase otherwise removed entirely for 2P
	  //

	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "winter_phase") {

	  console.log("Winter Phase!");

	  // Remove loaned naval squadron markers
	  this.returnLoanedUnits();

	  // Remove the Renegade Leader if in play
	  // Return naval units to the nearest port
	  // Return leaders and units to fortified spaces (suffering attrition if there is no clear path to such a space)
	  // Remove major power alliance markers
	  // Add 1 regular to each friendly-controlled capital
	  // Remove all piracy markers
	  // Flip all debaters to their uncommitted (white) side, and
	  // ResolvespecificMandatoryEventsiftheyhavenotoccurred by their “due date”.

	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "action_phase") {

	  //
	  // check if we are really ready for a new round, or just need another loop
	  // until all of the players have passed.
	  //
	  let factions_in_play = [];
	  for (let i = 0; i < this.game.state.players_info.length; i++) {
console.log("i: " + i);
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
console.log("z: " + z);
console.log("passed? " + JSON.stringify(this.game.state.players_info[i].factions[z]));
	      if (this.game.state.players_info[i].factions_passed[z] == false) {
console.log("pushing back!");
		factions_in_play.push(this.factions[this.game.state.players_info[i].factions[z]]);
	      }
	    }
	  }

	  //
	  // players still to go...
	  //
	  if (factions_in_play.length > 0) {
	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      for (let k = 0; k < factions_in_play.length; k++) {
	        if (factions_in_play[k].key === io[i]) {
	          this.game.queue.push("play\t"+io[i]);
	        }
	      }
	    }
	    return 1;
	  }

	  //
	  // move past action phase if no-one left to play
	  //
	  this.game.queue.splice(qe, 1);
          return 1;
        }

        if (mv[0] === "spring_deployment_phase") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.players === 2) {
	    // only papacy moves units
	    this.game.queue.push("spring_deployment\tpapacy");
	  } else {
	    // all players can move units
	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      if (this.isFactionInPlay(io[i])) {
		this.game.queue.push("spring_deployment\t"+io[i]);
	      }
	    }
	  }

          return 1;
        }
        if (mv[0] === "spring_deployment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);


	  if (this.game.player == player) {
	    this.playerPlaySpringDeployment(faction, player);
	  } else {
	    this.updateStatus(faction.charAt(0).toUpperCase() + faction.slice(1) + " Spring Deployment");
	  }

	  return 0;

	}
        if (mv[0] === "diplomacy_phase") {

	  // multiplayer has diplomacy phase
	  // this.playerOffer();
	  // return 0;

	  //
	  // 2-player game? both players play a diplomacy card
	  // AFTER they have been dealt on every turn after T1
	  //
	  if (this.game.state.round > 1) {
    	    this.game.queue.push("play_diplomacy_card\tpapacy");
    	    this.game.queue.push("play_diplomacy_card\tprotestant");
	  }

	  //
	  // 2-player game? Diplomacy Deck
	  //
	  if (this.game.players.length == 2) {
	    for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
	      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
    	        this.game.queue.push("DEAL\t2\t"+(i+1)+"\t1");
	      }
	    }
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
	  }

	  //
	  // The Papacy may end a war they are fighting by playing Papal Bull or by suing for peace. -- start of diplomacy phase
	  //
          this.game.queue.push("papacy_diplomacy_phase_special_turn");

	  this.game.queue.splice(qe, 1);
          return 1;

        }

	if (mv[0] === "papacy_diplomacy_phase_special_turn") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyDiplomacyPhaseSpecialTurn();
	  } else {
	    this.updateStatus("Papacy Considering Diplomatic Options");
	  }

          return 0;

        }


	if (mv[0] === "declare_war") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "card_draw_phase") {

	  //
	  // deal cards and add home card
	  //
	  for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
              let cardnum = this.factions[this.game.state.players_info[i].factions[z]].returnCardsDealt(this);

	      //
	      // fuggers card -1
	      //
              if (this.game.state.events.fuggers === this.game.state.players_info[i].factions[z]) {
		cardnum--;
		this.game.state.events.fuggers = "";
	      }

    	      this.game.queue.push("hand_to_fhand\t1\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	      this.game.queue.push("add_home_card\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	      this.game.queue.push("DEAL\t1\t"+(i+1)+"\t"+(cardnum));
	    }
	  }

	  //
	  // DECKRESTORE copies backed-up back into deck
	  //
          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");


	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	  }
	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKXOR\t1\t"+(i));
	  }

	  //
	  // new cards this turn
	  //
	  let new_cards = this.returnNewCardsForThisTurn(this.game.state.round);

//console.log("==============");
//console.log("CARDS IN DECK:");
//console.log("==============");
//for (let key in new_cards) {
//  console.log(key);
//}

	  
	  //
	  // re-add discards
	  //
	  let discards = {};
	  for (let i in this.game.deck[0].discards) {
      	    discards[i] = this.game.deck[0].cards[i];
      	    delete this.game.deck[0].cards[i];
    	  }
    	  this.game.deck[0].discards = {};

	  //
	  // our deck for re-shuffling
	  //
	  let reshuffle_cards = {};
	  for (let key in discards) { reshuffle_cards[key] = discards[key]; }

	  let deck_to_deal = new_cards;
	  delete deck_to_deal['001'];
	  delete deck_to_deal['002'];
	  delete deck_to_deal['003'];
	  delete deck_to_deal['004'];
	  delete deck_to_deal['005'];
	  delete deck_to_deal['006'];
	  delete deck_to_deal['007'];
	  delete deck_to_deal['008'];

	  for (let key in deck_to_deal) { reshuffle_cards[key] = deck_to_deal[key]; }

console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
console.log("RESHUFFLE: " + JSON.stringify(reshuffle_cards));

    	  this.game.queue.push("restore_home_cards_to_deck");
    	  this.game.queue.push("DECK\t1\t"+JSON.stringify(reshuffle_cards));

	  // backup any existing DECK #1
          this.game.queue.push("DECKBACKUP\t1");


	  //
	  // "The Protestant army leader Maurice of Saxony is placed 
	  // on the map at the start of Turn 6. Maurice is the only 
	  // army leader that doesn’t either start the game on the map
	  // or enter via a Mandatory Event. Place Maurice in any 
	  // electorate under Protestant political control."
	  //
//
// is not debater
//
//	  if (this.game.round == 6) {
//    	    this.game.queue.push("place_protestant_debater\tmaurice_of_saxony\tselect");
//	  }
	  if (this.game.round == 2) {
    	    this.game.queue.push("place_protestant_debater\tzwingli\tzurich");
	  }
	  if (this.game.round == 4) {
    	    this.game.queue.push("place_protestant_debater\tcalvin\tgeneva");
	  }

	  //
	  // dynamic - turn after Henry VIII maries Anne Boleyn
	  //
	  if (this.game.round == 6) {
    	    this.game.queue.push("place_protestant_debater\tcranmer\tlondon");
	  }

	  //
	  // "Naval leaders eliminated from play are also brought back 
	  // during the Card Draw Phase. Place them in a friendly port 
	  // if possible. If no friendly port exists, they remain on 
	  // the Turn Track for another turn. Naval units eliminated in 
	  // a previous turn are also returned to each power’s pool of 
	  // units available to be constructed at this time."
	  //
    	  //this.game.queue.push("restore\tnaval_leaders");

	 
	  this.game.queue.splice(qe, 1);
          return 1;

        }

        if (mv[0] === "restore_home_cards_to_deck") {

	  let d = this.returnDeck();
	  this.game.deck[0].cards['001'] = d['001'];
	  this.game.deck[0].cards['002'] = d['002'];
	  this.game.deck[0].cards['003'] = d['003'];
	  this.game.deck[0].cards['004'] = d['004'];
	  this.game.deck[0].cards['005'] = d['005'];
	  this.game.deck[0].cards['006'] = d['006'];
	  this.game.deck[0].cards['007'] = d['007'];
	  this.game.deck[0].cards['008'] = d['008'];
	  this.game.queue.splice(qe, 1);
          return 1;
	}

	// removes from game
	if (mv[0] === "remove") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  this.updateLog("removing " + this.game.deck[0].cards[card].name + " from deck");
	  this.removeCardFromGame(card);

	  return 1;

	}


	// pull card
	if (mv[0] === "pull_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    let roll = this.rollDice(this.game.deck[0].fhand[fhand_idx].length) - 1;
	    let card = this.game.deck[0].fhand[fhand_idx][roll];
	    this.addMove("give_card\t"+faction_taking+"\t"+faction_giving+"\t"+card);
	    this.endTurn();
	  } else {
	    this.rollDice();
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	// give card
	if (mv[0] === "give_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let card = mv[3];

	  this.updateLog(faction_taking + " pulls card " + card);

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);
	  this.game.state.last_pulled_card = card;

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    this.game.deck[0].fhand[fhand_idx].push(card);
	  }

	  if (this.game.player == p1) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_taking);
	    this.game.deck[0].fhand[fhand_idx].push(card);
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

        }



	// random card discard
	if (mv[0] === "random_discard") {

	  let faction = mv[1];
	  let num = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	  return 0;
	}


	// random card discard
	if (mv[0] === "random_discard") {

	  let faction = mv[1];
	  let num = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	  return 0;
	}

	if (mv[0] === "discard_diplomacy_card") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  //
	  // move into discards
	  //
	  this.game.deck[1].discards[card] = this.game.deck[1].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
	    for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	      if (this.game.deck[1].hand[i] === card) {
		this.game.deck[1].hand.splice(i, 1);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	// moves into discard pile
	if (mv[0] === "discard") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  //
	  // move into discards
	  //
	  this.game.deck[0].discards[card] = this.game.deck[0].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
            let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	    for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	      if (this.game.deck[0].fhand[fhand_idx][i] === card) {
		this.game.deck[0].fhand[fhand_idx].splice(i, 1);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	// discards N cards from faction hand
	if (mv[0] === "discard_random") {

	  let faction = mv[1];
	  let num = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	  if (type == "card") {
	    if (this.game.player === player_of_faction) {

              let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	      let num_cards = this.game.deck[0].fhand[fhand_idx].length;
	      let discards = [];

	      // cannot discard more than maximum
	      if (num_cards < num) { num = num_cards; }

	      for (let z = 0; z < num; z++) {
	        let roll = this.rollDice(num_cards) - 1;
		while (discards.includes(roll)) {
	          roll = this.rollDice(num_cards) - 1;
		}
		discards.push(roll);
	      }

	      discards.sort();

	      for (let zz = 0; zz < discards.length; zz++) {
	        this.addMove("discard\t"+faction+"\t"+this.game.deck[0].fhand_idx[discards[zz]]);
	      }
	      this.endTurn();

	    }
	  }

	  return 0;

	}

        if (mv[0] === "play") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
          this.displayBoard();

	  //
	  // new impulse
	  //
          this.resetBesiegedSpaces();

	  //
	  // hide overlay
	  //
	  this.debate_overlay.hide();

	  this.game.state.active_player = player;
	  this.game.state.active_faction = faction;

	  // skip factions not-in-play
	  if (player == -1) { 
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // reset player/state vars and set as active player
	  //
	  this.resetPlayerTurn(player);

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards("Opponent Turn:", this.game.deck[0].fhand[0]);
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }
	if (mv[0] === "continue") {

	  let player = mv[1];
	  let faction = mv[2];
	  let card = mv[3];
	  let ops = mv[4];

	  this.game.queue.splice(qe, 1);

	  let player_turn = -1;

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    if (this.game.state.players_info[i].factions.includes(faction)) {
	      player_turn = i+1;
	    }
	  }

          this.displayBoard();

	  // no-one controls this faction, so skip
	  if (player_turn === -1) { 
	    return 1; 
	  }

	  // let the player who controls play turn
	  if (this.game.player === player_turn) {
	    this.playerPlayOps(card, faction, ops);
	  } else {
	    this.updateStatusAndListCards("Opponent Turn");
	  }
          return 0;
        }


	if (mv[0] === "place_protestant_debater") {

	  this.game.queue.splice(qe, 1);

	  let name = mv[3];
	  let location = mv[4];

	  this.updateLog(unitname + " enters at " + location);
	  this.addDebater("protestant", location, name);
	  if (this.game.spaces[space].religion != "protestant") {
	    this.game.spaces[space].religion = "protestant";
	    this.updateLog(location + " converts to Protestant Religion");
	  }
	  this.displaySpace(location);

	  return 1;

	}

	if (mv[0] === "select_for_catholic_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  if (mv[2]) { zone = mv[2]; }

	  this.game.queue.splice(qe, 1);

console.log("QUEUE IN CC: " + JSON.stringify(this.game.queue));

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Catholic",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "protestant" &&
                  his_self.isSpaceAdjacentToReligion(space, "catholic")
                ) {
		  if (space.language == zone || zone == "") { 
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tcatholic");
                his_self.endTurn();
              },

              null,

	      true

            );
          }

	  this.displayVictoryTrack();
	  return 0;

        }

	if (mv[0] === "select_for_protestant_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  if (mv[2]) { zone = mv[2]; }

	  this.game.queue.splice(qe, 1);

console.log("QUEUE IN PC: " + JSON.stringify(this.game.queue));


	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Protestant",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "catholic" &&
                  his_self.isSpaceAdjacentToReligion(space, "protestant")
                ) {
		  if (space.language == zone || zone == "") { 
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              },

              null,

	      true

            );
          }

	  this.displayVictoryTrack();
	  return 0;

        }



	if (mv[0] === "assault") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let space = mv[2];

	  this.displayVictoryTrack();

	  return 1;

	}


 	if (mv[0] === "unrest") {

	  let spacekey = mv[1];
	  this.game.spaces[spaceley].unrest = 1;
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "pacify" || mv[0] === "control") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let space = mv[2];

	  this.game.spaces[space].unrest = 0;
	  this.game.spaces[space].political = faction;

	  this.displaySpace(space);
	  this.displayVictoryTrack();

	  return 1;

	}




	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  this.updateLog(this.game.spaces[space].name + " converts to the " + religion + " religion");

	  if (space === "augsburg" && religion === "protestant" && this.game.state.augsburg_electoral_bonus == 0) {
	    this.game.spaces['augsburg'].units['protestant'].push();
    	    this.addRegular("protestant", "augsburg", 2);
	    this.game.state.augsburg_electoral_bonus = 1;
	  }
	  if (space === "mainz" && religion === "protestant" && this.game.state.mainz_electoral_bonus == 0) {
	    this.game.spaces['mainz'].units['protestant'].push();
    	    this.addRegular("protestant", "mainz", 1);
	    this.game.state.mainz_electoral_bonus = 1;
	  }
	  if (space === "trier" && religion === "protestant" && this.game.state.trier_electoral_bonus == 0) {
	    this.game.spaces['trier'].units['protestant'].push();
    	    this.addRegular("protestant", "trier", 1);
	    this.game.state.trier_electoral_bonus = 1;
	  }
	  if (space === "cologne" && religion === "protestant" && this.game.state.cologne_electoral_bonus == 0) {
	    this.game.spaces['cologne'].units['protestant'].push();
    	    this.addRegular("protestant", "cologne", 1);
	    this.game.state.cologne_electoral_bonus = 1;
	  }
	  if (space === "wittenberg" && religion === "protestant" && this.game.state.wittenberg_electoral_bonus == 0) {
	    this.game.spaces['wittenberg'].units['protestant'].push();
    	    this.addRegular("protestant", "wittenberg", 2);
	    this.game.state.wittenberg_electoral_bonus = 1;
	  }
	  if (space === "brandenburg" && religion === "protestant" && this.game.state.brandenburg_electoral_bonus == 0) {
	    this.game.spaces['brandenburg'].units['protestant'].push();
    	    this.addRegular("protestant", "brandenburg", 1);
	    this.game.state.brandenburg_electoral_bonus = 1;
	  }

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);
	  this.displayElectorateDisplay();
	  this.displayVictoryTrack();

	  return 1;

	}

	if (mv[0] === "add_home_card") {

	  let player = parseInt(mv[1]);
 	  let faction = mv[2];
 	  let hc = this.returnDeck();

	  if (this.game.player === player) {
	    for (let key in hc) {
	      if (hc[key].faction === faction) {
	        this.game.deck[0].hand.push(key);
	      }
	    }
	  }
	  
	  this.game.queue.splice(qe, 1);
	  return 1;

	}


        if (mv[0] === "play_diplomacy_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayDiplomacyCard(faction);
	  }

	  return 0;

	}


	if (mv[0] === "hand_to_fhand") {

	  this.game.queue.splice(qe, 1);

	  let deckidx = parseInt(mv[1])-1;
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let fhand_idx = this.returnFactionHandIdx(player, faction);

	  if (this.game.player == player) {

	    if (!this.game.deck[deckidx].fhand) { this.game.deck[deckidx].fhand = []; }
	    while (this.game.deck[deckidx].fhand.length < (fhand_idx+1)) { this.game.deck[deckidx].fhand.push([]); }

	    for (let i = 0; i < this.game.deck[deckidx].hand.length; i++) {
	      this.game.deck[deckidx].fhand[fhand_idx].push(this.game.deck[deckidx].hand[i]);
	    }

	    // and clear the hand we have dealt
	    this.game.deck[deckidx].hand = [];
	  }

	  return 1;

	}

	if (mv[0] === "reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let protestants_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // neighbours
	  //
	  for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {

console.log("SPACE: " + space);

	    if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
	      c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	      c_neighbours++;
	    }
	    if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
	      p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	      p_neighbours++;
	    }  
	    if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
	      p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	      p_rolls++;
	    }
	    if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
	      c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	      c_rolls++;
	    }
	    if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
	      p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
	      p_rolls++;
	    }
	    if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
	      c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
	      c_rolls++;
	    }
	  }

	  //
	  // ourselves
	  //
	  if (this.hasProtestantLandUnits(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	  }
	  if (this.hasCatholicLandUnits(space)) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	  }
	  if (this.hasProtestantReformer(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	  }
	  if (this.game.spaces[space].university) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	  }

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== target_language_zone && target_language_zone != "all") {
	    ties_resolve = "catholic";
 	  }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.tmp_protestant_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_protestant_reformation_bonus--;
	      if (this.game.state.tmp_protestant_reformation_bonus < 0) { this.game.state.tmp_protestant_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_catholic_reformation_bonus--;
	      if (this.game.state.tmp_catholic_reformation_bonus < 0) { this.game.state.tmp_catholic_reformation_bonus = 0; }
	    }
	  }

	  for (let i = 0; i < this.game.state.tmp_protestant_reformation_bonus; i++) {
	    p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
	  }
	  for (let i = 0; i < this.game.state.tmp_catholic_reformation_bonus; i++) {
	    c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
	  }
	  p_bonus += this.game.state.tmp_protestant_reformation_bonus;
	  c_bonus += this.game.state.tmp_catholic_reformation_bonus;


	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

          //
          // everyone rolls at least 1 dice
          //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    if (x > p_high) { p_high = x; }
	    pdice.push(x);
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    if (x > c_high) { c_high = x; }
	    cdice.push(x);
	  }

	  //
	  // do protestants win?
	  //
	  if (p_high > c_high) { protestants_win = 1; }
	  if (p_high == c_high && ties_resolve === "protestant") { protestants_win = 1; }

	  //
	  //
	  //
	  let obj = {};
	  obj.key = mv[1];
          obj.name = this.spaces[space].name;
	  obj.pdice = pdice;
	  obj.cdice = cdice;
	  obj.p_roll_desc = p_roll_desc;
	  obj.c_roll_desc = c_roll_desc;
	  obj.p_high = p_high;
	  obj.c_high = c_high;
	  obj.reformation = true;
	  obj.counter_reformation = false;
          obj.protestants_win = protestants_win;
	  this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (protestants_win == 1) {
	    this.updateLog("Protestants win!");
	    this.game.queue.push("convert\t"+space+"\tprotestant");
	  } else {
	    this.updateLog("Catholics win!");
	  }

	  return 1;

	}


	if (mv[0] === "counter_reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_counter_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let catholics_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== target_language_zone) {
	    //
	    // catholics win ties if Paul III or Julius III are Pope
	    //
	    if (this.game.state.leaders.paul_iii == 1 || this.game.state.leaders.julius_iii == 1) {
	      ties_resolve = "catholic";
	    }
 	  }

          //
          // neighbours
          //
          for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              c_neighbours++;
            }
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              p_neighbours++;
            }
            if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              p_rolls++;
            }
            if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              c_rolls++;
            }
            if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
              p_rolls++;
            }
            if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
              c_rolls++;
            }
          }

          //
          // ourselves
          //
          if (this.hasProtestantLandUnits(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
          }
          if (this.hasCatholicLandUnits(space)) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
          }
          if (this.hasProtestantReformer(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
          }
          if (this.game.spaces[space].university) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
          }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.tmp_protestant_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_protestant_counter_reformation_bonus--;
	      if (this.game.state.tmp_protestant_counter_reformation_bonus < 0) { this.game.state.tmp_protestant_counter_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_catholic_counter_reformation_bonus--;
	      if (this.game.state.tmp_catholic_counter_reformation_bonus < 0) { this.game.state.tmp_catholic_counter_reformation_bonus = 0; }
	    }
	  }

          for (let i = 0; i < this.game.state.tmp_protestant_counter_reformation_bonus; i++) {
            p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
          }
          for (let i = 0; i < this.game.state.tmp_catholic_counter_reformation_bonus; i++) {
            c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
          }
          p_bonus += this.game.state.tmp_protestant_counter_reformation_bonus;
          c_bonus += this.game.state.tmp_catholic_counter_reformation_bonus;

	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

	  //
	  // everyone rolls at least 1 dice
	  //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    pdice.push(x);
	    if (x > p_high) { p_high = x; }
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    cdice.push(x);
	    if (x > c_high) { c_high = x; }
	  }

	  //
	  // do catholics win?
	  //
	  if (p_high < c_high) { catholics_win = 1; }
	  if (p_high == c_high && ties_resolve === "catholics") { catholics_win = 1; }

          //
          // render results
          //
          let obj = {};
          obj.key = mv[1];
          obj.name = this.spaces[space].name;
          obj.pdice = pdice;
          obj.cdice = cdice;
          obj.p_roll_desc = p_roll_desc;
          obj.c_roll_desc = c_roll_desc;
          obj.p_high = p_high;
          obj.c_high = c_high;
	  obj.reformation = false;
	  obj.counter_reformation = true;
          obj.catholics_win = catholics_win;
	  obj.protestants_win = 1;
	  if (catholics_win) { obj.protestants_win = 0; }
          this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (catholics_win == 1) {
	    this.updateLog("Catholics win!");
	    this.game.queue.push("convert\t"+space+"\tcatholic");
	  } else {
	    this.updateLog("Protestants win!");
	  }

	  return 1;

	}


	//
	// objects and cards can add commands
	//
        for (let i in z) {
          if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
        }


        //
        // avoid infinite loops
        //
        if (shd_continue == 0) {
          console.log("NOT CONTINUING");
          return 0;
        }

    } // if cards in queue
    return 1;

  }






  returnPlayers(num = 0) {

    var players = [];
    let factions  = JSON.parse(JSON.stringify(this.factions));
    let factions2 = JSON.parse(JSON.stringify(this.factions));

    // < 6 player games
    if (num == 2) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 4) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key != "ottoman" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    for (let i = 0; i < num; i++) {

      if (i == 0) { col = "color1"; }
      if (i == 1) { col = "color2"; }
      if (i == 2) { col = "color3"; }
      if (i == 3) { col = "color4"; }
      if (i == 4) { col = "color5"; }
      if (i == 5) { col = "color6"; }

      var keys = Object.keys(factions);
      let rf = keys[this.rollDice(keys.length) - 1];

      if (i == 0) {
        if (this.game.options.player1 != undefined) {
          if (this.game.options.player1 != "random") {
            rf = this.game.options.player1;
          }
        }
      }
      if (i == 1) {
        if (this.game.options.player2 != undefined) {
          if (this.game.options.player2 != "random") {
            rf = this.game.options.player2;
          }
        }
      }
      if (i == 2) {
        if (this.game.options.player3 != undefined) {
          if (this.game.options.player3 != "random") {
            rf = this.game.options.player3;
          }
        }
      }
      if (i == 3) {
        if (this.game.options.player4 != undefined) {
          if (this.game.options.player4 != "random") {
            rf = this.game.options.player4;
          }
        }
      }
      if (i == 4) {
        if (this.game.options.player5 != undefined) {
          if (this.game.options.player5 != "random") {
            rf = this.game.options.player5;
          }
        }
      }
      if (i == 5) {
        if (this.game.options.player6 != undefined) {
          if (this.game.options.player6 != "random") {
            rf = this.game.options.player6;
          }
        }
      }

      delete factions[rf];


      players[i] = {};
      players[i].tmp_debaters_committed_reformation = 0;
      players[i].tmp_debaters_committed_translation = 0;
      players[i].tmp_debaters_committed_counter_reformation = 0;
      players[i].tmp_roll_bonus = 0;
      players[i].tmp_roll_first = 0;
      players[i].tmp_roll_modifiers = [];
      players[i].factions = [];
      players[i].factions.push(rf);
      players[i].factions_passed = [];
      players[i].factions_passed.push(false); // faction not passed
      players[i].captured = [];
      players[i].num = i;

      //
      // Each power's VP total is derived from base, special, and bonus VP. 
      // The base VP total is shown in the lower-left of the power card.
      //
      players[i].vp_base = 0;
      players[i].vp_special = 0;
      players[i].vp_bonus = 0;

    }


    if (num == 3) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "france") {
	  players[i].factions.push("ottoman");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 4) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 5) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
      }
    }

    return players;

  }

  //
  // runs each new round
  //
  resetPlayerRound(player_num) {

    this.game.state.tmp_bonus_protestant_translation_german_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_french_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_english_zone = 0;
    this.game.state.tmp_bonus_papacy_burn_books = 0;

    for (let i = 0; i < this.game.state.players_info[player_num-1].factions.length; i++) {
      this.game.state.players_info[player_num-1].factions_passed[i] = false;
    }
  }

  returnPlayerInfoFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z].key == faction) {
	  return this.game.state.players_info[i].factions[z];
	}
      }
    }

    return null;
  }

  //
  // runs each new turn
  //
  resetPlayerTurn(player_num) {

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
    this.game.state.tmp_papacy_may_specify_debater = 0;
    this.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    this.deactivateDebaters();

    for (let s in this.game.spaces) {
      if (this.game.spaces[s].besieged == 2) {
	this.game.spaces[s].besieged = 1;
      }
    }

    let p = this.game.state.players_info[(player_num-1)];
    p.tmp_debaters_committed_reformation = 0;
    p.tmp_debaters_committed_translation = 0;
    p.tmp_debaters_committed_counter_reformation = 0;
    p.tmp_roll_bonus = 0;
    p.tmp_roll_first = 0;
    p.tmp_roll_modifiers = [];
    p.has_colonized = 0;
    p.has_explored = 0;
    p.has_conquered = 0;

    this.game.state.field_battle = {};

    this.game.state.active_player = player_num;

  }

  isFactionInPlay(faction) {
    for (let i = 0; i < this.game.players.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z] === faction) { return 1; }
      }
    }
    return 0;
  }

  returnPlayerOfFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.game.state.players_info[i].factions.includes(faction)) {
	return i+1;
      }
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	let f = this.game.state.players_info[i].factions[z];
        if (this.game.state.activated_powers[f].includes(faction)) {
	  return (i+1);
        }
      }
    }
    return 0;
  }


  //
  // 1 hits to destroy everything, opt-in for naval units
  //
  playerAssignHits(faction, spacekey, hits_to_assign, naval_hits_acceptable=0) {

    let his_self = this;
    let space = spacekey;
    try { if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; } } catch (err) {}

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;

      for (let i = 0; i < space.units[faction].length; i++) {
        if (!units_to_destroy.includes(parseInt(i))) {

	  let is_fodder = true;
          if (space.units[faction][i].land_or_sea === "sea" && naval_hits_acceptable == 0) { is_fodder = false; }
          if (space.units[faction][i].personage == true) { is_fodder = false; }

	  if (is_fodder == true) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
	}
      }
      html += "</ul>";

      if (targets <= 0 || hits_to_assign <= 0) {
	this.addMove("destroy_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	this.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "regular") { hits_to_assign -= 1; }
	if (units_available[id].type == "mercenary") { hits_to_assign -= 1; }
	if (units_available[id].type == "squadron") { hits_to_assign -= 1; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }
	if (units_available[id].type == "cavalry") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }

  //
  // 2 hits to destroy a squadron, 1 for a corsair
  //
  playerAssignNavalHits(faction, hits_to_assign, spacekey) {

    let his_self = this;
    let space;

    if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
    if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

    let units_available = space.units[faction];
    let units_to_destroy = [];

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;
      for (let i = 0; i < space.units[faction].length; i++) {
        if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
          if (!units_to_destroy.includes(parseInt(i))) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
          html += "</ul>";
        }
      }

      if (targets <= 0 || hits_to_assign <= 0) {
	this.addMove("destroy_naval_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	this.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "squadron") { hits_to_assign -= 2; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }


  playerResolveNavalWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFactionControlledPort(faction, spacekey);

    let msg = "Select Winter Port for Naval Units in "+space.name;
    let opt = "";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', () => {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.addMove("retreat_to_winter_port_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }

  playerResolveWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
    let space = this.game.spaces[spacekey];

    let msg = "Select Winter Location for Units in "+space.name;
    let opt = "";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', () => {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.addMove("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }


  playerRetainUnitsWithFilter(faction, filter_func, num_to_retain) {

    let units_available = [];
    let units_to_retain = [];

    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (filter_func(key, i)) {
	    units_available.push({spacekey : key, idx : i});
	  }
	}
      }
    }

    let selectUnitsInterface = function(his_self, units_to_retain, units_available, selectUnitsInterface) {

      let msg = "Select Units to Retain: ";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = his_self.game.spaces[spacekey].units[faction][units_available[i].idx];
        if (units_to_retain.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

console.log("UNITS AVAILABLE: " + JSON.stringify(units_available));
console.log("UNITS TO RETAIN: " + JSON.stringify(units_to_retain));

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit\t"+faction+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;

	}


	//
	// add unit to units available
	//
        if (units_to_retain.includes(id)) {
          let idx = units_to_retain.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
	  units_to_retain.push(id);
	}

	//
	// if this is max to retain, we end as well
	//
	if (units_to_retain.length === num_to_retain) {

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit\t"+faction+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;
	}
      });
    }

    selectUnitsInterface(his_self, units_to_retain, units_available, selectUnitsInterface);

    return 0;

  }




  returnPlayerFactions(player) {
    return this.game.state.players_info[player-1].factions;
  }

  returnActionMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Move formation in clear",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Move formation over pass",
      check : this.canPlayerMoveFormationOverPass,
      fnct : this.playerMoveFormationOverPass,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Naval transport",
      check : this.canPlayerNavalTransport,
      fnct : this.playerNavalTransport,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1],
      name : "Naval move",
      check : this.canPlayerNavalMove,
      fnct : this.playerNavalMove,
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Buy mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Raise regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Build naval squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Control unfortified space",
      check : this.canPlayerControlUnfortifiedSpace,
      fnct : this.playerControlUnfortifiedSpace,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,2,2],
      name : "Explore",
      check : this.canPlayerExplore,
      fnct : this.playerExplore,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,3,3],
      name : "Colonize",
      check : this.canPlayerColonize,
      fnct : this.playerColonize,
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [4,4,4],
      name : "Conquer",
      check : this.canPlayerConquer,
      fnct : this.playerConquer,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [2],
      name : "Initiate piracy in a sea",
      check : this.canPlayerInitiatePiracyInASea,
      fnct : this.playerInitiatePiracyInASea,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Raise Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Build corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
    });
    menu.push({
      factions : ['protestant'],
      cost : [1],
      name : "Translate scripture",
      check : this.canPlayerTranslateScripture,
      fnct : this.playerTranslateScripture,
    });
    menu.push({
      factions : ['england','protestant'],
      cost : [3,2],
      name : "Publish treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
    });
    menu.push({
      factions : ['papacy','protestant'],
      cost : [3,3],
      name : "Call theological debate",
      check : this.canPlayerCallTheologicalDebate,
      fnct : this.playerCallTheologicalDebate,
    });
    menu.push({
      factions : ['papacy'],
      cost : [1],
      name : "Build Saint Peters",
      check : this.canPlayerBuildSaintPeters,
      fnct : this.playerBuildSaintPeters,
    });
    menu.push({
      factions : ['papacy'],
      cost : [2],
      name : "Burn books",
      check : this.canPlayerBurnBooks,
      fnct : this.playerBurnBooks,
    });
    // Loyola reduces Jesuit University Cost
    if (this.canPlayerCommitDebater("papacy", "loyola-debater")) {
      menu.push({
        factions : ['papacy'],
        cost : [2],
        name : "Found Jesuit University w/ Loyola",
        check : this.canPlayerFoundJesuitUniversity,
        fnct : this.playerFoundJesuitUniversityWithLoyola,
      });
    }
    menu.push({
      factions : ['papacy'],
      cost : [3],
      name : "Found Jesuit University",
      check : this.canPlayerFoundJesuitUniversity,
      fnct : this.playerFoundJesuitUniversity,
    });

    if (player == null) { return menu; }

    let pfactions = this.returnPlayerFactions(player);
    let fmenu = [];

    for (let i = 0; i < menu.length; i++) {
      for (let z = 0; z < pfactions.length; z++) {
        if (menu[i].factions.includes(pfactions[z])) {
          fmenu.push(menu[i]);
	  z = pfactions.length+1;
        }
      }
    }

    return fmenu;

  }


  playerSelectFactionWithFilter(msg, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;
    let factions = this.returnImpulseOrder();
    let f = [];

    for (let i = 0; i < factions.length; i++) {
      if (filter_func(factions[i])) { f.push(factions[i]); }
    }

    let html = "<ul>";
    for (let i = 0; i < f.length; i++) {
      html += `<li class="option" id="${f[i]}">${f[i]}</li>`;
    }
    html += "</ul>";

    his_self.updateStatusWithOptions(msg, html);
     
    $('.option').off();
    $('.option').on('click', function () {

      let id = $(this).attr("id");
      $('.option').off();
      mycallback(id);
    });

    return 0;
  }


  playerFactionSelectCardWithFilter(faction, msg, filter_func, mycallback = null, cancel_func = null) {

    let cards = [];
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      if (filter_func(this.game.deck[0].fhand[faction_hand_idx])) {
	cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
      }
    }

    this.updateStatusAndListCards(msg, cards);
    this.attachCardboxEvents(function(card) {
      mycallback(card, faction);
    });

  }


  countSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) { count++; }
    }
    return count;
  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;

    let html = '';
    html += '<ul>';
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  let t = "."+key;
	  document.querySelectorAll(t).forEach((el) => {
	    el.onclick = (e) => {
	      el.onclick = () => {};
	      $('.option').off();
	      $('.space').off();
	      $('.hextile').off();
	      mycallback(key);
	    }
	  });
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in his_self.game.spaces) {
          if (filter_func(his_self.game.spaces[key]) == 1) {
	    let t = "."+key;
	    document.querySelectorAll(t).forEach((el) => {
	      el.onclick = (e) => {};
	    });
	  }
	}
      }

      $('.option').off();
      $('.space').off();
      $('.hextile').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(action);

    });

  }

  playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;

    let html = '';
    html += '<ul>';
    for (let key in this.game.navalspaces) {
      if (filter_func(this.game.navalspaces[key]) == 1) {
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    mycallback(key);
	  }
	}
      }
    }
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.getElementById(key).onclick = (e) => {
	    $('.option').off();
	    mycallback(key);
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      mycallback(action);

    });

  }




  playerTurn(faction, selected_card=null) {

    this.startClock();

    let his_self = this;

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    let cards = [];
    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length;i++) {
      cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
    }
    cards.push("pass");


    this.updateStatusAndListCards("Select a Card: ", cards);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(card, this.game.player, faction);
    });  

  }


  playerFortifySpace(faction, attacker, spacekey) {

    let space = this.game.spaces[spacekey];
    let faction_map = this.returnFactionMap(space, attacker, faction);
    let player = this.returnPlayerOfFaction(faction);

    let his_self = this;
    let units_to_move = [];
    let available_units = [];

    for (f in faction_map) { 
      if (faction_map[f] !== attacker) {
        for (let i = 0; i < space.units[f].length; i++) {
          available_units.push({ faction : f , unit_idx : i });
        }
      }
    }

    let selectUnitsInterface = function(his_self, units_to_move, available_units, selectUnitsInterface) {

      let msg = "Fortification Holds 4 Units: ";
      let html = "<ul>";

      for (let i = 0; i < available_units.length; i++) {
	let tf = available_units[i].faction;
	let tu = space.units[tf][available_units[i].unit_idx];
	if (units_to_move.includes(i)) {
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${tu.name} - ${his_self.returnFactionName(tf)} *</li>`;
	} else {
          html += `<li class="option" style="" id="${i}">${tu.name} - ${his_self.returnFactionName(tf)}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);
     
      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

	  // faction associative array
	  let fa = {};
	  for (let f in faction_map) { fa[f] = []; };

	  // move in the units
	  for (let i = 0; i < units_to_move.length; i++) {
	    let ui = units_to_move[i];
	    let tf = available_units[ui].faction;
	    let tu = available_units[ui].unit_idx;
	    fa[tf].push(tu);
	  }

	  for (let f in fa) {
	    his_self.addMove("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(fa[f]));
	  }
	  his_self.endTurn();

          return;
	}
        
	units_to_move.push(id);

        selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

      });
    };

    selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

    return 0;

  }

  playerPlayDiplomacyCard(faction) {

    let p = this.returnPlayerOfFaction(faction);
    let his_self = this;

    this.updateStatusAndListCards("Select Diplomacy Card to Play", this.game.deck[1].hand);
    this.attachCardboxEvents(function(card) {
      his_self.addMove("diplomacy_card_event\t"+faction+"\t"+card);
      his_self.addMove("discard_diplomacy_card\t"+faction+"\t"+card);
      his_self.endTurn();
    });

  }

  playerPlayCard(card, player, faction) {

    //
    // maybe we are passing
    //
    if (card === "pass") {
      this.addMove("pass\t"+faction);
      this.endTurn();
      return;
    }


    //
    // mandatory event cards effect first, then 2 OPS
    //
    if (this.deck[card].type === "mandatory") {
      this.addMove("remove\t"+faction+"\t"+card);
      this.addMove("ops\t"+faction+"\t"+card+"\t"+2);
      this.playerPlayEvent(card, faction);
    } else {

      let html = `<ul>`;
      html    += `<li class="card" id="ops">play for ops</li>`;
      if (this.deck[card].canEvent(this, faction)) {
        html    += `<li class="card" id="event">play for event</li>`;
      }
      html    += `</ul>`;

      this.updateStatusWithOptions('Playing card:', html, true);
      this.bindBackButtonFunction(() => {
        this.playerTurn(faction);
      });
      this.attachCardboxEvents((user_choice) => {
        if (user_choice === "ops") {
          let ops = this.game.deck[0].cards[card].ops;
          this.playerPlayOps(card, faction, ops);
          return;
        }
        if (user_choice === "event") {
          this.playerPlayEvent(card, faction);
          return;
        }
        return;
      });
    }
  }

  async playerPlayOps(card, faction, ops=null) {

    //
    // discard the card
    //
    this.addMove("discard\t"+faction+"\t"+card);

    let his_self = this;
    let menu = this.returnActionMenuOptions(this.game.player);
    let pfactions = this.returnPlayerFactions(this.game.player);

    if (ops == null) { ops = 2; }
    if (ops == 0) { console.log("OPS ARE ZERO!"); }


    if (this.game.state.activated_powers[faction].length > 0) {

      let html = `<ul>`;
      html    += `<li class="card" id="${faction}">${faction}</li>`;
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
         html    += `<li class="card" id="${this.game.state.activated_powers[faction][i]}">${this.game.state.activated_powers[faction][i]}</li>`;
      }
      html    += `</ul>`;

      let ops_text = `${ops} op`;
      if (ops > 0) { ops_text += 's'; }

      this.updateStatusWithOptions(`Which Faction: ${ops_text}`, html);
      this.attachCardboxEvents(function(selected_faction) {

	//
	// duplicates code below
	//
        let html = `<ul>`;
        for (let i = 0; i < menu.length; i++) {
	  // added ops to check() for naval transport
          if (menu[i].check(this, this.game.player, selected_faction, ops)) {
            for (let z = 0; z < menu[i].factions.length; z++) {
              if (menu[i].factions[z] === selected_faction) {
  	        if (menu[i].cost[z] <= ops) {
                  html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
                }
	        z = menu[i].factions.length+1;
              }
            }
          }
        }

        html    += `<li class="card" id="end_turn">end turn</li>`;
        html    += `</ul>`;

        his_self.updateStatusWithOptions(`You have ${ops} ops remaining: ${faction}`, html, false);
        this.attachCardboxEvents(async (user_choice) => {      

          if (user_choice === "end_turn") {
            this.endTurn();
            return;
          }

          for (let z = 0; z < menu[user_choice].factions.length; z++) {
            if (pfactions.includes(menu[user_choice].factions[z])) {
              ops -= menu[user_choice].cost[z];
	        z = menu[user_choice].factions.length+1;
            }
          }

          if (ops > 0) {
	    this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops);
          }
          menu[user_choice].fnct(this, this.game.player, selected_faction);
          return;

        });
      });
    } else {

      //
      // duplicates code above
      //
      let html = `<ul>`;
      for (let i = 0; i < menu.length; i++) {
        if (menu[i].check(this, this.game.player, faction)) {
          for (let z = 0; z < menu[i].factions.length; z++) {
            if (menu[i].factions[z] === faction) {
  	      if (menu[i].cost[z] <= ops) {
                html += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
              }
	      z = menu[i].factions.length+1;
            }
          }
        }
      }

      html    += `<li class="card" id="end_turn">end turn</li>`;
      html    += `</ul>`;

      this.updateStatusWithOptions(`You have ${ops} ops remaining: ${faction}`, html, false);
      this.attachCardboxEvents(async (user_choice) => {      

        if (user_choice === "end_turn") {
          this.endTurn();
          return;
        }

        for (let z = 0; z < menu[user_choice].factions.length; z++) {
          if (pfactions.includes(menu[user_choice].factions[z])) {
            ops -= menu[user_choice].cost[z];
  	    z = menu[user_choice].factions.length+1;
          }
        }

        if (ops > 0) {
  	  this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops);
        }
        menu[user_choice].fnct(this, this.game.player, faction);
        return;
      });

    }
  }
  playerPlayEvent(card, faction, ops=null) {
    this.addMove("event\t"+faction+"\t"+card);
    this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " plays " + card + " for the event\tevent\t"+card);
    this.addMove("RESETCONFIRMSNEEDED\tall");
    this.endTurn();
  }


  playerActionMenu(player) {
    let menu_options = this.returnActionMenuOptions();
  }

  async playerReformationAttempt(player) {
    this.updateStatus("Attempting Reformation Attempt");
    return;
  }
  async playerCounterReformationAttempt(player) {
console.log("1");
return;
  }


  playerPlayPapacyDiplomacyPhaseSpecialTurn() {
this.updateLog("Papacy Diplomacy Phase Special Turn");
    this.endTurn();
    return;
  }


  playerPlaySpringDeployment(faction, player) {

    let his_self = this;
    let capitals = this.factions[faction].capitals;
    let viable_capitals = [];
    let can_deploy = 0;
    let units_to_move = [];
    let cancel_func = null;
    let source_spacekey;

    for (let i = 0; i < capitals.length; i++) {
      let c = capitals[i];
      if (this.game.spaces[c].units[faction].length > 0) {
        can_deploy = 1;
        viable_capitals.push(capitals[i]);
      }
    }

    if (can_deploy == 0) {
      this.updateStatus("Spring Deployment not possible");
      this.endTurn();
    } else {

      let msg = "Do you wish to Spring Deploy from: ";
     
      let opt = "";
      for (let i = 0; i < viable_capitals.length; i++) {
	opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
      }
      opt += `<li class="option" id="pass">skip</li>`;

      this.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function() {

        let id = $(this).attr('id');

        $(".option").off();

	source_spacekey = id;

	if (id === "pass") {
	  his_self.updateStatus("passing...");
	  his_self.endTurn();
	  return;
        }

       his_self.playerSelectSpaceWithFilter(

          "Select Destination for Units from Capital: ",

          function(space) {
            if (his_self.isSpaceFriendly(space, faction)) {
              if (his_self.isSpaceConnectedToCapitalSpringDeployment(space, faction)) {
                if (!his_self.isSpaceFactionCapital(space, faction)) {
                  return 1;
		}
              }
            }
            return 0;
          },


          function(destination_spacekey) {

            let space = his_self.spaces[source_spacekey];

	    //
	    // spring deployment doesn't have this, so we wrap the sending/end-move
	    // action in this dummy function so that the same UI can be used for 
	    // multiple movement options, with the normal one including intervention
	    // checks etc.
	    //
	    let selectDestinationInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	      // MOVE THE UNITS
              units_to_move.sort();

              for (let i = 0; i < units_to_move.length; i++) {
                his_self.addMove("move\t"+faction+"\tland\t"+source_spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
              }
              his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" spring deploys to "+his_self.game.spaces[destination_spacekey].name);
              his_self.endTurn();
              return;

	    };

            let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) { 

	      let mobj = {
		space : space ,
		faction : faction ,
		source : source_spacekey ,
		destination : destination_spacekey ,
 	      }
   	      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	      let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	      let msg = "Max Formation Size: " + max_formation_size + " units";

              let html = "<ul>";
              for (let i = 0; i < space.units[faction].length; i++) {
                if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
                  if (units_to_move.includes(parseInt(i))) {
                    html += `<li class="option" style="font-weight:bold" id="${i}">* ${space.units[faction][i].name} *</li>`;
                  } else {
                    html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
                  }
                }
              }
              html += `<li class="option" id="end">finish</li>`;
              html += "</ul>";

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let id = $(this).attr("id");

                if (id === "end") {
		  his_self.movement_overlay.hide();
		  selectDestinationInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
                  return;
                }

		//
		// check for max formation size
		//
		let unitno = 0;
		for (let i = 0; i < units_to_move.length; i++) {
		  if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
		  if (unitno >= max_formation_size) { 
		    alert("Maximum Formation Size: " + max_formation_size);
		    return;
		  }
		}


	        if (units_to_move.includes(id)) {
	          let idx = units_to_move.indexOf(id);
	          if (idx > -1) {
  		    units_to_move.splice(idx, 1);
	          }
	        } else {
	          if (!units_to_move.includes(parseInt(id))) {
	            units_to_move.push(parseInt(id));
	          } else {
		    for (let i = 0; i < units_to_move.length; i++) {
		      if (units_to_move[i] === parseInt(id)) {
		        units_to_move.splice(i, 1);
		        break;
		      }
		    }
	          }
	        }

                selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);

              });
            }
            selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
          }
        );
      });
    }
  }

  returnMaxFormationSize(units_to_move) {

    let command_value_one = 0;
    let command_value_two = 0;
    let max_command_value = 0;

    for (let i = 0; i < units_to_move.length; i++) {
      if (units_to_move[i].command_value > 0) {
        // we can have up to two army leaders combine command values
	if (command_value_one == 0) {
	  command_value_one = units_to_move[i].command_value; 
	} else {
	  if (command_value_two == 0) {
	    command_value_one = units_to_move[i].command_value;
	  } else {
	    if (command_value_one > command_value_two && units_to_move[i].command_value > command_value_one) {
	      command_value_one = units_to_move[i].command_value;
	    } else {
	      if (command_value_one < command_value_two && units_to_move[i].command_value > command_value_two) {
	        command_value_two = units_to_move[i].command_value;
	      }
	    }
	  }
	}

	max_command_value = command_value_one + command_value_two;
      }
    }

    if (max_command_value > 4) { return max_command_value; }
    return 4;

  }

  async playerMoveFormationInClear(his_self, player, faction) {

    let units_to_move = [];
    let cancel_func = null;

    his_self.playerSelectSpaceWithFilter(

      "Select Town from Which to Move Units:",

      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length > 0 && faction === z) {
	    return 1;
          }
	}
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];

	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      if (space.neighbours.includes(spacekey)) {
	        if (!space.pass) { 
		  return 1; 
		} else {
 		  if (!space.pass.includes(spacekey)) {
		    return 1;
		  }
		}
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort();

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
              his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove");
	      his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
	    destination : "" ,
 	  }
   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (space.units[faction][i].locked == false) {
	        if (units_to_move.includes(parseInt(i))) {
	          html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[faction][i].name}*</li>`;
	        } else {
	          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	        }
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      his_self.movement_overlay.hide();
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    //
	    // check for max formation size
	    //
	    let unitno = 0;
	    for (let i = 0; i < units_to_move.length; i++) {
	      if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
	      if (unitno >= max_formation_size) { 
	        alert("Maximum Formation Size: " + max_formation_size);
	        return;
	      }
	    }


	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      if (!units_to_move.includes(parseInt(id))) {
	        units_to_move.push(parseInt(id));
	      } else {
		for (let i = 0; i < units_to_move.length; i++) {
		  if (units_to_move[i] === parseInt(id)) {
		    units_to_move.splice(i, 1);
		    break;
		  }
		}
	      }
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	
      },

      cancel_func,

      true,

    );

  }

  playerSelectUnitsWithFilterFromSpacesWithFilter(faction, space_filter_func, unit_filter_func, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let selected = [];

    let selectSpacesInterface = function(his_self, selected, selectSpacesInterface) {

      his_self.playerSelectSpaceWithFilter(

        ("Select Space of Unit" + (selected.length+1)),

	space_filter_func,

        function(spacekey) {

	  let options = [];
	  let space = his_self.game.spaces[spacekey];
	  let units = space.units[faction];
	  let num_remaining = num - selected.length;

          for (let i = 0; i < units; i++) {
	    if (unit_filter_func(units[i])) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (z.spacekey == spacekey && i === unit_idx) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
	        options.push({ spacekey : spacekey, unit : units[i] , unit_idx : i });
	      }
	    }
	  }

  	  his_self.playerSelectOptions(options, num_remaining, false, function(array_of_unit_idxs) {

	    //
	    // selected options copied to selected
	    //
	    for (let i = 0; i < array_of_unit_idxs.length; i++) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (selected[z].spacekey == options[array_of_unit_idxs[i]].spacekey && selected[z].unit_idx === array_of_unit_idxs[i]) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
		selected.push(options[array_of_unit_idxs[i]]);
	      }
	    }

	    //    
	    // still more needed?    
	    //    
	    let num_remaining = num - selected.length;
	    if (num_remaining > 0) {
	      selectSpacesInterface(his_self, selected, selectSpacesInterface);
	    } else {
	      mycallback(selected);
	    }

	  });
	}
      );
    }

    selectSpacesInterface(his_self, selected, selectSpacesInterface);

  }

  playerSelectOptions(options, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let options_selected = [];
    let cancel_func = null;

    let selectOptionsInterface = function(his_self, options_selected, selectOptionsInterface) {

      let remaining = num - options_selected.length;

      let msg = `Select From Options: (${remaining} remaining)`;
      let html = "<ul>";
      for (let i = 0; i < options.length; i++) {
        if (options_selected.includes(parseInt(i))) {
	  html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	} else {
          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

          let id = $(this).attr("id");

	  if (id === "end") {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }

          if (options_selected.includes(id)) {
	    let idx = options_selected.indexOf(id);
	    if (idx > -1) {
  	      options_selected.splice(idx, 1);
	    }
	  } else {
	    if (!options_selected.includes(id)) {
	      options_selected.push(id);
	    } else {
	      for (let i = 0; i < options_selected.length; i++) {
	        if (options_selected[i] === id) {
		  options_selected.splice(i, 1);
		  break;
		}
	      }
	    }
	  }

	  if (options_selected.length == num) {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }


	  selectOptionsInterface(his_self, options_selected, selectOptionsInterface);
      });

    }

    selectOptionsInterface(his_self, options_selected, selectUnitsInterface);
	
  }


  playerEvaluateNavalRetreatOpportunity(faction, spacekey) {

    let his_self = this;
    let retreat_destination = "";

    let space;
    if (his_self.game.spaces[spacekey]) { space = his_self.game.spaces[spacekey]; }
    if (his_self.game.navalspaces[spacekey]) { space = his_self.game.navalspaces[spacekey]; }

    let neighbours = this.returnNavalAndPortNeighbours(spacekey);
    let retreat_options = 0;
    for (let i = 0; i < neighbours.length; i++) {
      if (this.canFactionRetreatToNavalSpace(faction, neighbours[i])) {
	retreat_options++;
      }
    }

    if (retreat_options == 0) {
      his_self.updateLog("Naval retreat not possible...");
      his_self.endTurn();
      return 0;
    }

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("naval_retreat"+"\t"+faction+"\t"+spacekey+"\t"+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {
      let html = "<ul>";
      for (let i = 0; i < neighbours.length; i++) {
        if (this.canFactionNavalRetreatToSpace(defender, neighbours[i])) {
          html += `<li class="option" id="${neighbours[i]}">${neighbours[i]}</li>`;
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Naval Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">do not retreat</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }

  playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey="", defender, is_attacker_loser=false) {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      if (is_attacker_loser) {
        his_self.addMove("retreat"+"\t"+attacker+"\t"+spacekey+"\t"+destination_spacekey);
      } else {
        his_self.addMove("retreat"+"\t"+defender+"\t"+spacekey+"\t"+destination_spacekey);
      }
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
	if (is_attacker_loser) {
          if (his_self.canFactionRetreatToSpace(attacker, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	} else {
          if (his_self.canFactionRetreatToSpace(defender, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

    };

    

    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    if (is_attacker_loser) { 
      html    += `<li class="card" id="skip">sacrifice forces</li>`;
    } else {
      html    += `<li class="card" id="skip">do not retreat</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${space_name}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateFortification(attacker, faction, spacekey) {

    let his_self = this;

    let html = `<ul>`;
    html    += `<li class="card" id="fortify">withdraw into fortification</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Withdraw Units into Fortification?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "fortify") {
	his_self.addMove("fortification\t"+attacker+"\t"+faction+"\t"+spacekey);
	his_self.endTurn();
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("intercept"+"\t"+attacker+"\t"+spacekey+"\t"+attacker_includes_cavalry+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

console.log("selecting intercept units");

      let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
      let msg = "Max Formation Size: " + max_formation_size + " units";
      let space = his_self.game.spaces[defender_spacekey];

      let html = "<ul>";

console.log("units length: " + space.units[defender].length);

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "land" || space.units[defender][i].land_or_sea === "both") {
	  if (space.units[defender][i].locked == false) {
            if (units_to_move.includes(parseInt(i))) {
              html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
            } else {
              html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
            }
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      let mobj = {
	space : space ,
	faction : defender ,
	source : defender_spacekey ,
	destination : spacekey ,
      }

      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, onFinishSelect); // no destination interface

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }

        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move.push(parseInt(id));
        }

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept from ${defender_spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }






  playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("naval_intercept"+"\t"+attacker+"\t"+spacekey+"\t"+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

      let msg = "Select Units to Intercept: ";
      let space;
      if (his_self.game.spaces[defender_spacekey]) {
        space = his_self.game.spaces[defender_spacekey];
      }
      if (his_self.game.navalspaces[defender_spacekey]) {
        space = his_self.game.navalspaces[defender_spacekey];
      }

      let html = "<ul>";

console.log("units length: " + space.units[defender].length);

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "sea" || space.units[defender][i].land_or_sea === "both") {
          if (units_to_move.includes(parseInt(i))) {
            html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
          } else {
            html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }

        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move.push(parseInt(id));
        }

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept from ${defender_spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }




  canPlayerNavalTransport(his_self, player, faction, ops) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (ops < 2) { return 0; }
    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (his_self.game.spaces[spaces_with_infantry[i]].ports.length == 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }
    
    if (spaces_with_infantry.length == 0) { return 0; }

    for (let i = 0; i < spaces_with_infantry.length; i++) {
      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[i], ops);
      if (dest.length > 0) { return 1; }
    }

    return 0;

  }
  async playerNavalTransport(his_self, player, faction) {

    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (!his_self.game.spaces[spaces_with_infantry[i]].ports.length > 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }

    let html = `<ul>`;
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      html    += `<li class="option" id="${i}">${spaces_with_infantry[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Transport from Which Port?`, html);
    this.attachCardboxEvents(function(user_choice) {

      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[user_choice], ops);
       
      let html = `<ul>`;
      for (let i = 0; i < dest.length; i++) {
        html    += `<li class="option" id="${i}">${dest[i].key} (${desk[i].cost} CP)</li>`;
      }
      html    += `</ul>`;

      his_self.updateStatusWithOptions(`Select Destination:`, html);
      his_self.attachCardboxEvents(function(destination) {
        his_self.endTurn();
      });
    });

  }


  async playerNavalTransport(his_self, player, faction) {
    his_self.endTurn();
    return;
  }

  // 1 = yes, 0 = no / maybe
  canPlayerPlayCard(faction, card) {
    let player = this.returnPlayerOfFaction(faction);
    if (this.game.player == player) { 
      let faction_hand_idx = this.returnFactionHandIdx(player, faction);
      for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
        let c = this.game.deck[0].fhand[faction_hand_idx][i];
  	if (c === card) { return 1; }
      }
    }
    return 0;
  }

  canPlayerCommitDebater(faction, debater) {
  
    if (faction !== "protestant" && faction !== "papacy") { return false; }
      
    let already_committed = false;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "papacy" && faction === "papacy") { return false; }
      if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "protestant" && faction !== "papacy") { return false; }
      if (this.game.state.debaters[i].key == debater) {
    
        let is_mine = false;

        if (this.game.state.debaters[i].owner === "papacy" && faction === "papacy") {
          is_mine = true;               
        }
        if (this.game.state.debaters[i].owner !== "papacy" && faction === "protestant") {
          is_mine = true;
        }
    
        if (is_mine == true) {
          if (this.game.state.debaters[i].active == 1) { already_comitted = true; }
        }
      }
    }
    return !already_committed;
  } 
    

  canPlayerMoveFormationOverPass(his_self, player, faction) {
    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_units.length; i++) {
      if (his_self.game.spaces[spaces_with_units[i]].pass.length > 0) {
        let any_unlocked_units = false;
        for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
  	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked == false) {
	    return 1;
	  }
        }
      }
    }
    return 0;
  }
  async playerMoveFormationOverPass(his_self, player, faction) {

    let units_to_move = [];

    his_self.playerSelectSpaceWithFilter(

      "Select Town from Which to Move Units:",

      // TODO - select only cities where I can move units
      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length > 0 && z === faction) {
	    let any_unlocked_units = false;
	    for (let i = 0; i < spaces.units[z].length; i++) {
	      if (space.units[z][i].locked == false) { any_unlocked_units = true; }
	    }
	    if (any_unlocked_units) { return 1; }
	    if (space.pass) { if (space.pass.length > 0) { return 1; } }
          }
	}
	return 0;
      },

      function(spacekey) {

        let space = his_self.spaces[spacekey];

	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      if (space.neighbours.includes(spacekey)) {
		if (space.pass) {
		  if (space.pass.includes(spacekey)) { return 1; }
		}
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort();
	      ////units_to_move.reverse();

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
	      this.endTurn();

	    },

	    cancel_func,

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move);
	  let msg = "Max Formation Size: " + max_formation_size + " units";

	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (units_to_move.includes(parseInt(i))) {
	        html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[faction][i].name}</li>`;
	      } else {
	        html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      selectDestinationInterface(his_self, units_to_move);    
	      return;
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      units_to_move.push(parseInt(id));
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	
      },

      cancel_func,

    );

  }


  canPlayerNavalMove(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.doesFactionHaveNavalUnitsOnBoard(faction)) { return 1; }
    return 0;
  }
  async playerNavalMove(his_self, player, faction) {

    let units_to_move = [];
    let units_available = his_self.returnFactionNavalUnitsToMove(faction);

    let selectUnitsInterface = function(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      let msg = "Select Unit to Move";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = units_available[i];
        if (units_to_move.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} (${units_available[i].spacekey} -> ${units_available[i].destination})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
	  let destinations = {};

console.log("UNITS AVAILABLE: " + JSON.stringify(units_available));
console.log("UNITS TO MOVE: " + JSON.stringify(units_to_move));

	  for (let i = 0; i < units_to_move.length; i++) {
	    let unit = units_available[units_to_move[i]];
	    if (!destinations[unit.destination]) {
	      his_self.addMove("naval_interception_check\t"+faction+"\t"+unit.destination);
	      destinations[unit.destination] = 1;
	    }
	  }


	  let revised_units_to_move = [];
	  let entries_to_loop = units_to_move.length;	
	  for (let z = 0; z < entries_to_loop; z++) {

console.log("z: " + z);

	    let highest_idx = 0;
	    let highest_num = 0;

	    for (let y = 0; y < units_to_move.length; y++) {
console.log("y: " + y);
   	      let unit = units_available[units_to_move[y]];
	      let max_num = unit.idx;
	      let max_idx = y;
	      if (max_num > highest_num) {
		highest_idx = max_idx;
		highest_num = max_num;
	      }
	    }

console.log("highest_idx: " + highest_idx);
console.log("highest_num: " + highest_num);

	    revised_units_to_move.unshift(JSON.parse(JSON.stringify(units_available[units_to_move[highest_idx]])));
	    units_to_move.splice(highest_idx, 1);
	  }

console.log("revised: " + JSON.stringify(revised_units_to_move));

	  //
	  // revised units to move is
	  //
	  for (let i = 0; i < revised_units_to_move.length; i++) {
	    let unit = revised_units_to_move[i];
            his_self.addMove("move\t"+faction+"\tsea\t"+unit.spacekey+"\t"+unit.destination+"\t"+revised_units_to_move[i].idx);
	  }
          his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" shifting naval forces\tnavalmove");
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.endTurn();
	  return;

	}

console.log("done 2");

	//
	// add unit to units available
	//
        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          if (!units_to_move.includes(parseInt(id))) {
            units_to_move.push(parseInt(id));
            selectDestinationInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
          } else {
            for (let i = 0; i < units_to_move.length; i++) {
              if (units_to_move[i] === parseInt(id)) {
                units_to_move.splice(i, 1);
      	        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
                break;
              }
            }
          }
        }
      });
    }
console.log("done 3");

    let selectDestinationInterface = function(his_self, unit_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      //
      // unit selected will always be last in array
      //
      let unit = units_available[unit_to_move[unit_to_move.length-1]];

console.log("UNIT WE ARE MOVING: " + JSON.stringify(unit));

      let destinations = his_self.returnNavalMoveOptions(unit.spacekey);

      console.log("SELECT DESTINATION INTERFACE: " + JSON.stringify(destinations));

      let msg = "Select Destination";
      let html = "<ul>";
      for (let i = 0; i < destinations.length; i++) {
	let spacekey = destinations[i];
        html += `<li class="option" style="font-weight:bold" id="${spacekey}">${spacekey}</li>`;
      }
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

	unit.destination = id;
        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

      });

    }

    selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

  }

  canPlayerMoveFormationInClear(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    if (spaces_with_units.length > 0) { 
      let any_unlocked_units = false;
      for (let i = 0; i < spaces_with_units.length; i++) {
       for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked == false) {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  canPlayerBuyMercenary(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  playerBuyMercenary(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Mercenary",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerRaiseRegular(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerRaiseRegular(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Regular",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerBuildNavalSquadron(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerBuildNavalSquadron(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.ports.length === 0) { return 0; }
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"squadron"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerAssault(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
        if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
	  return 1;
	}
      }
    }
    return 0;
  }
  async playerAssault(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Space for Siege/Assault: ",

      function(space) {
        if (!his_self.isSpaceControlled(space, faction) && his_self.returnFactionLandUnitsInSpace(faction, space) > 0 && space.besieged == 1) {
          if (his_self.game.spaces[space.key].type === "fortress") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "electorate") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "key") {
  	    return 1;
	  }
        }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("assault\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerControlUnfortifiedSpace(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i]), faction) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) {
	    console.log("1 SPACE IS: " + neighbours[z]);
	    return 1;
	  } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) {
	  console.log("2 SPACE IS: " + spaces_in_unrest[i]);
	  return 1;
	} 
      }
    }
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) { 
	console.log("3 SPACE IS: " + conquerable_spaces[i]);
	return 1;
      } 
    }
    return 0;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let pacifiable_spaces_in_unrest = [];
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i], faction)) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
      }
    }
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
	conquerable_spaces.splice(i, 1);
	i--;
      }
    }

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Pacify:",

      function(space) {
        if (pacifiable_spaces_in_unrest.includes(space.key)) { return 1; }
        if (conquerable_spaces.includes(space.key) && !his_self.isSpaceControlled(space.key, faction) && !his_self.isSpaceFriendly(space.key, faction)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("pacify\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (this.game.state.players_info[player-1].has_explored == 0) { return 1; }
    return 0;
  }
  async playerExplore(his_self, player, faction) {
    this.game.state.players_info[player-1].has_explored = 1;
console.log("10");
return;
  }
  canPlayerColonize(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (this.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerColonize(his_self, player, faction) {
    this.game.state.players_info[player-1].has_colonized = 1;
console.log("11");
return;
  }
  canPlayerConquer(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (this.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerConquer(his_self, player, faction) {
    this.game.state.players_info[player-1].has_conquered = 1;
console.log("12");
return;
  }
  canPlayerInitiatePiracyInASea(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (faction === "ottoman" && his_self.game.events.ottoman_piracy_enabled == 1) { return 1; }
    return 0;
  }
  async playerInitiatePiracyInASea(his_self, player, faction) {
console.log("13");
return;
  }
  canPlayerRaiseCavalry(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerRaiseCavalry(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerBuildCorsair(his_self, player, faction) {
    if (faction === "ottoman" && his_self.game.events.ottoman_corsairs_enabled == 1) { return 1; }
    return 0;
  }
  async playerBuildCorsair(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Corsair",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tsea\t"+faction+"\t"+"corsair"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerTranslateScripture(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    return 0;
  }
  async playerTranslateScripture(his_self, player, faction) {

    let msg = "Select Work to Translate:";
    let html = '<ul>';

    if (his_self.game.state.translations['new']['german'] < 6) {
      html += '<li class="option german" style="" id="1">German (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['french'] < 6) {
      html += '<li class="option french" style="" id="2">French (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['english'] < 6) {
      html += '<li class="option english" style="" id="3">English (new testament)</li>';
    }
    if (his_self.game.state.translations['full']['german'] < 10 && his_self.game.state.translations['new']['german'] >= 6) {
      html += '<li class="option german" style="" id="4">German (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['french'] < 10 && his_self.game.state.translations['new']['french'] >= 6) {
      html += '<li class="option french" style="" id="5">French (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['english'] < 10 && his_self.game.state.translations['new']['english'] >= 6) {
      html += '<li class="option english" style="" id="6">English (full bible)</li>';
    }
    html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let id = parseInt($(this).attr("id"));
      his_self.language_zone_overlay.hide();

      if (id == 1 || id == 4) {
	his_self.addMove("translation\tgerman"); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in German Language Zone\ttranslation_german_language_zone\tgerman\t"+faction);
      }
      if (id == 2 || id == 5) { 
	his_self.addMove("translation\tfrench"); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in French Language Zone\ttranslation_french_language_zone\tfrench\t"+faction);
      }
      if (id == 3 || id == 6) { 
	his_self.addMove("translation\tenglish"); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in English Language Zone\ttranslation_english_language_zone\tenglish\t"+faction);
      }
      // we only ask for our own CONFIRMS
      his_self.addMove("RESETCONFIRMSNEEDED\t"+his_self.game.player);
      his_self.endTurn();

    });

  }
  canPlayerPublishTreatise(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    if (faction === "england") {
      if (his_self.isPersonageOnMap("england", "cranmer") != null) {
	return 1;
      }
    }
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {

    if (faction === "protestant") {

      let msg = "Select Language Zone for Reformation Attempts:";
      let html = '<ul>';
          html += '<li class="option german" style="" id="german">German</li>';
          html += '<li class="option english" style="" id="english">English</li>';
          html += '<li class="option french" style="" id="french">French</li>';
          html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
          html += '<li class="option italian" style="" id="italian">Italian</li>';
          html += '</ul>';

      //
      // show visual language zone selector
      //
      his_self.language_zone_overlay.render();

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        his_self.language_zone_overlay.hide();

        let id = $(this).attr("id");

	if (id === "french" && his_self.canPlayerCommitDebater("protestant", "calvin-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Calvin Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="calvin-debater">Yes, Commit Calvin</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.addMove("hide_overlay\tpublish_treastise\tfrench");
	    if (id === "calvin-debater") {
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("show_overlay\tpublish_treastise\tfrench");
	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }


	if (id === "german" && his_self.canPlayerCommitDebater("protestant", "carlstadt-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Cardstatd Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="carlstadt-debater">Yes, Commit Carlstadt</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.addMove("hide_overlay\tpublish_treastise\tgerman");
	    if (id === "carlstadt") {
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("show_overlay\tpublish_treastise\tgerman");
	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }

	his_self.addMove("hide_overlay\tpublish_treastise\t"+id);
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("show_overlay\tpublish_treastise\t"+id);
	his_self.endTurn();
      });

    }


    if (faction === "england") {
      let id = "england";
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.endTurn();
    }

    return 0;
  }
  canPlayerCallTheologicalDebate(his_self, player, faction) {
//
// TODO
//
// If all Protestant debaters in a language zone are committed, the Protestant player may not initiate debates in that language zone. Similarly, if all Papal debaters are committed, the Papal player may not initiate debates in any language zone. If none of the Protestant debaters for a language zone have entered the game (or all of them have been burnt at the stake, excommuni- cated, or removed from play), neither player may call a debate in that zone. 
//
    if (faction === "protestant") { return 1; }
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerCallTheologicalDebate(his_self, player, faction) {

    let msg = "Select Language Zone for Theological Debate:";
    let html = '<ul>';

    if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
        html += '<li class="option german" style="" id="german">German</li>';
    }
    if (his_self.returnDebatersInLanguageZone("french", "france")) { 
        html += '<li class="option french" style="" id="french">French</li>';
    }
    if (his_self.returnDebatersInLanguageZone("english", "france")) { 
        html += '<li class="option english" style="" id="english">English</li>';
    }
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', (e) => {

      $('.option').off();
      let language_zone = e.currentTarget.id;

      his_self.language_zone_overlay.hide();

      let msg = "Against Commited or Uncommited Debater?";
      let html = '<ul>';
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
          html += '<li class="option" id="committed">Committed</li>';
      }
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", 0)) {
          html += '<li class="option" id="uncommitted">Uncommitted</li>';
      }
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('mouseover', function() {
        let action2 = $(this).attr("id");
        his_self.cardbox.show(action2);
      });
      $('.option').on('mouseout', function() {
        let action2 = $(this).attr("id");
        his_self.cardbox.hide(action2);
      });
      $('.option').on('click', () => {

        let committed = $(this).attr("id");

        if (committed === "committed") { committed = 1; } else { committed = 0; }

        if (faction === "papacy") {
	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+committed);
        } else {
    	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tProtestants call a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
    	  his_self.addMove("pick_first_round_debaters\tprotestant\tpapacy\t"+language_zone+"\t"+committed);
        }
        his_self.endTurn();

      });
    });

    return 0;

  }
  canPlayerBuildSaintPeters(his_self, player, faction) {
    if (faction === "papacy") {
      if (his_self.game.state.saint_peters_cathedral['vp'] < 5) { return 1; }
    }
    return 0;
  }
  async playerBuildSaintPeters(his_self, player, faction) {
    his_self.addMove("build_saint_peters\t"+player+"\t"+faction);
    his_self.endTurn();
    return 0;
  }
  canPlayerBurnBooks(his_self, player, faction) {
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerBurnBooks(his_self, player, faction) {

    let msg = "Select Language Zone for Counter Reformations";
    let html = '<ul>';
        html += '<li class="option german" style="" id="german">German</li>';
        html += '<li class="option english" style="" id="english">English</li>';
        html += '<li class="option french" style="" id="french">French</li>';
        html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
        html += '<li class="option italian" style="" id="italian">Italian</li>';
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      $('.option').off();
      his_self.language_zone_overlay.hide();
      let id = $(this).attr("id");

      if ((his_self.canPlayerCommitDebater("papacy", "cajetan-debater") || his_self.canPlayerCommitDebater("papacy", "tetzel-debater") || his_self.canPlayerCommitDebater("papacy", "caraffa")) && his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

        let msg = "Commit Debater for Burn Books Bonus:";
        let html = '<ul>';
	if (his_self.canPlayerCommitDebater("papacy", "tetzel-debater")) {
          html += '<li class="option" style="" id="tetzel-debater">+1 to Saint Peters</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "cajetan-debater")) {
          html += '<li class="option" style="" id="cajetan-debater">Cajetan +1 Attempt</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "caraffa-debater")) {
          html += '<li class="option" style="" id="caraffa-debater">Caraffa +1 Attempt</li>';
        }
        html += '<li class="option" style="" id="no">No</li>';
	html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

        $('.option').off();
        $('.option').on('mouseover', function() {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.show(action2);
          }
        });
        $('.option').on('mouseout', function() {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.hide(action2);
          }
        });
        $('.option').on('click', function () {
          let id2 = $(this).attr("id");

	  if (id2 === "tetzel-debater") {
            his_self.addMove("build_saint_peters");
	  }

	  his_self.addMove("hide_overlay\tburn_books\t"+id);
	  if (id2 === "cajetan-debater" || id2 === "caraffa-debater") {
	    if (id2 === "cajetan-debater") { his_self.addMove("commit\tpapacy\tcajetan-debater"); }
	    if (id2 === "caraffa-debater") { his_self.addMove("commit\tpapacy\tcaraffa-debater"); }
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  }
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  his_self.addMove("show_overlay\tburn_books\t"+id);
	  his_self.endTurn();

	  return 0;
	});

	return 0;
      }

      his_self.addMove("hide_overlay\tburn_books\t"+id);
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("show_overlay\tburn_books\t"+id);
      his_self.endTurn();
    });

    return 0;
  }
  canPlayerFoundJesuitUniversity(his_self, player, faction) {
    if (faction === "papacy" && his_self.game.state.events.papacy_may_found_jesuit_universities == 1) { return 1; }
    return 0;
  }
  async playerFoundJesuitUniversityWithLoyola(his_self, player, faction) {
    this.addMove("NOTIFY\tPapacy commits Loyola to lower cost of Jesuit University");
    this.addMove("commit\tpapacy\tloyola-debater");
    return this.playerFoundJesuitUniversity(his_self, player, faction);
  }
  async playerFoundJesuitUniversity(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Catholic-Controlled Space for Jesuit University",

      function(space) {
        if (space.religion === "catholic" &&
            space.university != 1) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	his_self.endTurn();
      },

    );

    return 0;
  }

  playerPlaceUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;
    let unit = new Unit();

    his_self.playerSelectSpaceWithFilter(

      `Place ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {
        
	his_self.addUnit(faction, spacekey, unittype);
        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerPlaceUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}
      },

      cancel_func 

    );
  }


  playerRemoveUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;
    let unit = new Unit();

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.removeUnit(faction, spacekey, unittype);
        his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerRemoveUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}

      },

      cancel_func 

    );
  }




  
  returnDebaters(faction="papacy", type="uncommitted") {
    let debaters = [];
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (faction == "papacy") {
        if (this.game.state.debaters[i].faction == faction) {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	}
      } else {
        if (this.game.state.debaters[i].faction != "papacy") {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    debaters.push(this.game.state.debaters[i]);
	  }
	}
      }
    }
    return debaters;
  }




  returnDiplomacyMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "End War",
      check : this.canPlayerEndWar,
      fnct : this.playerEndWar,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerFormAlliance,
      fnct : this.playerFormAlliance,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Loan Squadrons",
      check : this.canPlayerLoanSquadrons,
      fnct : this.playerLoanSquadrons,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerReturnCapturedArmyLeader,
      fnct : this.playerReturnCapturedArmyLeader,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Yield Territory",
      check : this.canPlayerYieldTerritory,
      fnct : this.playerYieldTerritory,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Issue Cards",
      check : this.canPlayerIssueCards,
      fnct : this.playerIssueCards,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
    });
    menu.push({
      factions : ['papacy'],
      name : "Give Mercenaries",
      check : this.canPlayerApproveDivorce,
      fnct : this.playerApproveDivorce,
    });
    menu.push({
      factions : ['papacy'],
      name : "Rescind Excommunication",
      check : this.canPlayerRescindExcommunication,
      fnct : this.playerRescindExcommunication,
    });

    return menu;

  }




  playerOfferAsFaction(faction) {

    let io = this.returnImpulseOrder();
    let html = `<ul>`;

    for (let i = io.length-1; i>= 0; i--) {
      for (let i = 0; i < pfactions.length; i++) {
        html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
      }
      html    += `</ul>`;
    }
 
    this.updateStatusWithOptions(`Offer Agreement to which faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.factionOfferFaction(faction, faction);
    });

  }


  factionOfferFaction(faction1, faction2) {

    let menu = this.returnDiplomacyMenuOptions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < menu.length; i++) {
      if (menu[i].check(this, faction1, faction2)) {
        for (let z = 0; z < menu[i].factions.length; z++) {
          if (menu[i].factions[z] === selected_faction) {
            if (menu[i].cost[z] <= ops) {
              html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
            }
            z = menu[i].factions.length+1;
          }
        }
      }
    }
    html    += `<li class="card" id="end_turn">end turn</li>`;
    html += '</ul>';

    this.updateStatusWithOptions(`Type of Agreement`, html);
    this.attachCardboxEvents(async (user_choice) => {

      if (user_choice === "end_turn") {
        this.endTurn();
        return;
      }

      menu[user_choice].fnct(this, faction1, faction2);
      return;
    });
  }






  playerOffer() {

    let his_self = this;
    let pfactions = this.returnPlayerFactions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < pfactions.length; i++) {
      html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Offer Agreement as which Faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.playerOfferAsFaction(faction);
    });

  }






  canPlayerEndWar(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  canPlayerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  canPlayerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  canPlayerIssueCards(his_self, f1, f2) {
    return 0;
  }

  canPlayerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  canPlayerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  canPlayerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }

  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  async playerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  async playerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  async playerIssueCards(his_self, f1, f2) {
    return 0;
  }

  async playerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  async playerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  async playerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }










  isPlayerControlledFaction(faction="") {
    if (faction === "") { return false; }
    if (this.isAlliedMinorPower(faction)) { return true; }
    if (this.isMajorPower(faction)) { return true; }
    return false;
  }

  returnFactionAdminRating(faction="") {
    if (this.factions[faction]) {
      return this.factions[faction].returnAdminRating();
    }
    return 0;
  }
 
  returnFactionName(f) {
    if (this.factions[f]) {
      return this.factions[f].name;
    }
    return "Unknown";
  }

  importFaction(name, obj) {

    if (obj.id == null)                 { obj.id = "faction"; }
    if (obj.name == null)               { obj.name = "Unknown Faction"; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.key == null)	        { obj.key = name; }
    if (obj.ruler == null)		{ obj.ruler = ""; }
    if (obj.capitals == null)	        { obj.capitals = []; }
    if (obj.admin_rating == null)	{ obj.admin_rating = 0; } // cards "holdable"
    if (obj.cards_bonus == null)	{ obj.cards_bonus = 0; }
    if (obj.vp == null)			{ obj.vp = 0; }
    if (obj.vp_base == null)		{ obj.vp_base = 0; }
    if (obj.vp_special == null)		{ obj.vp_special = 0; }
    if (obj.vp_bonus == null)		{ obj.vp_bonus = 0; }
    if (obj.allies == null)		{ obj.allies = []; }
    if (obj.minor_allies == null)	{ obj.minor_allies = []; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.passed == null)		{ obj.passed = false; }
    if (obj.calculateBaseVictoryPoints == null) {
      obj.calculateBaseVictoryPoints = function() { return 0; }
    }
    if (obj.calculateBonusVictoryPoints == null) {
      obj.calculateBonusVictoryPoints = function() { return 0; }
    }
    if (obj.returnAdminRating == null) {
      obj.returnAdminRating = function() { return this.admin_rating; }
    }
    if (obj.calculateSpecialVictoryPoints == null) {
      obj.calculateSpecialVictoryPoints = function() { return 0; }
    }
    if (obj.returnFactionSheet == null) {
      obj.returnFactionSheet = function(faction) {
        return `
	  <div class="faction_sheet" id="faction_sheet" style="background-image: url('/his/img/factions/${obj.img}')">
	  </div>
	`;
      }
    }
    if (obj.returnCardsDealt == null) {
      obj.returnCardsDealt = function(faction) {
	return 1;
      }
    }

    obj = this.addEvents(obj);
    this.factions[obj.key] = obj;

  }

  gainVictoryPoints(faction, points, type="special") {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
	  if (type == "base") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_base += points;
	  }
	  if (type == "special") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_special += points;
	  }
	  if (type == "bonus") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_bonus += points;
	  }
	  break;
        }
      }
    }
    return -1;
  }

  returnCapitals(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
          return this.factions[this.game.state.players_info[i].factions[ii]].capitals;
        }
      }
    }
    return [];
  }

  returnFactionHandIdx(player, faction) {
    for (let i = 0; i < this.game.state.players_info[player-1].factions.length; i++) {
      if (this.game.state.players_info[player-1].factions[i] === faction) {
	return i;
      }
    }
    return -1;
  }




  /* override default */
  updateStatus(str, force = 0) {

    this.updateControls("");

    try {

      this.game.status = str;
      if (!this.browser_active) { return; }

      if (this.useHUD) {
        this.hud.updateStatus(str);
      }

      document.querySelectorAll(".status").forEach((el) => {
        el.innerHTML = str;
      });
      if (document.getElementById("status")) {
        document.getElementById("status").innerHTML = str;
      }

    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  } 





  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.active == null)		{ obj.active = 0; } // if bonus is active for debaters
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)             { obj.loaned = false; }
    if (obj.key == null)                { obj.key = name; }
    if (obj.locked == null)		{ obj.locked = false; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => { return ""; }
    }

    this.addEvents(obj);
    this.units[name] = obj;

  }

  newUnit(faction, type) {
    for (let key in this.units) {
      if (this.units[key].type === type) {
        let new_unit = JSON.parse(JSON.stringify(this.units[key]));
        new_unit.owner = faction;
        return new_unit;
      }
    }
    return null;
  }

  importArmyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.army[name] = obj;
  }

  importNavyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.navy[name] = obj;
  }

  importWife(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.wives[name] = obj;
  }

  importReformer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = true; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.reformers[name] = obj;
  }

  importDebater(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = true; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.power == null)		{ obj.power = 0; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => {
        let tile_f = "/his/img/tiles/debaters/" + obj.img;
        let tile_b = tile_f.replace('.svg', '_back.svg');
	return `
	  <div class="debater-card" id="${obj.key}" style="background-image: url('${tile_f}'); background-size: cover"></div>	
	`;
      }
    }

console.log(` importing ${name} with power ${obj.power}`);

    this.addEvents(obj);
    this.debaters[name] = obj;
  }

  importExplorer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.explorers[name] = obj;
  }

  importConquistador(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    this.addEvents(obj);
    this.conquistadors[name] = obj;
  }

  addArmyLeader(faction, space, leader) {

    if (!this.army[leader]) {
      console.log("ARMY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.army[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }


  addNavyLeader(faction, space, leader) {

    if (!this.navy[leader]) {
      console.log("NAVY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    space.units[faction].push(this.navy[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }


  addReformer(faction, space, reformer) {
    if (!this.reformers[reformer]) {
      console.log("REFORMER: " + reformer + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.reformers[reformer]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }

  addWife(faction, wife) {

    if (!this.wives[wife]) {
      console.log("WIFE: " + wife + " not found");
      return;
    }

    this.game.state.wives.push(this.wives[wife]);
    this.game.state.wives[this.game.state.wives.length-1].owner = faction; 

  }

  addDebater(faction, debater) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    this.game.state.debaters.push(this.debaters[debater]);
    this.game.state.debaters[this.game.state.debaters.length-1].owner = faction; 
    this.game.state.debaters[this.game.state.debaters.length-1].committed = 0; 

  }

  addExplorer(faction, explorer) {

    if (!this.explorers[explorer]) {
      console.log("EXPLORER: " + explorer + " not found");
      return;
    }

    this.game.state.explorers.push(this.explorers[explorer]);
  }

  addConquistador(faction, conquistador) {

    if (!this.conquistadors[conquistador]) {
      console.log("CONQUISTADOR: " + conquistador + " not found");
      return;
    }

    this.game.state.conquistador.push(this.conquistadors[conquistador]);

  }

  isActive(debater) { return this.isDebaterActive(debater); }
  isDebaterActive(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].active == 1) { return 1; }
      }
    }
    return 0;
  }
  isCommitted(debater) { return this.isDebaterCommitted(debater); }
  isDebaterCommitted(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 1) { return 1; }
      }
    }
    return 0;
  }

  isDebaterAvailable(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 0) { return 1; }
      }
    }
    return 0;
  }

  deactivateDebater(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {
        this.game.state.debaters[i].active = 0;
      }
    }
  }
  deactivateDebaters() {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      this.game.state.debaters[i].active = 0;
    }
  }

  commitDebater(faction, debater, activate=1) {
    let his_self = this;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	this.game.state.debaters[i].committed = 1;
	this.game.state.debaters[i].active = activate; // if the bonus is active
	this.debaters[debater].onCommitted(his_self, this.game.state.debaters[i].owner);
      }
    }
  }

  commitExplorer(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].key == explorer) {
	this.game.state.explorer[i].committed = 1;
	this.explorers[explorer].onCommitted(his_self, this.game.state.explorers[i].owner);
      }
    }
  }

  commitConquistador(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      if (this.game.state.conquistadors[i].key == explorer) {
	this.game.state.conquistadors[i].committed = 1;
	this.conquistadors[conquistador].onCommitted(his_self, this.game.state.conquistadors[i].owner);
      }
    }
  }




  displayDebaters() {
    this.debaters_overlay.render();
  }

  displayExplorers() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      html += `	<div class="personage_tile${i}" data-id="${this.game.state.explorers[i].img}" style="background-image:url('/his/img/tiles/explorers/${this.game.state.explorers[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.explorers.length; i++) {
      let tile_f = "/his/img/tiles/explorers/" + this.game.state.explorers[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.explorers[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }

  }

  displayConquistadors() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      html += `	<div class="personage_tile personage_tile${i}" data-id="${this.game.state.conquistadors[i].img}" style="background-image:url('/his/img/tiles/conquistadors/${this.game.state.conquistadors[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      let tile_f = "/his/img/tiles/conquistadors/" + this.game.state.conquistadors[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.conquistadors[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebater(debater, attacker=true) {

    let tile_f = "/his/img/tiles/debaters/" + this.debaters[debater].img;
    let tile_b = tile_f.replace('.svg', '_back.svg');

    if (attacker) {
      $('.attacker_debater').css('background-image', `url('${tile_f}')`);
      $('.attacker_debater').mouseover(function() { 
	$('.attacker_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.attacker_debater').css('background-image', `url('${tile_f}')`);
      });
    } else {
      $('.defender_debater').css('background-image', `url('${tile_f}')`);
      $('.defender_debater').mouseover(function() { 
	$('.defender_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.defender_debater').css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebate(res) {
    this.debate_overlay.render(res);
  }


  displayReligiousConflictSheet() {

    let num_protestant_spaces = 0;
    let rcc = this.returnReligiousConflictChart();
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }
    let cid = "s" + num_protestant_spaces;

    let html = `
      <div class="religious_conflict_sheet" id="religious_conflict_sheet" style="background-image: url('/his/img/reference/religious.jpg')">
	<div class="religious_conflict_sheet_tile" id="religious_conflict_sheet_tile"></div>
	<div class="papal_debaters"></div>
	<div class="lutheran_debaters"></div>
	<div class="calvinist_debaters"></div>
	<div class="anglican_debaters"></div>
	<div class="protestant_debaters"></div>
      </div>
    `;

    this.overlay.showOverlay(html);

    //
    // list all debaters
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let dtile = `<img class="debater_tile" id="${i}" src="/his/img/tiles/debaters/${d.img}" />`;
      if (d.owner === "papacy") {
	this.app.browser.addElementToSelector(dtile, '.papal_debaters');
      }
      if (d.owner === "england") {
	this.app.browser.addElementToSelector(dtile, '.anglican_debaters');
      }
      if (d.owner === "hapsburg") {
	this.app.browser.addElementToSelector(dtile, '.calvinist_debaters');
      }
      if (d.owner === "protestant") {
	this.app.browser.addElementToSelector(dtile, '.protestant_debaters');
      }
    }

    let obj = document.getElementById("religious_conflict_sheet_tile");
    obj.style.top = rcc[cid].top;
    obj.style.left = rcc[cid].left;

  }

  returnProtestantSpacesTrackVictoryPoints() {

    let num_protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }

    let x = [];
    for (let i = 0; i < 51; i++) { 

      x[i] = {}; x[i].protestant = 0; x[i].papacy = 15;

      if (i >= 4) { x[i].protestant++; x[i].papacy--; }
      if (i >= 7) { x[i].protestant++; x[i].papacy--; }
      if (i >= 10) { x[i].protestant++; x[i].papacy--; }
      if (i >= 14) { x[i].protestant++; x[i].papacy--; }
      if (i >= 17) { x[i].protestant++; x[i].papacy--; }
      if (i >= 20) { x[i].protestant++; x[i].papacy--; }
      if (i >= 24) { x[i].protestant++; x[i].papacy--; }
      if (i >= 27) { x[i].protestant++; x[i].papacy--; }
      if (i >= 30) { x[i].protestant++; x[i].papacy--; }
      if (i >= 34) { x[i].protestant++; x[i].papacy--; }
      if (i >= 37) { x[i].protestant++; x[i].papacy--; }
      if (i >= 40) { x[i].protestant++; x[i].papacy--; }
      if (i >= 44) { x[i].protestant++; x[i].papacy--; }
      if (i >= 47) { x[i].protestant++; x[i].papacy--; }
      if (i >= 50) { x[i].protestant+=100; x[i].papacy--; }
    }

    return x[num_protestant_spaces];

  }


  displayFactionSheet(faction) {
    this.faction_overlay.render(faction);
  }

  returnFactionSheetKeys() {
  }

  displayBoard() {
    try {
      this.displayColony();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayConquest();
    } catch (err) {
      console.log("error displaying conquest... " + err);
    }
    try {
      this.displayElectorateDisplay();
    } catch (err) {
      console.log("error displaying electorates... " + err);
    }
    try {
      this.displayNewWorld();
    } catch (err) {
      console.log("error displaying new world... " + err);
    }
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
    try {
      this.displayNavalSpaces();
    } catch (err) {
      console.log("error displaying naval spaces... " + err);
    }
    try {
      this.displayVictoryTrack();
    } catch (err) {
      console.log("error displaying victory track... " + err);
    }
  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpaceDetailedView(name) {
    // function is attached to this.spaces not this.game.spaces
    let html = this.spaces[name].returnView();    
    this.overlay.show(html);
  }

  displayElectorateDisplay() {
    let elecs = this.returnElectorateDisplay();
    for (let key in elecs) {
      let obj = document.getElementById(`ed_${key}`);
      let tile = this.returnSpaceTile(this.game.spaces[key]);
      obj.innerHTML = ` <img class="hextile" src="${tile}" />`;      
      if (this.returnElectoralBonus(key)) {
        obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-${this.returnElectoralBonus(key)}.svg" />`;
      }
    }
  }


  // returns 1 if the bonus for controlling is still outstanding
  returnElectoralBonus(space) {

    if (space === "augsburg" && this.game.state.augsburg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "mainz" && this.game.state.augsburg_electoral_bonus == 0) {
      return 1;
    }
    if (space === "trier" && this.game.state.trier_electoral_bonus == 0) {
      return 1;
    }
    if (space === "cologne" && this.game.state.cologne_electoral_bonus == 0) {
      return 1;
    }
    if (space === "wittenberg" && this.game.state.wittenberg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "brandenburg" && this.game.state.brandenburg_electoral_bonus == 0) {
      return 1;
    }

    return 0;

  }

  returnSpaceTile(space) {

    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";
    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    if (owner != "") {
      if (owner === "hapsburg") {
        tile = "/his/img/tiles/hapsburg/";	  
        if (space.religion === "protestant") {
          tile += `Hapsburg_${stype}_back.svg`;
        } else {
          tile += `Hapsburg_${stype}.svg`;
        }
      }
      if (owner === "england") {
        tile = "/his/img/tiles/england/";	  
        if (space.religion === "protestant") {
          tile += `England_${stype}_back.svg`;
        } else {
          tile += `England_${stype}.svg`;
        }
      }
      if (owner === "france") {
        tile = "/his/img/tiles/france/";	  
        if (space.religion === "protestant") {
          tile += `France_${stype}_back.svg`;
        } else {
          tile += `France_${stype}.svg`;
        }
      }
      if (owner === "papacy") {
        tile = "/his/img/tiles/papacy/";	  
        if (space.religion === "protestant") {
          tile += `Papacy_${stype}_back.svg`;
	} else {
	  tile += `Papacy_${stype}.svg`;
	}
      }
      if (owner === "protestant") {
        tile = "/his/img/tiles/protestant/";	  
        if (space.religion === "protestant") {
          tile += `Protestant_${stype}_back.svg`;
        } else {
          tile += `Protestant_${stype}.svg`;
        }
      }
      if (owner === "ottoman") {
        tile = "/his/img/tiles/ottoman/";	  
        if (space.religion === "protestant") {
          tile += `Ottoman_${stype}_back.svg`;
        } else {
          tile += `Ottoman_${stype}.svg`;
        }
      }
      if (owner === "independent") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "hungary") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "scotland") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "venice") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "genoa") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
    }

    return tile;

  }

  returnNavies(space) {

    let html = '<div class="space_navy" id="">';
    let tile = "";

    for (let z in space.units) {

      let squadrons = 0;
      let corsairs = 0;

      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "squadron") {
	  squadrons += 2;
	}
	if (space.units[z][zz].type === "corsair") {
	  corsairs += 1;
	}
      }

      while (squadrons >= 2) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (squadrons >= 2) {
            tile += `Hapsburg_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (squadrons >= 2) {
            tile += `English_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (squadrons >= 2) {
            tile += `French_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
	  if (squadrons >= 2) {
            tile += `Papacy_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (squadrons >= 2) {
            tile += `Ottoman_squadron.svg`;
	    squadrons -= 2;
          }
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (squadrons >= 2) {
            tile += `Venice_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (squadrons >= 2) {
            tile += `Genoa_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (squadrons >= 2) {
            tile += `Scottish_squadron.svg`;
	    squadrons -= 2;
          }
        }

        html += `<img class="navy_tile" src="${tile}" />`;
      }

 
      while (corsairs >= 1) {
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        html += `<img class="navy_tile" src="${tile}" />`;
      }
 
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnArmies(space) {

    let html = '<div class="space_army" id="">';

    let tile = "";

    for (let z in space.units) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "regular") {
	  army++;
	}
      }

      while (army >= 1) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (army >= 4) {
            tile += `HapsburgReg-4.svg`;
	    army -= 4;
	  } else {
	    if (army >= 2) {
              tile += `HapsburgReg-2.svg`;
	      army -= 2;
	    } else {
	      if (army >= 1) {
                tile += `HapsburgReg-1.svg`;
	        army -= 1;
	      }
	    }
          }
	}
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (army >= 4) {
            tile += `EnglandReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `EnglandReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `EnglandReg-1.svg`;
	        army -= 1;
              }
            }
	  }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (army >= 4) {
            tile += `FrenchReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `FrenchReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `FrenchReg-1.svg`;
	        army -= 1;
              }
	    }
	  }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
          if (army >= 4) {
            tile += `PapacyReg-4.svg`;
            army -= 4;
          } else {
	    if (army >= 2) {
              tile += `PapacyReg-2.svg`;
	      army -= 2;
	    } else {
	      if (army >= 1) {
                tile += `PapacyReg-1.svg`;
	        army -= 1;
	      }
	    }
	  }
        }
        if (z === "protestant") {
          tile = "/his/img/tiles/protestant/";	  
	  if (army >= 4) {
            tile += `ProtestantReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `ProtestantReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `ProtestantReg-1.svg`;
	        army -= 1;
              }
	    }
          }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (army >= 4) {
            tile += `OttomanReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `OttomanReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `OttomanReg-1.svg`;
	        army -= 1;
              }
            }
          }
        }
        if (z === "independent") {
          tile = "/his/img/tiles/independent/";	  
	  if (army >= 2) {
            tile += `IndependentReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `IndependentReg-1.svg`;
	      army -= 1;
            } 
	  }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (army >= 2) {
            tile += `VeniceReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `VeniceReg-1.svg`;
	      army -= 1;
            }
	  }
        }
        if (z === "hungary") {
          tile = "/his/img/tiles/hungary/";	  
	  if (army >= 4) {
            tile += `HungaryReg-4.svg`;
	    army -= 4;
          } else {
	    if (army >= 2) {
              tile += `HungaryReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `HungaryReg-1.svg`;
	        army -= 1;
              }
            }
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (army >= 2) {
            tile += `GenoaReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `GenoaReg-1.svg`;
	      army -= 1;
            }
          }
        }
        if (z === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (army >= 2) {
            tile += `ScottishReg-2.svg`;
	    army -= 2;
          } else {
	    if (army >= 1) {
              tile += `ScottishReg-1.svg`;
	      army -= 1;
            }
          } 
        }
      }

      if (tile !== "") {
        html += `<img class="army_tile" src="${tile}" />`;
      } 

    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }


  returnMercenaries(space) {

    let html = '<div class="space_mercenaries" id="">';
    let tile = "";

    for (let z in space.units) {

      let army = 0;
      for (let zz = 0; zz < space.units[z].length; zz++) {
        if (space.units[z][zz].type === "mercenary") {
          army++;
        }
      }

      for (let i = 0; i < army; i+= 2) {
        if (z != "") {
          if (z === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `HapsburgMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `HapsburgMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (z === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `EnglandMerc-2.svg`;
	      army -= 4;
            }
	    if (army >= 1) {
              tile += `EnglandMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `FrenchMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `FrenchMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
	    if (army >= 4) {
              tile += `PapacyMerc-4.svg`;
	      army -= 4;
	    }
	    if (army >= 2) {
              tile += `PapacyMerc-2.svg`;
	      army -= 2;
	    }
	    if (army >= 1) {
              tile += `PapacyMerc-1.svg`;
	      army -= 1;
	    }
          }
          if (z === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `ProtestantMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `ProtestantMerc-1.svg`;
	      army -= 1;
            }
          }
          if (z === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanMerc-4.svg`;
	      army -= 4;
            }
	    if (army >= 2) {
              tile += `OttomanMerc-2.svg`;
	      army -= 2;
            }
	    if (army >= 1) {
              tile += `OttomanMerc-1.svg`;
	      army -= 1;
            }
          }
        }
        html += `<img class="mercenary_tile" src="${tile}" />`;
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnPersonages(space) {

    let html = '<div class="figures_tile" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z in space.units) {
      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].debater === true) {
          html += `<img src="/his/img/tiles/debater/${space.units[z][zz].img}" />`;
	  tile = html;
	}
	if (space.units[z][zz].personage === true) {
          html += `<img src="/his/img/tiles/personages/${space.units[z][zz].img}" />`;
	  tile = html;
	}
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  displaySpace(key) {

    if (!this.game.spaces[key]) { return; }

    let space = this.game.spaces[key];
    let tile = this.returnSpaceTile(space);

    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //
    if (space.political == space.home) { show_tile = 0; }
    if (space.political === "") { show_tile = 0; }

    //
    // and force for keys
    //
    if (space.home === "" && space.political !== "") { show_tile = 1; }
    if (space.type === "key") { show_tile = 1; }

    //
    // and force if has units
    //
    for (let key in space.units) {
      if (space.units[key].length > 0) {
	show_tile = 1; 
      }
    }

    //
    // sanity check
    //
    if (tile === "") { show_tile = 0; }

    let t = "."+key;
    document.querySelectorAll(t).forEach((obj) => {

      obj.innerHTML = "";

      if (show_tile === 1) {
        obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
        obj.innerHTML += this.returnArmies(space);
        obj.innerHTML += this.returnNavies(space);
        obj.innerHTML += this.returnMercenaries(space);
        obj.innerHTML += this.returnPersonages(space);
      }

      if (this.isSpaceInUnrest(space)) {
        obj.innerHTML += `<img class="unrest" src="/his/img/tiles/unrest.svg" />`;
      }
      if (this.isSpaceBesieged(space)) {
alert("SPACE IS BESIEGED: " + space.key);
        obj.innerHTML += `<img class="seige" src="/his/img/tiles/seige.png" />`;
      }

    });

  }

  displayNavalSpace(key) {

    if (!this.game.navalspaces[key]) { return; }

    let obj = document.getElementById(key);
    let space = this.game.navalspaces[key];

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //

    if (show_tile === 1) {
      obj.innerHTML += this.returnNavies(space);
      obj.innerHTML += this.returnPersonages(space);
    }

  }

  displayNavalSpaces() {

    //
    // add tiles
    //
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key]) {
	this.displayNavalSpace(key);
        document.getElementById(key).onclick = (e) => {
	  this.displayNavalSpaceDetailedView(key);
        }
      }
    }

  }

  displaySpaces() {

    let his_self = this;


    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
        document.getElementById(key).onclick = (e) => {
	  this.displaySpaceDetailedView(key);
        }
      }
    }

    let xpos = 0;
    let ypos = 0;

if (!his_self.bound_gameboard_zoom) {

    $('.gameboard').on('mousedown', function (e) {
      if (e.currentTarget.classList.contains("space")) { return; }
      xpos = e.clientX;
      ypos = e.clientY;
    });
    $('.gameboard').on('mouseup', function (e) { 
      if (e.currentTarget.classList.contains("space")) { return; }
      if (Math.abs(xpos-e.clientX) > 4) { return; }
      if (Math.abs(ypos-e.clientY) > 4) { return; }
      his_self.theses_overlay.renderAtCoordinates(xpos, ypos);
    });

    his_self.bound_gameboard_zoom = 1;

}


  }


  displayVictoryTrack() {

    let factions_and_scores = this.calculateVictoryPoints();

    let x = this.returnVictoryPointTrack();

    for (f in factions_and_scores) {
      let total_vp = factions_and_scores[f].vp;
      let ftile = f + "_vp_tile";
      obj = document.getElementById(ftile);
      obj.style.left = x[total_vp.toString()].left + "px";
      obj.style.top = x[total_vp.toString()].top + "px";
      obj.style.display = "block";
    }

  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" />`;
    }

    //
    //
    //
    if (this.debaters[cardname]) { return this.debaters[cardname].returnCardImage(); }

    for (let i = 0; i < this.game.deck.length; i++) {
      var c = this.game.deck[i].cards[cardname];
      if (c == undefined) { c = this.game.deck[i].discards[cardname]; }
      if (c == undefined) { c = this.game.deck[i].removed[cardname]; }
      if (c !== undefined) { 
	deckidx = i;
        card = c;
      }
    }


    if (deckidx === -1) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;
    }

    var html = `<img class="${cardclass}" src="/his/img/${card.img}" />`;

    //
    // add cancel button to uneventable cards
    //
    if (deckidx == 0) { 
      if (!this.deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }

    return html

  }


  displayDebaterPopup(debater) {
    
  }


  addCard(faction, card) {

    let p = this.returnPlayerOfFaction(faction);
    if (p) {

console.log("PLAYER OF FACTION: " + faction);
console.log(p);
 
      for (let z = 0; z < this.game.state.players_info[p-1].factions.length; z++) {
	if (this.game.state.players_info[p-1].factions[z] == faction) {
console.log("FACTION IS FHAND: " + z);
	  if (this.game.player == p) {
console.log("DECK FHAND IS: " + JSON.stringify(this.game.deck[0].fhand));
  	    this.game.deck[0].fhand[z].push(card);
	  }
	}
      }
     
    }
  }



} // end and export

module.exports = HereIStand;


