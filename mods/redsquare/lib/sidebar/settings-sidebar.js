const RedSquareSettingsSidebarTemplate = require("./settings-sidebar.template");
const SaitoCalendar = require("./../../../../lib/saito/new-ui/saito-calendar/saito-calendar");

class RedSquareGamesSidebar {

  constructor(app, mod, selector = "") {
    this.app = app;
    this.name = "RedSquareSettingsSidebar";
    this.mod = mod;
    this.selector = selector;
  }

  render(app, mod, selector="") {

    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

    if (selector != "") {
      app.browser.addElementToSelector(RedSquareSettingsSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareSettingsSidebarTemplate(app, mod), this.selector);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) { 
    document.querySelector(".settings-sidebar-nuke").addEventListener("click", async () => {
      let c = await sconfirm("Are you sure you want to delete your wallet?");
      if (c) {
        app.wallet.resetWallet();
      }
    });
  }

}

module.exports = RedSquareGamesSidebar;

