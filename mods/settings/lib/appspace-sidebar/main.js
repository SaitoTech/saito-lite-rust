const SettingsAppspaceSidebarTemplate = require('./main.template.js');

//Is this deprecated???
class SettingsAppspaceSidebar {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

    let app = this.app;
    let mod = this.mod;

    if (document.querySelector(".settings-appspace-sidebar")) {
      this.app.browser.replaceElementBySelector(SettingsAppspaceSidebarTemplate(this.app, this.mod), ".settings-appspace-sidebar");
    } else {
      this.app.browser.addElementToSelector(SettingsAppspaceSidebarTemplate(this.app, this.mod), this.container);
    }

    document.querySelector(".settings-sidebar-nuke").onclick = async (e) => {
      let c = await sconfirm("Are you sure you want to reset your wallet?");
      if (c){
        app.wallet.resetWallet();
        location.reload(); 
      }
    }

  }

}

module.exports = SettingsAppspaceSidebar;