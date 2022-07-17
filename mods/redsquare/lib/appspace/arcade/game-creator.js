const saito = require('./../../../../../lib/saito/saito');
const GameCreatorTemplate = require('./game-creator.template');
const ArcadeGameDetails = require('./../../../../arcade/lib/arcade-game/arcade-game-details');



class GameCreator {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.name = "GameCreator";
    this.selector = selector;
  }

  render(app, mod, selector = "") {
    if (selector === "" || this.selector !== "") { selector = this.selector; }
    document.querySelector(selector).innerHTML = "";
    app.browser.addElementToSelector(GameCreatorTemplate(app, mod, "Select Game to Play"), selector);
    this.attachEvents(app, mod);
  }

  
  attachEvents(app, mod) {

    Array.from(document.querySelectorAll('.redsquare-game-container')).forEach(game => {

      game.onclick = (e) => {

        let modname = e.currentTarget.getAttribute("data-id");

        let tx = new saito.default.transaction();
        tx.msg.game = modname;

	//
	// DEPRECATED -- 
	//
        let arcade_mod = app.modules.returnModule("Arcade");
        ArcadeGameDetails.render(app, arcade_mod, tx);
        ArcadeGameDetails.attachEvents(app, arcade_mod, tx);

      };

    });

  }

}


module.exports = GameCreator;

