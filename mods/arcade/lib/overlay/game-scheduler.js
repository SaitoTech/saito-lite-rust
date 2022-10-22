const saito = require('./../../../../lib/saito/saito');
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
  }

}


module.exports = GameScheduler;

