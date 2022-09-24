const RetweetTemplate = require("./retweet.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Retweet {

    constructor(app, mod, tweet=null) {
      this.overlay = new SaitoOverlay(app);
      this.images = [];
      this.tweet = tweet;
    }

    render(app, mod, tweet=null) {
      if (tweet != null) {
        this.tweet = tweet;
      }

      if (document.querySelector("#redsquare-tweet-overlay-"+this.tweet.tx.transaction.sig) != null) {
        document.querySelector("#redsquare-tweet-overlay-"+this.tweet.tx.transaction.sig).parentNode.remove();
      } 
        
      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay-'+this.tweet.tx.transaction.sig+'" class="redsquare-tweet-overlay"></div>');  
      
      app.browser.addElementToSelector(RetweetTemplate(app, mod, app.wallet.returnPublicKey(), this.tweet), "#redsquare-tweet-overlay-"+this.tweet.tx.transaction.sig);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      let divid = "post-tweet-button-";
      if (this.tweet != null) { divid += this.tweet.tx.transaction.sig; }
      document.getElementById(divid).onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;


        //
        // extracting keys from text AND then tweet
        //
        let keys = app.browser.extractKeys(text);
        if (this.tweet != null) {
          for (let i = 0; i < this.tweet.tx.transaction.to.length; i++) {
            if (!keys.includes(this.tweet.tx.transaction.to[i].add)) {
              keys.push(this.tweet.tx.transaction.to[i].add);
            }
          }
        }

        let retweet_tx = JSON.stringify(this.tweet.tx.transaction);
        let data = { text : text , retweet_tx : retweet_tx , retweet_link_properties : this.tweet.link_properties , retweet_link : this.tweet.link };

        let newtx = mod.sendTweetTransaction(app, mod, data, keys);  

           // increase num retweets for base tweet
          let sel = ".tweet-tool-retweet-count-" + this.tweet.tx.transaction.sig;
          console.log(sel, 'selector')
          let  obj = document.querySelector(sel);
          obj.innerHTML = parseInt(obj.innerHTML) + 1;
          if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
            obj.parentNode.classList.remove("saito-tweet-no-activity");
            obj.parentNode.classList.add("saito-tweet-activity");
          };

      	mod.addTweetFromTransaction(app, mod, newtx);
      	mod.renderMainPage(app, mod);
      	this.overlay.hide();



     obj = document.getElementById("redsquare-new-tweets-banner");
      if (obj) { obj.style.display = 'block'; }

      }
    }

}

module.exports = Retweet;

