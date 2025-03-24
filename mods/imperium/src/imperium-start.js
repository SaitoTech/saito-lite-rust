const GameTemplate = require('../../lib/templates/gametemplate');
const htmlTemplate = require('./lib/core/game-html.template');
const JSON = require('json-bigint');
//const RulesOverlay = require('./lib/overlays/rules');
const FactionSheetOverlay = require('./lib/overlays/faction-sheet');
const StrategyCardOverlay = require('./lib/overlays/strategy-card');
const StrategyCardSelectionOverlay = require('./lib/overlays/strategy-card-selection');
const CombatOverlay = require('./lib/overlays/combat');
const HowToTradeOverlay = require('./lib/overlays/how-to-trade');
const HowToMoveOverlay = require('./lib/overlays/how-to-move');
const HowToProduceOverlay = require('./lib/overlays/how-to-produce');
const MovementOverlay = require('./lib/overlays/movement');
const TechTreeOverlay = require('./lib/overlays/tech-tree');
const FactionsOverlay = require('./lib/overlays/factions');
const SectorOverlay = require('./lib/overlays/sector');
const ProductionOverlay = require('./lib/overlays/production');
const UnitsOverlay = require('./lib/overlays/units');
const UpgradesOverlay = require('./lib/overlays/upgrades');
const ObjectivesOverlay = require('./lib/overlays/objectives');
const AgendasOverlay = require('./lib/overlays/agenda');
const AgendaSelectionOverlay = require('./lib/overlays/agenda-selection');
const AgendaVotingOverlay = require('./lib/overlays/agenda-voting');
const NewActionCardsOverlay = require('./lib/overlays/new-action-cards');
const ResourceSelectionOverlay = require('./lib/overlays/resource-selection');
const InfluenceSelectionOverlay = require('./lib/overlays/influence-selection');
const SenateOverlay = require('./lib/overlays/senate');
const SpaceCombatOverlay = require('./lib/overlays/space-combat');
const GroundCombatOverlay = require('./lib/overlays/ground-combat');
const BombardmentOverlay = require('./lib/overlays/bombardment');
const AntiFighterBarrageOverlay = require('./lib/overlays/anti-fighter-barrage');
const ZoomOverlay = require('./lib/overlays/zoom');
const UnitTemplate = require('./lib/unit.template');
const Unit = require('./lib/unit');
const FactionBar = require('./lib/factionbar');
const TokenBar = require('./lib/tokenbar');
const Dashboard = require('./lib/dashboard-manager');
const RoundBox = require('./lib/round');
const Leaderboard = require('./lib/leaderboard');
const Sector = require('./lib/sector');


class Imperium extends GameTemplate {
  
  constructor(app) {
  
    super(app);
  
    this.name             = "Imperium";
    this.gamename         = "Red Imperium";
    this.slug		  = "imperium";
    this.description      = `Red Imperium is a multi-player space exploration and conquest simulator. Each player controls a unique faction vying for political control of a galaxy in the waning days of a dying Empire.`;
    this.categories	  = "Games Boardgame Strategy";
    this.minPlayers       = 2;
    this.maxPlayers       = 6;

    this.boardWidth   = 1900;
  
    this.rmoves           = [];
    this.totalPlayers     = 2;

    //
    // components and overlays
    //
    //this.rules_overlay = new RulesOverlay(this.app, this);
    this.faction_sheet_overlay = new FactionSheetOverlay(this.app, this);
    this.zoom_overlay = new ZoomOverlay(this.app, this);
    this.strategy_card_selection_overlay = new StrategyCardSelectionOverlay(this.app, this);
    this.strategy_card_overlay = new StrategyCardOverlay(this.app, this);
    this.combat_overlay = new CombatOverlay(this.app, this);
    this.how_to_trade_overlay = new HowToTradeOverlay(this.app, this);
    this.how_to_move_overlay = new HowToMoveOverlay(this.app, this);
    this.how_to_produce_overlay = new HowToProduceOverlay(this.app, this);
    this.movement_overlay = new MovementOverlay(this.app, this);
    this.senate_overlay = new SenateOverlay(this.app, this);
    this.production_overlay = new ProductionOverlay(this.app, this);
    this.upgrades_overlay = new UpgradesOverlay(this.app, this);
    this.objectives_overlay = new ObjectivesOverlay(this.app, this);
    this.agendas_overlay = new AgendasOverlay(this.app, this);
    this.agenda_selection_overlay = new AgendaSelectionOverlay(this.app, this);
    this.agenda_voting_overlay = new AgendaVotingOverlay(this.app, this);
    this.new_action_cards_overlay = new NewActionCardsOverlay(this.app, this);
    this.units_overlay = new UnitsOverlay(this.app, this);
    this.sector_overlay = new SectorOverlay(this.app, this);
    this.tech_tree_overlay = new TechTreeOverlay(this.app, this);
    this.factions_overlay = new FactionsOverlay(this.app, this);
    this.resource_selection_overlay = new ResourceSelectionOverlay(this.app, this);
    this.influence_selection_overlay = new InfluenceSelectionOverlay(this.app, this);
    this.space_combat_overlay = new SpaceCombatOverlay(this.app, this);
    this.ground_combat_overlay = new GroundCombatOverlay(this.app, this);
    this.bombardment_overlay = new BombardmentOverlay(this.app, this);
    this.anti_fighter_barrage_overlay = new AntiFighterBarrageOverlay(this.app, this);
    this.dashboard = new Dashboard(this.app, this, ".dashboard");
    this.tokenbar = new TokenBar(this.app, this, ".hud-header");
    this.factionbar = new FactionBar(this.app, this, ".hud-header");
    this.roundbox = new RoundBox(this.app, this, "");
    this.leaderboard = new Leaderboard(this.app, this, "");

    //
    // specific to THIS game
    //
    this.game.board          = null;
    this.game.sectors        = null; 
    this.game.planets        = null;
    this.game.confirms_needed   = 0;
    this.game.confirms_received = 0;
    this.game.confirms_players  = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players  = [];
    
    //
    // not specific to THIS game, but get events 
    // attached to them so that there is always
    // the event functions available here.
    //
    this.factions       	= {};
    this.sectors           	= {}; // objs used to render
    this.tech           	= {};
    this.strategy_cards 	= {};
    this.action_cards 		= {};
    this.agenda_cards   	= {};
    this.secret_objectives     	= {};
    this.stage_i_objectives     = {};
    this.stage_ii_objectives    = {};
    this.units          	= {};
    this.promissary_notes	= {};

    this.hud.mode = 1;  // classic interface

    //
    // tutorial related
    //
    this.tutorial_move_clicked = 0;
    this.tutorial_produce_clicked = 0;

    //
    // game-related
    //
    this.assigns = [];  // floating units needing assignment to ships
    this.game.tracker = {};  // track options in turn
    this.activated_systems_player = 0;

    return this;
  
  }
  
  getPublicKey() { return this.publicKey; }

  //
  // this function is CLOSED in imperium-initialize
  //
  // the compile script should process all of the objects that need to
  // be added to the various trees, so that when this function is run
  // in the initializeGame function everything is added to the appropriate
  // tree and the functions are instantiated.
  //
  initializeGameObjects() {

    this.initialize_game_objects = 1;

