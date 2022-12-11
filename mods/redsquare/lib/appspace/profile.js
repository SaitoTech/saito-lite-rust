const AppspaceProfileTemplate = require("./profile.template");
const Tweet = require("./../tweet");


class AppspaceProfile {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.publickey = "";
    this.container = container;
    this.name = "RedSquareAppspaceProfile";
  }


  render(publickey="") {

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND publickey = '${publickey}';`;
    this.mod.loadTweetsFromPeerAndReturn(peer, sql, function(txs) {
      for (let z = 0; z < txs.length; z++) {
	let tweet = new Tweet(this.app, this.mod, ".redsquare-profile", txs[z]);
	tweet.render();
      }
      this.attachEvents();
    }, false, false);

  }  

  attachEvents() {
  }

}

module.exports = AppspaceProfile;



