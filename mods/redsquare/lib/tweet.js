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


    async generateTweetProperties(app, mod) {

      let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      let links = this.text.match(expression);

      if (links.length > 0) {

	//
	// save the first link
	//
	this.link = links[0];

        //
        // youtube link
        //
        if (links[0].search("youtube.com") != -1) {

          let link = new URL(links[0]);
          let urlParams = new URLSearchParams(link.search);
          let videoId = urlParams.get('v');

          this.youtube_id = videoId;
          return this;

        }

        //
        // normal link
        //
        let res = await mod.fetchOpenGraphProperties(links[0]);
        if (res != '') { this.link_properties = res; }
        return this;

      }

      return this;

    }


}

module.exports = RedSquareTweet;


