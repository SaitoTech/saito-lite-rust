const OnePlayerGameTemplate = require('./../../lib/templates/oneplayer-gametemplate');
const SaitoRunRulesTemplate = require('./lib/saitorun-rules.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class SaitoRun extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.name = 'SaitoRun';
		this.gamename = 'SaitoRun';
		this.slug = 'saitorun';
		this.description =
			'Collect cubes and navigate through obstacles to get highest possible score!';
		this.categories = 'Games Arcadegame One-player';
		this.publisher_message =
			'developed by Pawel (twitter: @PawelPawlak14). Feel free to pm me with any suggestions/feedback';
		this.request_no_interrupts = true; // don't popup chat
		this.maxPlayers = 1;
		this.minPlayers = 1;
		this.app = app;
		this.statistical_unit = 'run';
	}

	// Create a high score league by default
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
			this.game.state = this.returnState();
			this.game.queue = [];
			this.game.queue.push('play');
			this.game.queue.push('READY');
		}

		if (this.loadGamePreference(this.name + '_stats')) {
			this.game.state.lifetime = this.loadGamePreference(
				this.name + '_stats'
			);
		}
	}

	async render(app) {
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}

		await super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addSubMenuOption('game-game', {
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnStatsHTML());
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		const log = console.info.bind(console);
		console.info = (...args) => {
			if (args.length > 0) {
				//Check for special info in the console.info
				if (typeof args[0] === 'string') {
					if (this.checkForGameOver(args[0])) {
						return;
					}
				}

				//Still output as default
				log(...args);
			}
		};
	}

	returnStatsHTML(title = 'Saito Run') {
		let avg_points =
			Math.round(
				(10 * this.game.state.lifetime.total_points) /
					this.game.state.lifetime.round
			) / 10 || 0;
		let avg_distance =
			Math.round(
				(10 * this.game.state.lifetime.total_distance) /
					this.game.state.lifetime.round
			) / 10 || 0;

		let html = `<div class="solitaire-stats-overlay">
      <h1>${title}</h1>
      <hr>
      <div class="saito-table">
        <div class="saito-table-header">
          <div class="saito-table-row">
            <div></div>
            <div>Best Game</div>
            <div>Totals</div>
            <div>Avg (${this.game.state.lifetime.round})</div>
          </div>
        </div>
        <div class="saito-table-body">
          <div class="saito-table-row">
            <div class="saito-table-label">Points Earned:</div>
            <div>${this.game.state.lifetime.high_score} </div>
            <div>${this.game.state.lifetime.total_points} </div>
            <div>${avg_points} </div>
          </div>
          <div class="saito-table-row">
            <div class="saito-table-label">Distance Traveled:</div>
            <div>${this.game.state.lifetime.longest_run} </div>
            <div>${this.game.state.lifetime.total_distance} </div>
            <div>${avg_distance} </div>
          </div>
        </div>
      </div>
    </div>`;
		return html;
	}

	returnState() {
		let state = {
			scores: [],
			lifetime: {
				round: 0, //number of games played
				high_score: 0, //ATH
				total_points: 0,
				total_distance: 0,
				max_level: 0,
				longest_run: 0
			}
		};

		return state;
	}

	handleGameLoop(msg = null) {
		this.saveGame(this.game.id);
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			if (mv[0] === 'play') {
				this.game.queue.splice(qe, 1);
				return 0;
			}

			//
			// avoid infinite loops
			//
			if (shd_continue == 0) {
				console.log('NOT CONTINUING');
				return 0;
			}
		}
		return 1;
	}

	checkForGameOver(log_msg) {
		if (log_msg.includes('SAITORUN:')) {
			let scores = log_msg.replace('SAITORUN:', '').split('|');
			let score = scores[2]; // Points Earned
			console.info('Game over detected');
			this.game.state.scores.push(score);
			this.game.state.lifetime.round++;
			this.game.state.lifetime.max_level = Math.max(
				scores[0],
				this.game.state.lifetime.max_level
			);
			this.game.state.lifetime.longest_run = Math.max(
				scores[1],
				this.game.state.lifetime.longest_run
			);
			this.game.state.lifetime.high_score = Math.max(
				score,
				this.game.state.lifetime.high_score
			);
			this.game.state.lifetime.total_distance += parseInt(scores[1]);
			this.game.state.lifetime.total_points += parseInt(scores[2]);

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
}

module.exports = SaitoRun;
