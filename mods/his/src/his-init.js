const GameTemplate = require('../../lib/templates/gametemplate');
const DebateOverlay = require('./lib/ui/overlays/debate');
const ChateauxOverlay = require('./lib/ui/overlays/chateaux');
const VPOverlay = require('./lib/ui/overlays/vp');
const NewWorldOverlay = require('./lib/ui/overlays/newworld');
const TreatiseOverlay = require('./lib/ui/overlays/treatise');
const FactionOverlay = require('./lib/ui/overlays/faction');
const ReligiousOverlay = require('./lib/ui/overlays/religious');
const CouncilOfTrentOverlay = require('./lib/ui/overlays/council-of-trent');
const ReformationOverlay = require('./lib/ui/overlays/reformation');
const MovementOverlay = require('./lib/ui/overlays/movement');
const DietOfWormsOverlay = require('./lib/ui/overlays/diet-of-worms');
const FieldBattleOverlay = require('./lib/ui/overlays/field-battle');
const NavalBattleOverlay = require('./lib/ui/overlays/naval-battle');
const SchmalkaldicOverlay = require('./lib/ui/overlays/schmalkaldic');
const AssaultOverlay = require('./lib/ui/overlays/siege');
const ThesesOverlay = require('./lib/ui/overlays/theses');
const DebatersOverlay = require('./lib/ui/overlays/debaters');
const UnitsOverlay = require('./lib/ui/overlays/units');
const WelcomeOverlay = require('./lib/ui/overlays/welcome');
const WinterOverlay = require('./lib/ui/overlays/winter');
const DeckOverlay = require('./lib/ui/overlays/deck');
const MenuOverlay = require('./lib/ui/overlays/menu');
const LanguageZoneOverlay = require('./lib/ui/overlays/language-zone');

// Tutorial Overlays
const TutorialTemplate = require('./lib/ui/overlays/tutorials/tutorial.template');


const GameHelp = require('./../../lib/saito/ui/game-help/game-help');
const HISRules = require('./lib/core/rules.template');
const HISOptions = require('./lib/core/advanced-options.template');
const HISingularOption = require('./lib/core/options.template');

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
    this.publisher_message = `Here I Stand is published by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game. Support GMT Games: <a href="https://www.gmtgames.com/p-917-here-i-stand-500th-anniversary-reprint-edition-2nd-printing.aspx">purchase</a>`;
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
    this.chateaux_overlay = new ChateauxOverlay(this.app, this);  // build some fucking chateaux
    this.vp_overlay = new VPOverlay(this.app, this);  // end-of-turn points overlay
    this.newworld_overlay = new NewWorldOverlay(this.app, this);
    this.theses_overlay = new ThesesOverlay(this.app, this);  // 95 theses
    this.reformation_overlay = new ReformationOverlay(this.app, this);  // reformations and counter-reformations
    this.language_zone_overlay = new LanguageZoneOverlay(this.app, this);  // language zone selection
    this.debaters_overlay = new DebatersOverlay(this.app, this);  // language zone selection
    this.schmalkaldic_overlay = new SchmalkaldicOverlay(this.app, this);  // schmalkaldic league
    this.assault_overlay = new AssaultOverlay(this.app, this);  // siege
    this.naval_battle_overlay = new NavalBattleOverlay(this.app, this);  // naval battles
    this.field_battle_overlay = new FieldBattleOverlay(this.app, this);  // field battles
    this.movement_overlay = new MovementOverlay(this.app, this);  // unit movement
    this.welcome_overlay = new WelcomeOverlay(this.app, this);  // hello world
    this.deck_overlay = new DeckOverlay(this.app, this);  // overlay to show cards
    this.menu_overlay = new MenuOverlay(this.app, this);  // players doing stuff
    this.winter_overlay = new WinterOverlay(this.app, this);
    this.units_overlay = new UnitsOverlay(this.app, this);

    //
    // triangular help button
    //
    this.game_help = new GameHelp(this.app, this);

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
    // "showcard" popups
    //
    this.useCardbox = 1;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

  }


  returnSingularGameOption(){
    return HISSingularOption();
  }

  returnAdvancedOptions() {
    return HISOptions();
  }

  returnGameRulesHTML(){
    return HISRules();
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


