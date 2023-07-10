const GameTemplate = require("../../lib/templates/gametemplate");
const saito = require("../../lib/saito/saito");
const Board = require("./lib/ui/board");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {


	constructor(app) {
		super(app);

		this.app = app;
		this.name = "Realms";
		this.description = "Saito Realms is a card-driven magical battle game";
		this.categories 	 = "Games Cardgame Strategy Deckbuilding";
		this.card_img_dir = "/realms/img/cards";

		this.card_height_ratio = 1.39;

		this.minPlayers = 2;
		this.maxPlayers = 2;

		this.board = new Board(this.app, this);

		return this;
	}


	render(app) {

		super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption("game-game", "Game");
		this.menu.addMenuOption("game-info", "Info");
		this.menu.addChatMenu();
		this.menu.render(app, this);

		//
		// add card events -- text shown and callback run if there
		//
		this.cardbox.render(app, this);
		this.cardbox.skip_card_prompt = 0;
		this.cardbox.addCardType("showcard", "", null);
		this.cardbox.addCardType("card", "select", this.cardbox_callback);

		this.log.render(app, this);
		this.hud.render(app, this);

		this.render();

	}


