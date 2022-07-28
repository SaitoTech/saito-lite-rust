const RetweetTemplate = require("./retweet.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Retweet {

    constructor(app, mod) {
      this.overlay = new SaitoOverlay(app, mod);
      this.images = [];
      this.tweet = null;
    }

    render(app, mod, tweet) {
      this.tweet = tweet;
      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(RetweetTemplate(app, mod, app.wallet.returnPublicKey(), tweet), "#redsquare-tweet-overlay");
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let retweet_tx = JSON.stringify(this.tweet.tx.transaction);
        let data = { text : text , retweet_tx : retweet_tx };

console.log("A");

        let newtx = mod.sendTweetTransaction(app, mod, data);  
console.log("B");

	mod.addTweetFromTransaction(app, mod, newtx);
console.log("C");
	mod.renderMainPage(app, mod);
console.log("D");

	this.overlay.hide();

      }
    }

}

module.exports = Retweet;

