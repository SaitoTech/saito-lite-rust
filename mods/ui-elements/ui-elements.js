const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const UI_ELEMENTS_TEMPLATE = require('./ui-elements-template.js');

class UI_ELEMENTS extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "ui_elements";
    this.appname = "UI Elements";
    this.slug = "dev";
    this.description = "Re-usabale elements are here";
    this.categories = "Design";
    this.chat = null;
    // this.events = ["chat-render-request"];
    // this.icon_fa = "fas fa-code";

    this.header = null;

    // this.emails = {};
    // this.emails.inbox = [];
    // this.emails.output = [];
    // this.emails.trash = [];
  }


  initialize(app){
    super.initialize(app)
  }

  initializeHTML() {
  }


  attachEvents(){

  }

  


  render(app) {
    if (app.BROWSER != 1 || this.browser_active != 1) {
      return;
    }

    super.render(app);

    app.browser.addElementToDom(`
      <div id="content__">
        <div id="email-container" class="email-container main">
        </div>
      </div>
    `);

    if (this.header == null) {
      this.header = new SaitoHeader(app, this);
    }


  }

  returnBaseHTML(app){
    return UI_ELEMENTS_TEMPLATE(app)
  }

  renderMain(app) {
    if (app.BROWSER != 1 || this.browser_active != 1) {
      return;
    }
    EmailMain.render(app, this);
    EmailMain.attachEvents(app, this);
  }

  renderSidebar(app) {
    if (app.BROWSER != 1 || this.browser_active != 1) {
      return;
    }
    console.log("### 1");
    EmailSidebar.render(app, this);
    console.log("### 2");
    EmailSidebar.attachEvents(app, this);
    console.log("### 3");
  }

  respondTo(type = "") {
    if (type == "header-dropdown") {
      return {
        name: this.appname ? this.appname : this.name,
        icon_fa: this.icon_fa,
        browser_active: this.browser_active,
        slug: this.returnSlug()
      };
    }
    return null;
  }


  //
  // load transactions into interface when the network is up
  //
  onPeerHandshakeComplete(app, peer) {

    /********
     if (this.browser_active == 0) { return; }
     url = new URL(window.location.href);
     if (url.searchParams.get('module') != null) { return; }

     this.app.storage.loadTransactions("Dev", 50, (txs) => {
      for (let i = 0; i < txs.length; i++) {
  txs[i].decryptMessage(app);
        this.addTransaction(txs[i]);
      }
      let readyCount = app.browser.getValueFromHashAsNumber(window.location.hash, "ready")
      window.location.hash = app.browser.modifyHash(window.location.hash, {ready: readyCount + 1});
    });
     *******/
  }

}

module.exports = UI_ELEMENTS;

