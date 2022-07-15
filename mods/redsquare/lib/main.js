const SaitoSidebar = require('./../../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const RedSquareMainTemplate = require("./main.template");
const RedSquareTweetBox = require("./tweet-box");
const RedSquareSidebar = require("./sidebar/sidebar");
const RedSquareMenu = require("./menu");
const RedSquareGamesSidebar = require("./sidebar/games-sidebar");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceContacts = require("./appspace/contacts");
const RedSquareAppspaceGames = require("./appspace/games");
const RedSquareAppspaceNotifications = require("./appspace/notifications");


class RedSquareMain {

  constructor(app, mod, selector) {

    this.app 		= app;
    this.name 		= "RedSquareMain";

    //
    // left sidebar
    //
    mod.lsidebar 	= new SaitoSidebar(app, mod, ".saito-sidebar-left");
    mod.lsidebar.align = "left";
    mod.menu           = new RedSquareMenu(app, mod);
    mod.lsidebar.addComponent(mod.menu);
    mod.app.modules.respondTo("chat-manager").forEach(m => {
      mod.lsidebar.addComponent(m.respondTo("chat-manager"));
    });

    //
    // main already includes central panel
    //

    //
    // right sidebar
    //
    mod.rsidebar 	= new RedSquareSidebar(app, mod, ".saito-sidebar-right");

    //
    //
    //
    mod.gsidebar 	= new RedSquareGamesSidebar(app, mod, ".saito-sidebar-right");

    //
    // main panels
    //
    mod.home    	= new RedSquareAppspaceHome(app, mod, ".appspace");
    mod.games    	= new RedSquareAppspaceGames(app, mod, ".appspace");
    mod.notifications  	= new RedSquareAppspaceNotifications(app, mod, ".appspace");
    mod.contacts    	= new RedSquareAppspaceContacts(app, mod, ".appspace");

  }

  render(app, mod, selector="") {

    if (selector === "") { selector = ".saito-container"; }

    if (!document.querySelector(selector)) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod));
    }


    mod.lsidebar.render(app, mod, ".saito-container");
    mod.home.render(app, mod, ".appspace");
    mod.rsidebar.render(app, mod, ".saito-container");

    //app.connection.on("tweet-render-request", (tx) => {
    //    let tweet = new RedSquareTweetBox(app, mod, tx);
    //    tweet.render(app, mod); 
    //});

  }

}

module.exports = RedSquareMain;

