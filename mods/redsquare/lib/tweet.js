const TweetTemplate = require("./tweet.template");
const PostTweet = require("./post");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class RedSquareTweet {

    constructor(app, mod, tx) {

      //
      // store tx
      //
      this.tx = tx;

      this.sender     	 = tx.transaction.from[0].add;
      this.created_at 	 = tx.transaction.ts;
      this.updated_at    = tx.transaction.ts;

      this.parent_id     = "";
      this.thread_id     = "";
      this.text 	 = null;
      this.link 	 = null;
      this.link_properties = null;
      this.youtube_id 	 = null;
      
      this.children 	 = [];

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

      if (this.parent_id === "") {
        this.parent_id = tx.transaction.sig;
      }
      if (this.thread_id === "") {
        this.thread_id = tx.transaction.sig;
      }
      // prefer server-provided updated-info as it will have context for TX-order
      if (tx.optional?.updated_at) {
	this.updated_at = tx.optional.updated_at; 
      }


      //
      // 0 = do not fetch open graph
      //
      this.generateTweetProperties(app, mod, 0);

    }

    returnTweet(app, mod, sig) {
      if (this.tx.transaction.sig === sig) { return this; }
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].returnTweet(app, mod, sig) != null) {
	  return this.children[i].returnTweet(app, mod, sig);
	}
      }
      return null;
    }


    render(app, mod, selector = "") {

      let html = TweetTemplate(app, mod, this);
      let tweet_id = "tweet-box-" + this.tx.transaction.sig;
      let tweet_div = "#"+tweet_id;
      let obj = document.getElementById(tweet_div);
//      let my_selector = "#tweet-box-"+
console.log("rendering into: " + selector);

      if (obj) {
        app.browser.replaceElementById(html, tweet_id);
      } else {
        app.browser.addElementToSelector(html, selector);
      }

//      for (let i = 0; i < this.children.length; i++) {
//        this.children[i].render(app, mod, my_selector);        
//      }

      this.attachEvents(app, mod);
    }

    renderWithChildren(app, mod, selector = "") {

      let html = TweetTemplate(app, mod, this);
      let tweet_id = "tweet-box-" + this.tx.transaction.sig;
      let tweet_div = "#"+tweet_id;
      let obj = document.getElementById(tweet_div);
      let my_selector = ".redsquare-item-children-"+this.tx.transaction.sig;

console.log("rendering into: " + selector);

      if (obj) {
        app.browser.replaceElementById(html, tweet_id);
      } else {
        app.browser.addElementToSelector(html, selector);
      }

      if (this.children.length > 0) {
        if (this.children[0].tx.transaction.from[0].add === this.tx.transaction.from[0].add) {
	  this.children[0].renderWithChildren(app, mod, my_selector);
	} else {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].render(app, mod, my_selector);        
          }
        }
      }

      this.attachEvents(app, mod);
    }



    attachEvents(app, mod) { 

      //
      // render tweet with children
      //
      let sel = "#tweet-box-" + this.tx.transaction.sig;
      document.querySelector(sel).onclick = (e) => {

          e.preventDefault();
          e.stopImmediatePropagation();

          let el = e.currentTarget;

          let tweet_sig_id = el.getAttribute("data-id");

	  document.querySelector(".redsquare-list").innerHTML = "";
	  mod.renderWithChildren(app, mod, tweet_sig_id);

      };


      //
      // reply to tweet
      //
      sel = ".tweet-reply-" + this.tx.transaction.sig;
      document.querySelector(sel).onclick = (e) => {

          e.preventDefault();
          e.stopImmediatePropagation();

          let ptweet = new PostTweet(app, mod);
	      ptweet.parent_id = this.tx.transaction.sig;
	      ptweet.thread_id = this.thread_id;
          ptweet.render(app, mod);

	  let html = TweetTemplate(app, mod, this);
	  app.browser.prependElementToSelector(`<div class="post-tweet-preview">${html}</div>`, ".redsquare-tweet-overlay");

      };

/*******
      $('.tweet-reply-container').on('click', "#post-reply-tweet-button", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      
        let text = $('#reply-tweet-textarea').val();
        let parent_id = $(this).parent().attr('data-id');
        let thread_id = $(this).parent().attr('data-thread-id') || parent_id;

        let data = { 
          text: text,
          parent_id: parent_id,
          thread_id: thread_id 
        };

        // CURRENTLY BROKEN
        mod.sendTweetTransaction(app, mod, data);  
      });
****/
    }



    addTweet(app, mod, tweet) {
      if (tweet.parent_id == this.tx.transaction.sig) {
        for (let i = 0; i < this.children.length; i++) {
	  if (this.children[i].tx.transaction.sig === tweet.tx.transaction.sig) {
	    return 1;
	  }
        }
        this.last_updated = tweet.last_updated;
        if (tweet.tx.transaction.from[0].add === this.tx.transaction.from[0].add) {

	    this.children.unshift(tweet);
	    let qs = "#tweet-box-"+this.tx.transaction.sig;
	    let obj = document.querySelector(qs);
	    if (obj) { this.render(app, mod); }

	  return 1;

	} else { 

	    this.children.push(tweet);
	    let qs = "#tweet-box-"+this.tx.transaction.sig;
	    let obj = document.querySelector(qs);
	    if (obj) { this.render(app, mod); }

	  return 1;
	}
      } else {
        for (let i = 0; i < this.children.length; i++) {
          let x = this.children[i].addTweet(app, mod, tweet); 
	  if (x == 1) { 
	    this.last_updated = tweet.last_updated; 

	    let qs = "#tweet-box-"+this.tx.transaction.sig;
	    let obj = document.querySelector(qs);
	    if (obj) { this.render(app, mod); }

	  }
	  return x;
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

    exportData(app, mod) {
      return { text :  this.text };
    }

    async generateTweetProperties(app, mod, fetch_open_graph=0) {

      if (this.text == null) { return this; }

      let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      let links = this.text.match(expression);

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


