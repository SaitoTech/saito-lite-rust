const RedSquareMainTemplate = require("./redsquare-main.template");
const RedSquareMenu = require("./../menu");


class RedSquareMain {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareMain";
  }

  render(app, mod) {

    if (document.getElementById("saito-container")) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), "saito-container");

      this.attachEvents(app, mod);
    }

  }

  attachEvents(app, mod) {

    let publishBtn = document.querySelector('#redsquare-input-container button');
    publishBtn.onclick = (e) => {
      e.preventDefault();
      let content = document.querySelector('#redsquare-input-container textarea').value;

      if (content != "")
        mod.sendTweetTransaction(content);
      else
        //
        // TODO -- create a success and error UI component for displaying msgs
        //
        alert('Empty post cannot be published');
    }

  }
}

module.exports = RedSquareMain;

