const OnePlayerGameTemplate = require('./../../lib/templates/oneplayer-gametemplate');
const SaitoManiaGameOptionsTemplate = require('./lib/saitomania-game-options.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoMania extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.name = 'SaitoMania';
		this.gamename = 'Saito Mania';
		this.slug = 'saitomania';
		this.description =
			'Blast shitcoins, pick up superpowers, destroy rocks to collect Saito and learn about the Saito project while playing ;)';
		this.categories = 'Games Arcadegame One-player';
		this.request_no_interrupts = true; // don't popup chat
		this.app = app;
		this.statistical_unit = 'game';
	}

	// Create an exp league by default
	respondTo(type) {
		if (type == 'default-league') {
			let obj = super.respondTo(type);
			obj.ranking_algorithm = 'HSC';
			return obj;
		}
		return super.respondTo(type);
	}

	initializeGame(game_id) {
		if (!this.game.state) {
			console.log('******Generating the Game******');
			this.game.queue = [];
			this.game.queue.push('play');
			this.game.queue.push('READY');

			this.game.state = {
				scores: [],
				lifetime: {
					round: 0,
					high_score: 0
				}
			};

			if (this.loadGamePreference(this.name + '_stats')) {
				this.game.state.lifetime = this.loadGamePreference(
					this.name + '_stats'
				);
			}
		}

		console.log(JSON.parse(JSON.stringify(this.game)));
	}

	async render(app) {
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}

		//
		// leaving here as an example of how we can parse game.options
		// on game load, and incorporate the variables in the init
		// sequence -- in this case splitting to different versions of
		// the binary depending on system framerate support.
		//
		//let framerate = this.game.options.framerate;
		//let framerate = "60fps";
		//if (framerate === "60fps") {
		//  if (window.location.toString().indexOf("60fps") == -1) {
		//	window.location = "/saitomania/60fps/index.html";
		//	return;
		//  }
		//}
		//if (framerate === "30fps") {
		//  if (window.location.toString().indexOf("30fps") == -1) {
		//	window.location = "/saitomania/30fps/index.html";
		//	return;
		//  }
		//}

		await super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');

		this.menu.addChatMenu();
		this.menu.render();

		const log = console.info.bind(console);
		console.info = async (...args) => {
			if (args.length > 0) {
				//Check for special info in the console.info
				if (typeof args[0] === 'string') {
					if (await this.checkForGameOver(args[0])) {
						return;
					}
				}

				//Still output as default
				log(...args);
			}
		};
	}

	handleGameLoop(msg = null) {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			console.log(JSON.stringify(mv));

			if (mv[0] === 'play') {
				return 0;
			}
		}
		return 0;
	}

	async checkForGameOver(log_msg) {
		if (log_msg.includes('SAITOMANIA:')) {
			let score = log_msg.replace('SAITOMANIA:', '');
			console.log('Game over, final score:' + score);
			this.game.state.scores.push(score);
			this.game.state.lifetime.round++;
			this.game.state.lifetime.high_score = Math.max(
				score,
				this.game.state.lifetime.high_score
			);
			this.addMove(
				`ROUNDOVER\t${JSON.stringify([
					this.publicKey
				])}\t${score}\t${JSON.stringify([])}`
			);
			this.endTurn();
			return 1;
		}
		return 0;
	}

	webServer(app, expressapp, express){
		//Opt out of fancy index.js
		// revert to basic modtemplate code
		let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
		let fs = app?.storage?.returnFileSystem();

		if (fs != null) {
			if (fs.existsSync(webdir)) {
				expressapp.use(
					'/' + encodeURI(this.returnSlug()),
					express.static(webdir)
				);
			} else if (this.default_html) {
				expressapp.use(
					'/' + encodeURI(this.returnSlug()),
					express.static(__dirname + '/../../lib/templates/html')
				);
			}
		}
	}
}

module.exports = SaitoMania;
