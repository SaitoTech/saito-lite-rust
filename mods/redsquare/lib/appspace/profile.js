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


  render(publickey = "") {


    if (publickey == "") { if (this.publickey != "") { publickey = this.publickey; } }
    if (publickey == "") { publickey = this.app.wallet.returnPublicKey(); }
    this.publickey = publickey;

    if (document.querySelector(".redsquare-profile")) {
      this.app.browser.replaceElementBySelector(AppspaceProfileTemplate(this.app, publickey), ".redsquare-profile");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceProfileTemplate(this.app, publickey), this.container);
    }

    let sql = `SELECT * FROM tweets WHERE publickey = '${publickey}' ORDER BY created_at DESC;`;
    for (let i = 0; i < this.mod.peers_for_tweets.length; i++) {
      this.mod.loadTweetsFromPeerAndReturn(this.mod.peers_for_tweets[i], sql, (txs) => {
        document.querySelector(".redsquare-profile-tweets").innerHTML = "";
        for (let z = 0; z < txs.length; z++) {
          let tweet = new Tweet(this.app, this.mod, ".redsquare-profile-tweets", txs[z]);
          tweet.render();
        }
        this.attachEvents();
      }, false, false);
    }
    document.querySelector('.saito-container').scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  attachEvents() {

    document.querySelector('.copy-public-key').onclick = (e) => {
      navigator.clipboard.writeText(this.publickey);
      salert("Public key copied");
    }

  }

}

module.exports = AppspaceProfile;



