const ArcadeObserverTemplate = require('./arcade-observer.template');

class ArcadeObserver{
	constructor(app, observable_game){
		this.app = app;
		this.observer = observable_game;
	}

	render(app, mod, elem_id){
      app.browser.addElementToId(ArcadeObserverTemplate(app,mod,this.observer),elem_id);
      this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		let game_id = this.observer.game_id;
		let invite = document.getElementById(`invite-${game_id}`);
		if (invite){
			invite.querySelector(".observe-game-btn").onclick = function (e) {
				let game_cmd = e.currentTarget.getAttribute("data-cmd");
		        let game_id2 = e.currentTarget.getAttribute("data-sig");
		        //app.crypto.stringToBase64(JSON.stringify(observe))
		        if (game_cmd === "watch" && game_id === game_id2) {
		          mod.observeGame(game_id, 1);
		          return;
		        }		
			}
		}
	}
}

module.exports = ArcadeObserver;