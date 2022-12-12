const AppspaceProfileTemplate = require("./profile.template");
const Tweet = require("./../tweet");
const JSON = require('json-bigint');

class AppspaceProfile {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.publickey = "";
    this.container = container;
    this.name = "RedSquareAppspaceProfile";
  }


  render(publickey="") {

console.log("A1");

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceProfileTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceProfileTemplate(), this.container);
    }

console.log("A2");

    let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND publickey = '${publickey}';`;
    for (let i = 0; i < this.mod.peers_for_tweets.length; i++) {   
      this.mod.loadTweetsFromPeerAndReturn(this.mod.peers_for_tweets[i], sql, (txs) => {
console.log("A3");
        for (let z = 0; z < txs.length; z++) {
console.log("A4: " + z);
console.log(JSON.stringify(txs[z]));
	  let tweet = new Tweet(this.app, this.mod, ".redsquare-profile", txs[z]);
console.log("and render...");
  	  tweet.render();
console.log("and done render...");
        }

        this.attachEvents();
console.log("A4");
      }, false, false);
    }

console.log("A5");

  }  

  attachEvents() {
  }

}

module.exports = AppspaceProfile;



