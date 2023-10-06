const JSON = require("json-bigint");
const ChatMainTemplate = require("./main.template");
const SaitoSidebar = require('./../../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class ChatMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;

    //
    // left sidebar
    //
    this.sidebar = new SaitoSidebar(this.app, this.mod, ".saito-container");
    this.sidebar.align = "nope";
    
  }



  render() {

    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(ChatMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelector(ChatMainTemplate(), this.container);
    }

    //this.sidebar.render();

    this.attachEvents();

  }



  attachEvents() {

  }

}

module.exports = ChatMain;

