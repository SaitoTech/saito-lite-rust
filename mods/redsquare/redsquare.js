const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const SaitoCalendar = require('../../lib/saito/new-ui/saito-calendar/saito-calendar');
const RedSquareMain = require('./lib/main/redsquare-main');
const RedSquareMenu = require('./lib/menu');
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
	'/saito/lib/saito-date-picker/style.css'
    ];
    this.scripts = [
    ];

    this.main = new RedSquareMain(app);
    this.header = new SaitoHeader(app);

    this.lsidebar = new SaitoSidebar(app);
    this.lsidebar.align = "left";

    //
    // we have two options for our right sidebar, we can 
    // either use the default sidebar, add components, or
    // we can create a custom sidebar that handles all of
    // its own component wizardry.
    //
    // with Saito UI element saito-sidebar
    //
    //this.rsidebar = new SaitoSidebar(app);
    //this.rsidebar.align = "right";
    //this.calendar = new SaitoCalendar(app);

    //
    // with module-specific sidebar
    //
    this.rsidebar = new RedSquareSidebar(app);

    this.menu = new RedSquareMenu(app);


  }


  render(app, mod) {

    this.addComponent(this.lsidebar);
    this.addComponent(this.main);
    this.addComponent(this.rsidebar);
    this.addComponent(this.header);

    this.lsidebar.addComponent(this.menu);

    //
    // with classic saito-sidebar we can add 
    // components like this and have them render
    // when we trigger render of this element
    //
    //this.rsidebar.addComponent(this.calendar);

    super.render(app, this);

    //
    // whichever approach we use to add elements, 
    // after super.render() has run we have the page
    // fleshed out and ready to use, and can manually
    // add or edit the DOM however we want.
    //
    // this avoids the need for developers to use
    // our UIComponent-style of development. You 
    // can always just hack up the DOM old-school
    // style.
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

