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

    this.main = new RedSquareMain(app);
    this.header = new SaitoHeader(app);

    this.lsidebar = new SaitoSidebar(app);
    this.lsidebar.align = "left";

    this.rsidebar = new RedSquareSidebar(app);
    this.menu = new RedSquareMenu(app);

    //
    // another approach to the right sidebar would be to
    // use another instance of the SaitoSidebar and then
    // add components to it here the same way that we add
    // the menu to our left-sidebar.
    //
    //this.rsidebar = new SaitoSidebar(app);
    //this.rsidebar.align = "right";
    //this.calendar = new SaitoCalendar(app);
    //this.rsidebar.addComponent(this.calendar);

    //
    // finally, add ui-components
    //
    this.addComponent(this.lsidebar);
    this.addComponent(this.main);
    this.addComponent(this.rsidebar);
    this.addComponent(this.header);

    this.lsidebar.addComponent(this.menu);

  }


  render(app, mod) {

    super.render(app, this);

    //
    // whichever approach we use to add elements, 
    // after super.render() has run we have the page
    // fleshed out and ready to use, and can manually
    // add or edit the DOM however we want.
    //
    //if (document.querySelector(".element-to-edit")) {
    //  ...
    //}

  }

}

module.exports = RedSquare;

