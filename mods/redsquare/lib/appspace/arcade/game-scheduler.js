const saito = require('./../../../../../lib/saito/saito');
const GameSchedulerTemplate = require('./game-scheduler.template');

class GameScheduler {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.name = "GameScheduler";
    this.selector = selector;
  }

  render(app, mod, selector = "") {
    if (selector === "" || this.selector !== "") { selector = this.selector; }
    document.querySelector(selector).innerHTML = "";
    app.browser.addElementToSelector(GameSchedulerTemplate(app, mod, "Schedule Game"), selector);
  }

  
  attachEvents(app, mod) {
/***
    Array.from(document.getElementsByClassName('arcade-navigator-item')).forEach(game => {
      game.addEventListener('click', (e) => {
        let gameName = e.currentTarget.id;
        app.browser.logMatomoEvent("Arcade", "GameListOverlayClick", gameName);
        let tx = new saito.default.transaction();
        tx.msg.game = gameName;
        ArcadeGameDetails.render(app, mod, tx);
        ArcadeGameDetails.attachEvents(app, mod, tx);
      
      });
    });
***/
  }

}


module.exports = GameScheduler;

