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
    this.stylesheets = null;
    this.stylesheetAdded = false;
    this.scriptsAdded = false;
    this.eventListeners = [];
    // this.emails = {};
    // this.emails.inbox = [];
    // this.emails.output = [];
    // this.emails.trash = [];
  }


  initialize(app) {
    super.initialize(app)
    this.stylesheets = ["/saito/style.css", "/saito/saito.css", "/appstore/css/email-appspace.css"]; // In order of css specificity: increases in specificity from left to right;
    this.scripts = [];

  }

  initializeHTML(app) {
    this.attachMeta(app);
    this.attachStyleSheets(app);
    this.attachScripts(app);

  }


  attachEvents(app) {
    const self = this;
    const listener = $('#toggle_btn').on('click', function (e) {
      const portal_mod = app.modules.returnModule("Portal");

      portal_mod.toggleDarkMode();
      self.eventListeners.push({ type: 'click', listener });
    });
    const listener2 = $('#render_arcade').on('click', function (e) {
      const portal_mod = app.modules.returnModule("Portal");
      const arcade_mod = app.modules.returnModule("Arcade");

      portal_mod.render(app, arcade_mod);
      self.eventListeners.push({ type: 'click', listener2 });
    });


  }


  removeEvents() {
    this.eventListeners.forEach(eventListener => {
      document.removeEventListener(eventListener.type, eventListener.listener);
    })
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

  returnBaseHTML(app) {
    return UI_ELEMENTS_TEMPLATE(app)
  }


  attachStyleSheets(app) {
    if (this.stylesheetAdded === true) return;
    this.stylesheets.forEach(stylesheet => {
      console.log('appending stylesheet ', stylesheet);
      $('head').append(`<link rel="stylesheet" type="text/css" href="${stylesheet}">`);
    })
    this.stylesheetAdded = true;
  }

  attachScripts(app) {
    if (this.scriptsAdded === true) return;
    this.scripts.forEach(script => {
      $('head').append(`<script type="text/javascript" src="${script}"> </script>`);
    })
    this.scriptsAdded = true;
  }

  attachMeta(app) {

  }

  removeStyleSheets(app) {
    this.stylesheets.forEach(stylesheet => {
      console.log('removing stylesheet ', stylesheet);
      $(`link[rel=stylesheet][href~="${stylesheet}"`).remove();
    })

    this.stylesheetAdded = false;

  }

  removeMeta() {

  }

  removeScripts() {
    this.scripts.forEach(script => {
      console.log('removing script', script);
      $(`script[src*="${script}"]`).remove()
    })
    this.scriptsAdded = false;
  }

  removeHTML() {
    document.querySelector('body').innerHTML = "";
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

  destroy(app) {
    console.log('destroying');
    this.removeMeta();
    this.removeStyleSheets();
    this.removeHTML();
    this.removeScripts();
    this.removeEvents();
    this.browser_active = 0;
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

