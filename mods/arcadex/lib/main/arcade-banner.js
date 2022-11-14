const SaitoModuleIntro = require("./../../../../lib/saito/new-ui/templates/saito-module-intro.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class ArcadeBanner {

 	constructor(app){

 	}

	render(app, mod){

		let html = `<div id="arcade-banner" class="arcade-banner">
						${SaitoModuleIntro(app, app.modules.returnModule(mod.viewing_game_homepage), false)}
						<i id="game_help" class="fa fa-question-circle"></i>
					</div>`;
		if (mod.viewing_game_homepage === mod.name){
			html = `<div id="arcade-banner" class="arcade-banner"></div>`;
					/*`<div id="arcade-banner" class="arcade-banner">
						<div class="arcade_welcome">
							Welcome to the Saito Arcade, a place to create game invitations, join games, view live and recently finished games, and see how you stack up against other Saitozens!
							Explore the games we have available through the navigation menu on the left or see what is happening right now below.
						</div>
						<!--div class="saito-box-buttons">
							<div class="saito-button-primary button" data-cmd="create">Create Game</div>
						</div-->
					</div>`;
					*/
		}
		app.browser.replaceElementById(html, "arcade-banner");
		this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		if (document.getElementById("game_help")){
			document.getElementById("game_help").onclick = (e) =>{
				e.stopPropagation();
				let overlay = new SaitoOverlay(app);
				overlay.show(app, mod, app.modules.returnModule(mod.viewing_game_homepage).returnGameRulesHTML());
				return;
			}
		}

		document.getElementById("arcade-banner").onclick = (e) => {
			if (mod.viewing_game_homepage == mod.name){
				app.connection.emit("launch-game-selector");
				//mod.createGameSelector();
			}else{
				mod.createGameWizard(mod.viewing_game_homepage);
			}
		}

	}
}
module.exports = ArcadeBanner;