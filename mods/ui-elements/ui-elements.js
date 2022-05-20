const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const UI_ELEMENTS_TEMPLATE = require('./templates/ui-elements-template.js');
const TABS_TEMPLATE = require('./templates/tab_templates');
const HEADER_TEMPLATE = require('./templates/header_template');
const BUTTON_TEMPLATE = require('./templates/button_templates');
const CAROUSEL_TEMPLATE = require("./templates/carousel_templates");
const COLUMN_TEMPLATE = require("./templates/column_templates");
const CARD_TEMPLATE = require("./templates/card_templates");
const READ_MORE_TEMPLATE = require("./templates/readmore_templates");
const DIVIDER_TEMPLATE = require("./templates/divider_templates");
const DATE_TEMPLATE = require("./templates/date_templates");
const SELECT_TEMPLATE = require("./templates/select_templates");
const MODAL_TEMPLATE = require("./templates/modal_templates");
const ICON_TEMPLATE = require('./templates/icon_templates');
const ALERT_TEMPLATE = require("./templates/alert_templates")
const GALLERY_TEMPLATE = require("./templates/gallery_templates")
const HEADING_TEMPLATE = require("./templates/heading_templates")
const TOGGLE_TEMPLATE = require("./templates/toggle_templates")
const RADIO_TEMPLATE = require("./templates/radio_templates")
const FORM_TEMPLATE = require("./templates/form_templates")
const TABLE_TEMPLATE = require("./templates/table_templates")


class UI_ELEMENTS extends ModTemplate {




  constructor(app) {

    super(app);
    this.parameters['display'] = "grid";
    this.name = "ui-elements";

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

    this.pages = {
      tabs: {
        heading: 'Tabs',
        subheading: 'Revolutionalize the way Tabs look',
        html: TABS_TEMPLATE(app),
      },
      buttons: {
        heading: 'Buttons',
        subheading: "",
        html: BUTTON_TEMPLATE(app)
      },
      carousels: {
        heading: "Carousel",
        subheading: "",
        html: CAROUSEL_TEMPLATE(app)
      },

      grid: {
        heading: "Columns and grids",
        subheading: "",
        html: COLUMN_TEMPLATE(app)

      },
      'read-more': {
        heading: "Read More",
        subheading: "",
        html: READ_MORE_TEMPLATE(app)
      },
      'cards': {
        heading: "lists and Cards",
        subheading: "",
        html: CARD_TEMPLATE(app)
      },
      forms: {
        heading: "Forms and Inputs",
        subheading: "",
        html: FORM_TEMPLATE(app)
      },
      tables: {
        heading: "Forms and Inputs",
        subheading: "",
        html: TABLE_TEMPLATE(app)
      },
      modals: {
        heading: 'Modals',
        subheading: "",
        html: MODAL_TEMPLATE(app)
      },
      dividers: {
        heading: 'Dividers',
        subheading: "",
        html: DIVIDER_TEMPLATE(app)
      },

      'date-time': {
        heading: 'Date and Time pickers',
        subheading: "",
        html: DATE_TEMPLATE(app)
      },
      "input-select": {
        heading: 'Select Boxes',
        subheading: "",
        html: SELECT_TEMPLATE(app)
      },
      "icons": {
        heading: "Icons",
        subheading: "",
        html: ICON_TEMPLATE(app)
      },
      "alerts": {
        heading: "Alert",
        subheading: "",
        html: ALERT_TEMPLATE(app)
      },

      "gallery": {
        heading: "Gallery",
        subheading: "",
        html: GALLERY_TEMPLATE(app)
      },
      "headings": {
        heading: "Heading",
        html: HEADING_TEMPLATE(app)
      },
      toggles: {
        heading: "Toggles",
        subheading: "",
        html: TOGGLE_TEMPLATE(app)
      },
      radios: {
        heading: "Radios",
        subheading: "",
        html: RADIO_TEMPLATE(app)
      }



    }

  }



  initialize(app) {
    // const stylesheets = ["/ui-elements/font-icons.css", "/ui-elements/animate.css", "/ui-elements/magnific-popup.css"]; // In order of css specificity: increases in specificity from left to right;
    const stylesheets = [];
    const scripts = ["/saito/lib/scripts/plugins.min.js", "/saito/lib/scripts/functions.js"];
    const meta = []

    super.initialize(app, meta, stylesheets, scripts);


  }

  initializeHTML(app) {

    super.initializeHTML(app);




  }




attachEvents(app){
  super.attachEvents(app);
}




  render(app) {
    if (app.BROWSER != 1 || this.browser_active != 1) {
      console.log('not the one')
      return;
    }

    super.render(app);

    const to_display = this.parameters['display'];

    try {
      const html = this.pages[to_display].html;

      const pageContent = document.querySelector('.main-content');
      pageContent.innerHTML = html;

    }
    catch (error) {
      console.log(error);
    }



  }



  returnBaseHTML(app) {

    return null;
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

