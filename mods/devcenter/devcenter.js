const ModTemplate = require("../../lib/templates/modtemplate");
const EmailMain = require("./lib/components/email-main");
const EmailSidebar = require("./lib/components/email-sidebar");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");


class DevCenter extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Devcenter";
    this.appname = "DevCenter";
    this.slug = "dev";
    this.description = "Control panel for Saito application development and software debugging";
    this.categories = "Core Admin Productivity Utilities";
    this.chat = null;
    this.events = ["chat-render-request"];
    this.icon_fa = "fas fa-code";

    this.header = null;

    this.emails = {};
    this.emails.inbox = [];
    this.emails.output = [];
    this.emails.trash = [];

    this.mods = [];

  }
  returnBaseHTML(app) {
    return ``
  }

  initialize(app) {
    const stylesheets = ['/saito/style.css', '/devcenter/style.css', '/appstore/css/email-appspace.css', '/saito/lib/templates/email-chat.css', '/saito/lib/templates/crypto-transfer-manager.css', '/saito/lib/jsonTree/jsonTree.css'];
    const scripts = ['/saito/lib/jsonTree/jsonTree.js'];
    const meta = [];
    console.log(stylesheets);
    super.initialize(app, meta, stylesheets, scripts);
  }


  initializeHTML(app, additionalURL) {

    super.initializeHTML(app, additionalURL);

    if (app.BROWSER && this.browser_active && (!app.options.dev || !app.options.dev.welcomesent)) {

      let welcometx = app.wallet.createUnsignedTransaction();

      welcometx.msg.module = "Email";
      welcometx.msg.title = "Welcome to Saito";
      welcometx.msg.message = `Saito is a network that runs blockchain applications in your browser!
  <br/><br/>
      We are currently under development, which mean any tokens in your account are TESTNET tokens which will disappear when the network is upgraded. If you are interested in purchasing tokens for use on the production network, please see our <a href="https://saito.io">main site</a> for instructions on how to do so. If you're curious what else you can do on Saito besides reading this message, why not check out the <a href="https://saito.io/arcade">Saito Arcade</a>?
        <br/><br/>
      Have questions? Why not join us on <a href="">Saito Telegram</a>?
      `;
      this.addEmail(welcometx);
    }

  }

  addEmail(tx) {
    this.emails.inbox.push(tx);
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
    this.header.render(app, this);
    this.header.attachEvents(app, this);

    this.renderSidebar(app);
    this.renderMain(app);

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

module.exports = DevCenter;

