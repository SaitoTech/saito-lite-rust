const TweetTemplate = require("./tweet.template");

class RedSquareTweet {

    constructor(app, mod, tx) {

      this.tweet = {};

      this.tweet.tx = tx;

      this.tweet.sender = tx.transaction.from[0].add;
      this.tweet.created_at = tx.transaction.ts;
      this.tweet.text = null;
      this.tweet.html = null;
      this.tweet.link = null;
      this.tweet.link_properties = null;
      this.tweet.youtube_id = null;

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

    }

    setKeys(obj) {
      for (let key in obj) { 
        if (typeof obj[key] != 'undefined') {
          if (this.tweet[key] === "" || this.tweet[key] === null) {
            this.tweet[key] = obj[key];  
          }
        }
      }
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(TweetTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }


    exportData(app, mod) {
      return { text :  this.tweet.text };
    }


    async generateTweetProperties(app, mod, fetch_open_graph=0) {

      if (this.tweet.text == null) { return this; }

      let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      let links = this.tweet.text.match(expression);

      if (links.length > 0) {

console.log("save the first link...");

	//
	// save the first link
	//
        let link = new URL(links[0]);
	this.tweet.link = link.toString();

        //
        // youtube link
        //
        if (this.tweet.link.indexOf("youtube.com") != -1) {

console.log("HERE WE ARE: " + this.tweet.link);

          let urlParams = new URLSearchParams(link.search);
          let videoId = urlParams.get('v');

          this.tweet.youtube_id = videoId;

console.log("video id: " + this.tweet.youtube_id);

          return this;

        }

        //
        // normal link
        //
	if (fetch_open_graph == 1) {
          let res = await mod.fetchOpenGraphProperties(app, mod, this.tweet.link);
          if (res != '') { this.tweet.link_properties = res; }
	}

        return this;

      }

      return this;

    }


}

module.exports = RedSquareTweet;


