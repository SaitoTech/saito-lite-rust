const TweetTemplate = require("./tweet.template");

class RedSquareTweet {

    constructor(app, mod, tx) {

      //
      // store tx
      //
      this.tx = tx;

      this.sender     	 = tx.transaction.from[0].add;
      this.created_at 	 = tx.transaction.ts;

      this.parent_id     = "";
      this.thread_id     = "";
      this.text 		 = null;
      this.link 		 = null;
      this.link_properties = null;
      this.youtube_id 	 = null;

      this.children 	 = [];

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

      //
      // 0 = do not fetch open graph
      //
      this.generateTweetProperties(app, mod, 0);

    }


    addTweet(app, mod, tweet) {
      if (tweet.parent_id == this.tx.transaction.sig) {
        for (let i = 0; i < this.children.length; i++) {
	  if (this.children[i].tx.transaction.sig === tweet.tx.transaction.sig) {
	    return 1;
	  }
        }
        this.children.push(tweet);
      } else {
        for (let i = 0; i < this.children.length; i++) {
          return this.children[i].addTweet(app, mod, tweet); 
        }
      }
    }

    setKeys(obj) {
      for (let key in obj) { 
        if (typeof obj[key] != 'undefined') {
          if (this[key] === "" || this[key] === null) {
            this[key] = obj[key];  
          }
        }
      }
    }

    render(app, mod, selector = "") {

      let html = TweetTemplate(app, mod, this);
      let tweet_id = this.tx.transaction.sig;
      let obj = document.getElementById(tweet_id);
      let my_selector = "#"+tweet_id;

console.log("REPLACE ELEMENT BY ID: " + tweet_id);

      if (obj) {
        app.browser.replaceElementById(html, tweet_id);
      } else {
        app.browser.addElementToSelector(html, selector);
      }

console.log("X");

      for (let i = 0; i < this.children.length; i++) {
        this.children[i].render(app, mod, my_selector);        
      }
console.log("Y");

      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }

    exportData(app, mod) {
      return { text :  this.text };
    }

    async generateTweetProperties(app, mod, fetch_open_graph=0) {

      if (this.text == null) { return this; }

      let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      let links = this.text.match(expression);

      console.log('links');
      console.log(links);

      if (links != null && links.length > 0) {

	//
	// save the first link
	//
        let link = new URL(links[0]);
	this.link = link.toString();

        //
        // youtube link
        //
        if (this.link.indexOf("youtube.com") != -1) {

          let urlParams = new URLSearchParams(link.search);
          let videoId = urlParams.get('v');

          this.youtube_id = videoId;

          return this;

        }

        //
        // normal link
        //
	if (fetch_open_graph == 1) {
          let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
          if (res != '') { this.link_properties = res; }
	}

        return this;

      }

      return this;

    }


}

module.exports = RedSquareTweet;


