const SaitoSidebar = require('./../../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const RedSquareMainTemplate = require("./main.template");
const RedSquareTweet = require("./tweet");
const RedSquareSidebar = require("./sidebar/sidebar");
const RedSquareMenu = require("./menu");
const RedSquareSettingsSidebar = require("./sidebar/settings-sidebar");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceContacts = require("./appspace/contacts");
const RedSquareAppspaceGames = require("./appspace/games");
const RedSquareAppspaceNotifications = require("./appspace/notifications");


class RedSquareMain {

  constructor(app, mod, selector) {

    this.app = app;
    this.name = "RedSquareMain";

    // TODO -- HACK TO AVOID LEAGUES PROBLEM
    this.left_sidebar_rendered = 0;

    //
    // left sidebar
    //
    mod.lsidebar = new SaitoSidebar(app, mod, ".saito-sidebar-left");
    mod.lsidebar.align = "left";
    mod.menu = new RedSquareMenu(app, mod);
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
    mod.rsidebar = new RedSquareSidebar(app, mod, ".saito-sidebar-right");


    //
    // settings sidebar
    //

    mod.settsidebar = new RedSquareSettingsSidebar(app, mod, ".saito-sidebar-right");

    //
    // main panels
    //
    mod.home = new RedSquareAppspaceHome(app, mod, ".appspace");
    mod.games = new RedSquareAppspaceGames(app, mod, ".appspace");
    mod.notifications = new RedSquareAppspaceNotifications(app, mod, ".appspace");
    mod.contacts = new RedSquareAppspaceContacts(app, mod, ".appspace");

  }

  render(app, mod, selector = "") {

    if (selector === "") { selector = ".saito-container"; }

    if (!document.querySelector(selector)) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod));
    }

    // TODO - remove when refactored
    //if (this.left_sidebar_rendered === 0) {
      mod.lsidebar.render(app, mod, ".saito-sidebar-left");
      this.left_sidebar_rendered = 1;
    //}

    mod.home.render(app, mod, ".appspace");
    mod.rsidebar.render(app, mod, ".saito-sidebar-right");

    // check the url for an anchor hash
    // if one exists ask the menu to render it
    // if that fails render home

    var hash = new URL(document.URL).hash.split('#')[1];
    let component = hash;
    let params = null;

    if (hash) {
      if (hash?.split("").includes("?")) {
        component = hash.split("?")[0];
        params = hash.split("?")[1];
      }
    }





    var hash_matched = 0;

    if (component != "") {
      let hash_matched = mod.menu.renderItem(app, mod, component, params);
      if (hash_matched == 1) {
        return 1;
      }
    }
    //app.connection.on("tweet-render-request", (tx) => {
    //    let tweet = new RedSquareTweet(app, mod, tx);
    //    tweet.render(app, mod); 
    //});

  }

}

module.exports = RedSquareMain;

