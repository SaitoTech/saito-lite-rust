const RetweetTemplate = require("./retweet.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Retweet {

    constructor(app, mod, tweet=null) {
      this.overlay = new SaitoOverlay(app, mod);
      this.images = [];
      this.tweet = tweet;
    }

    render(app, mod, tweet=null) {
      if (tweet != null) {
        this.tweet = tweet;
      }
      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(RetweetTemplate(app, mod, app.wallet.returnPublicKey(), this.tweet), "#redsquare-tweet-overlay");
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      let divid = "post-tweet-button-";
      if (this.tweet != null) { divid += this.tweet.tx.transaction.sig; }
      document.getElementById(divid).onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;

        let retweet_tx = JSON.stringify(this.tweet.tx.transaction);
        let data = { text : text , retweet_tx : retweet_tx , retweet_link_properties : this.tweet.link_properties , retweet_link : this.tweet.link };

        let newtx = mod.sendTweetTransaction(app, mod, data);  

      	mod.addTweetFromTransaction(app, mod, newtx);
      	mod.renderMainPage(app, mod);

      	this.overlay.hide();
	let obj = document.getElementById("redsquare-new-tweets-banner");
	if (obj) { obj.style.display = 'block'; }

      }
    }

}

module.exports = Retweet;

