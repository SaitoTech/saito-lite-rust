const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const SaitoCalendar = require('../../lib/saito/new-ui/saito-calendar/saito-calendar');
const RedSquareMain = require('./lib/main/redsquare-main');
const RedSquareMenu = require('./lib/menu');

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
	'/saito/lib/saito-date-picker/style.css'
    ];
    this.scripts = [
    ];

    this.main = new RedSquareMain(app);
    this.header = new SaitoHeader(app);

    this.lsidebar = new SaitoSidebar(app);
    this.lsidebar.align = "left";

    this.rsidebar = new SaitoSidebar(app);
    this.rsidebar.align = "right";

    this.calendar = new SaitoCalendar(app);
    this.menu = new RedSquareMenu(app);


  }


  render(app, mod) {

    this.addComponent(this.lsidebar);
    this.addComponent(this.main);
    this.addComponent(this.rsidebar);
    this.addComponent(this.header);

    this.lsidebar.addComponent(this.menu);
    this.rsidebar.addComponent(this.calendar);

    super.render(app, this);

    //
    // we could create UI component, but after everything 
    // is rendered, we can also just hack up the HTML 
    // manually if we want.
    //
    if (document.querySelector(".saito-sidebar.right")) {
      app.browser.prependElementToClass(	
        `<div class="saito-search-bar">
          <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
        </div>
        `,
        ".saito-sidebar.right"
      );
    }

  }

}

module.exports = RedSquare;

