const Invite = require("./invite");
const InviteManagerTemplate = require("./invite-manager.template");
const JSON = require("json-bigint");
const ArcadeInitializer = require("./main/initializer");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");

class InviteManager {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "InviteManager";
    this.type = "short";

    // For filtering which games get displayed
    // We may want to only display one type of game invite, so overwrite this before render()
    this.list = "all";
    this.lists = ["mine", "open"];

    this.loader_overlay = new SaitoOverlay(app, mod, false, true);

    //
    // handle requests to re-render invite manager
    //
    app.connection.on("arcade-invite-manager-render-request", () => {
      if (!this.mod.is_game_initializing) {
        this.render();
      }
    });

    app.connection.on("arcade-game-initialize-render-request", () => {
      //
      // If Arcade is the active module, Arcade.main will respond to this event
      // Otherwise we launch an overlay and stick the spinner in there
      //
      if (!this.mod.browser_active) {
        this.loader_overlay.show('<div class="arcade_game_overlay_loader"></div>');
        let game_loader = new ArcadeInitializer(app, mod, ".arcade_game_overlay_loader");
        game_loader.render();
      }
    });
  }

  render() {
    console.log("rendering invite manager", this.lists, this.mod.games);
    //
    // replace element or insert into page (deletes invites for a full refresh)
    //
    let target = this.container + " .invite-manager";

    if (document.querySelector(target)) {
      this.app.browser.replaceElementBySelector(InviteManagerTemplate(this.app, this.mod), target);
    } else {
      this.app.browser.addElementToSelectorOrDom(
        InviteManagerTemplate(this.app, this.mod),
        this.container
      );
    }

    for (let list of this.lists) {
      if (this.list === "all" || this.list === list) {
        if (!this.mod.games[list]) {
          this.mod.games[list] = [];
        }
        if (this.mod.games[list].length > 0) {
          if (list === "mine") {
            this.app.browser.addElementToSelector(`<h5>My Games</h5>`, target);
          } else if (list == "open") {
            this.app.browser.addElementToSelector(`<h5>Open Invites</h5>`, target);
          } else if (list == "active") {
            this.app.browser.addElementToSelector(`<h5>Active Matches</h5>`, target);
          } else if (list == "over") {
            this.app.browser.addElementToSelector(`<h5>Recent Matches</h5>`, target);
          } else {
            this.app.browser.addElementToSelector(
              `<h5>${list.charAt(0).toUpperCase() + list.slice(1)} Games</h5>`,
              target
            );
          }
        }

        for (let i = 0; i < this.mod.games[list].length && i < 5; i++) {
          let newInvite = new Invite(
            this.app,
            this.mod,
            target,
            this.type,
            this.mod.games[list][i]
          );
          newInvite.render();
        }
      }
    }

    this.attachEvents();
  }

  attachEvents() {}
}

module.exports = InviteManager;
