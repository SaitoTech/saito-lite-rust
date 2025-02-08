const ImportGameTemplate = require('./import-game.template.js');
const ImportGamePlayersTemplate = require('./import-game.players.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay.js');

class ImportGame {

	constructor(app, mod, game_mod = null, obj = {}) {
		this.app = app;
		this.mod = mod;
		this.game_mod = game_mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.obj = obj;

                app.connection.on('arcade-launch-game-import', async (newtx) => {

			let x = newtx.returnMessage();

console.log("ABOVE OBJ: ");
console.log("OBJ SU: " + JSON.stringify(x));
console.log("MOD: " + x.module);

			let el = document.querySelector(".league-overlay-body");
			if (el) {
				el.innerHTML = "";
				el.innerHTML += ImportGamePlayersTemplate(this.app, this.mod, this.game_mod, obj);
			}

                });

	}

	render(gamename="") {
                this.game_mod = this.app.modules.returnModuleByName(gamename);
                gamename = this.game_mod.returnName() || '';
                let img = this.game_mod.respondTo('arcade-games')?.image || '';
		this.overlay.show(ImportGameTemplate(this.app, this.mod, this.game_mod, gamename, img));
		this.overlay.setBackground(this.game_mod.respondTo('arcade-games').image);
		this.attachEvents();

	}

	attachEvents() {

		let iself = this;

		iself.app.browser.addDragAndDropFileUploadToElement(
			"league-overlay-body",
                        async (file) => {

				file = JSON.stringify(file).substring(30);
				alert("create joinable Invite...: " + file);

				let data = iself.app.crypto.base64ToString(file);
				let jsonobj = JSON.parse(data);
				let options = jsonobj.options;

alert("OPTIONS: " + JSON.stringify(options));
//alert("HERE: " + JSON.stringify(data));
console.log("HERE: " + JSON.stringify(jsonobj));

				iself.obj.gameobj = JSON.stringify(jsonobj);

// options should be extracted from game...
console.log("about to send into makeGameInvite");
				iself.mod.makeGameInvite(options, 'import', iself.obj);
			},
                        false
                ); 

		

	}
}

module.exports = ImportGame;

