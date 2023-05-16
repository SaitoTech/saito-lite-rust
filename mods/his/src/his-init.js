const GameTemplate = require('../../lib/templates/gametemplate');
const DebateOverlay = require('./lib/ui/overlays/debate');
const TreatiseOverlay = require('./lib/ui/overlays/treatise');
const FactionOverlay = require('./lib/ui/overlays/faction');
const ReligiousOverlay = require('./lib/ui/overlays/religious');
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


