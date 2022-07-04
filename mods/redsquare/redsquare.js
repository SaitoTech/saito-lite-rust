const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const SaitoCalendar = require('../../lib/saito/new-ui/saito-calendar/saito-calendar');
const RedSquareMain = require('./lib/main/redsquare-main');
const RedSquareMenu = require('./lib/menu');
const RedSquareChatBox = require('./lib/chatbox');
const RedSquareSidebar = require('./lib/sidebar');


class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
    ];

    this.ui_initialized = false;

  }



  render(app, mod) {

    console.log("RENDERING REDSQUARE!");

    if (this.ui_initialized == false) {

      this.main = new RedSquareMain(this.app);
      this.header = new SaitoHeader(this.app);
      this.menu = new RedSquareMenu(this.app);
      this.chatBox = new RedSquareChatBox(this.app)
      this.calendar = new SaitoCalendar(this.app);

      this.lsidebar = new SaitoSidebar(this.app);
      this.lsidebar.align = "left";

      this.rsidebar = new SaitoSidebar(this.app);
      this.rsidebar.align = "right";

      //
      // combine ui-components
      //
      this.addComponent(this.lsidebar);
      this.addComponent(this.main);
      this.addComponent(this.rsidebar);
      this.addComponent(this.header);

      this.lsidebar.addComponent(this.chatBox);
      this.lsidebar.addComponent(this.menu);

      this.rsidebar.addComponent(this.calendar);

      this.ui_initialized = true;

    }

    super.render(app, this);

  }

}

module.exports = RedSquare;

