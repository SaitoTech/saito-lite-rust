const TweetTemplate = require("./tweet.template");

class RedSquareTweet {

    constructor(app, mod, tx) {

      this.tweet = {};

      //
      // store tx
      //
      this.tweet.tx = tx;

      this.tweet.sender     	 = tx.transaction.from[0].add;
      this.tweet.created_at 	 = tx.transaction.ts;
      this.tweet.sig 	    	 = tx.transaction.sig;

      this.tweet.text 		 = null;
      this.tweet.link 		 = null;
      this.tweet.link_properties = null;
      this.tweet.youtube_id 	 = null;

      this.tweet.children 	 = [];

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

      //
      // 0 = do not fetch open graph
      //
      this.generateProperties(app, mod, 0);

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

      console.log('links');
      console.log(links);

      if (links != null && links.length > 0) {

	//
	// save the first link
	//
        let link = new URL(links[0]);
	this.tweet.link = link.toString();

        //
        // youtube link
        //
        if (this.tweet.link.indexOf("youtube.com") != -1) {

          let urlParams = new URLSearchParams(link.search);
          let videoId = urlParams.get('v');

          this.tweet.youtube_id = videoId;

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


