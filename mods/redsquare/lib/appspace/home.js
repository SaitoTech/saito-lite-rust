const AppspaceHomeTemplate = require("./home.template");

class AppspaceHome {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceHome";
  }

  render() {

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    //
    //
    //
    for (let i = 0; i < this.mod.tweets.length; i++) {
      this.mod.tweets[i].container = ".redsquare-home";
      this.mod.tweets[i].render();
    }

    this.attachEvents();
  }  

  attachEvents() {

  }

}

module.exports = AppspaceHome;



