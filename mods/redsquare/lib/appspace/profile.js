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
    this.attachEvents();
    document.querySelector('.saito-container').scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  attachEvents() {


    try {
      document.querySelector('.redsquare-appspace-profile-follow-btn').onclick = (e) => {

        let obj = document.querySelector('.redsquare-appspace-profile-follow-btn');
        let publickey = obj.getAttribute("data-id");
        let key = this.app.keychain.returnKey(publickey);

        if (obj.innerHTML === "follow") {
	  obj.innerHTML = "unfollow";
        } else {
  	  obj.innerHTML = "follow";
        }

        if (key.watched == true) { 
	  key.watched = false;
	  this.app.keychain.addKey(key);
  	  this.app.keychain.saveKeys();
        } else {
	  key.watched = true;
	  this.app.keychain.addKey(key);
   	  this.app.keychain.saveKeys();
        }

	//
	// our peers should start listening
	//
	this.app.network.propagateKeylist();

      }
    } catch (err) {}


    document.querySelector('.copy-public-key').onclick = (e) => {
      navigator.clipboard.writeText(this.publickey);
      siteMessage("Public key copied", 1000);
    }

  }

}

module.exports = AppspaceProfile;



