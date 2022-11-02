const SaitoModuleIntro = require("./../../../../lib/saito/new-ui/templates/saito-module-intro.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class ArcadeBanner {

 	constructor(app){

 	}

	render(app, mod){

		let html = `<div id="arcade-banner" class="arcade-banner">
						${SaitoModuleIntro(app, app.modules.returnModule(mod.viewing_game_homepage))}
						<div class="saito-box-buttons">
							<div class="saito-button-primary button" data-cmd="create">Create Game</div>
							<div class="saito-button-primary button" data-cmd="learn">Learn</div>
						</div>
					</div>`;
		if (mod.viewing_game_homepage === mod.name){
			html = `<div id="arcade-banner" class="arcade-banner">
						<div class="saito-box-buttons">
							<div class="saito-button-primary button" data-cmd="create">Create Game</div>
						</div>
					</div>`;
		}
		app.browser.replaceElementById(html, "arcade-banner");
		this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		Array.from(document.querySelectorAll("#arcade-banner .button")).forEach(btn => {
			btn.onclick = (e) =>{
				let cmd = e.currentTarget.getAttribute("data-cmd");
				if (cmd == "create"){
					if (mod.viewing_game_homepage == mod.name){
						app.connection.emit("launch-game-selector");
						//mod.createGameSelector();
					}else{
						mod.createGameWizard(mod.viewing_game_homepage);
					}
				}
				if (cmd == "learn"){
					let overlay = new SaitoOverlay(app);
					overlay.show(app, mod, app.modules.returnModule(mod.viewing_game_homepage).returnGameRulesHTML());
				}
			}
		});

	}
}
module.exports = ArcadeBanner;