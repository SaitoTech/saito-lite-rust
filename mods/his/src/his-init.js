const GameTemplate = require('../../lib/templates/gametemplate');
const DebateOverlay = require('./lib/ui/overlays/debate');
const ChateauxOverlay = require('./lib/ui/overlays/chateaux');
const MarriageOverlay = require('./lib/ui/overlays/marriage');
const PiracyOverlay = require('./lib/ui/overlays/piracy');
const VPOverlay = require('./lib/ui/overlays/vp');
const NewWorldOverlay = require('./lib/ui/overlays/newworld');
const TreatiseOverlay = require('./lib/ui/overlays/treatise');
const FactionOverlay = require('./lib/ui/overlays/faction');
const FactionBar = require('./lib/ui/factionbar');
const ReligiousOverlay = require('./lib/ui/overlays/religious');
const CouncilOfTrentOverlay = require('./lib/ui/overlays/council-of-trent');
const ReformationOverlay = require('./lib/ui/overlays/reformation');
// diplomacy overlay is new
const DiplomacyOverlay = require('./lib/ui/overlays/diplomacy');
const DiplomacyConfirmOverlay = require('./lib/ui/overlays/diplomacy-confirm');
const DiplomacyProposeOverlay = require('./lib/ui/overlays/diplomacy-propose');
const AvailableUnitsOverlay = require('./lib/ui/overlays/available-units');
const FortificationOverlay = require('./lib/ui/overlays/fortification');
const SpringDeploymentOverlay = require('./lib/ui/overlays/spring-deployment');
const BuildOverlay = require('./lib/ui/overlays/build');
const NavalMovementOverlay = require('./lib/ui/overlays/naval-movement');
const MovementOverlay = require('./lib/ui/overlays/movement');
const DietOfWormsOverlay = require('./lib/ui/overlays/diet-of-worms');
const FieldBattleOverlay = require('./lib/ui/overlays/field-battle');
const NavalBattleOverlay = require('./lib/ui/overlays/naval-battle');
const SchmalkaldicOverlay = require('./lib/ui/overlays/schmalkaldic');
const AssaultOverlay = require('./lib/ui/overlays/siege');
const ThesesOverlay = require('./lib/ui/overlays/theses');
const DebatersOverlay = require('./lib/ui/overlays/debaters');
const ExplorersOverlay = require('./lib/ui/overlays/explorers');
const ConquistadorsOverlay = require('./lib/ui/overlays/conquistadors');
const UnitsOverlay = require('./lib/ui/overlays/units');
const WarOverlay = require('./lib/ui/overlays/war');
const WelcomeOverlay = require('./lib/ui/overlays/welcome');
const HudPopup = require('./lib/ui/hud-popup');
const WinterOverlay = require('./lib/ui/overlays/winter');
const DeckOverlay = require('./lib/ui/overlays/deck');
const MenuOverlay = require('./lib/ui/overlays/menu');
const LanguageZoneOverlay = require('./lib/ui/overlays/language-zone');

// Tutorial Overlays
const GameHelp = require('./lib/ui/game-help/game-help');
const TutorialTemplate = require('./lib/ui/overlays/tutorials/tutorial.template');

const HISRules = require('./lib/core/rules.template');
const HISOptions = require('./lib/core/advanced-options.template');
const HISingularOption = require('./lib/core/options.template');
const htmlTemplate = require('./lib/core/game-html.template');

const JSON = require('json-bigint');

  //
  // used in counter_or_acknowledge
  //
  var counter_or_acknowledge_inactivity_timeout = null;
  var true_if_counter_or_acknowledge_cleared = false;



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
    this.factionbar = new FactionBar(this.app, this); // shows you which factions you are in multiplayer
    this.diet_of_worms_overlay = new DietOfWormsOverlay(this.app, this);  // diet of worms
    this.diplomacy_overlay = new DiplomacyOverlay(this.app, this);
    this.diplomacy_confirm_overlay = new DiplomacyConfirmOverlay(this.app, this);
    //this.diplomacy_propose_overlay = new DiplomacyProposeOverlay(this.app, this);
    this.council_of_trent_overlay = new CouncilOfTrentOverlay(this.app, this);  // council of trent
    this.chateaux_overlay = new ChateauxOverlay(this.app, this);  // build some fucking chateaux
    this.marriage_overlay = new MarriageOverlay(this.app, this);  // marry, divorce, repeat
    this.piracy_overlay = new PiracyOverlay(this.app, this);  // rape and pillage but mostly steal
    this.vp_overlay = new VPOverlay(this.app, this);  // end-of-turn points overlay
    this.newworld_overlay = new NewWorldOverlay(this.app, this);
    this.theses_overlay = new ThesesOverlay(this.app, this);  // 95 theses
    this.reformation_overlay = new ReformationOverlay(this.app, this);  // reformations and counter-reformations
    this.language_zone_overlay = new LanguageZoneOverlay(this.app, this);  // language zone selection
    this.debaters_overlay = new DebatersOverlay(this.app, this); 
    this.explorers_overlay = new ExplorersOverlay(this.app, this);
    this.conquistadors_overlay = new ConquistadorsOverlay(this.app, this);
    this.schmalkaldic_overlay = new SchmalkaldicOverlay(this.app, this);  // schmalkaldic league
    this.hud_popup = new HudPopup(this.app, this);  // hud popup
    this.assault_overlay = new AssaultOverlay(this.app, this);  // siege
    this.naval_battle_overlay = new NavalBattleOverlay(this.app, this);  // naval battles
    this.field_battle_overlay = new FieldBattleOverlay(this.app, this);  // field battles
    this.spring_deployment_overlay = new SpringDeploymentOverlay(this.app, this);  // spring deployment
    this.build_overlay = new BuildOverlay(this.app, this);  // unit building
    this.available_units_overlay = new AvailableUnitsOverlay(this.app, this);  // unit movement
    this.movement_overlay = new MovementOverlay(this.app, this);  // unit movement
    this.fortification_overlay = new FortificationOverlay(this.app, this);  // unit movement
    this.welcome_overlay = new WelcomeOverlay(this.app, this);  // hello world
    this.naval_movement_overlay = new NavalMovementOverlay(this.app, this);  // overlay to move ships
    this.deck_overlay = new DeckOverlay(this.app, this);  // overlay to show cards
    this.menu_overlay = new MenuOverlay(this.app, this);  // players doing stuff
    this.winter_overlay = new WinterOverlay(this.app, this);
    this.units_overlay = new UnitsOverlay(this.app, this);
    this.war_overlay = new WarOverlay(this.app, this);

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
    this.faster_play = 1; // this speeds-up some responses at the cost of potentially
			  // leaking information on what response cards users have or
			  // do not have.

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
      if (this.app.options.gameprefs.his_expert_mode) {
        if (this.app.options.gameprefs.his_expert_mode == 1) {
          this.confirm_moves = 0;
        } else {
          this.confirm_moves = 1;
        }
      }
      if (this.app.options.gameprefs.his_faster_play) {
	if (this.app.options.gameprefs.his_faster_play !== 1) {
          this.faster_play = 0;
        } else {
          this.faster_play = 1;
        }
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

    this.deck = this.returnDeck(true);
    this.diplomatic_deck = this.returnDiplomaticDeck();


