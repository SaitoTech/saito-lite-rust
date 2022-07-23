const TweetTemplate = require("./tweet.template");
const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class RedSquareTweet {

    constructor(app, mod, tx) {

      //
      // store tx
      //
      this.tx = tx;

      this.sender     	 = tx.transaction.from[0].add;
      this.created_at 	 = tx.transaction.ts;
      this.last_updated  = tx.transaction.ts;

      this.parent_id     = "";
      this.thread_id     = "";
      this.text 	 = null;
      this.link 	 = null;
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

    attachEvents(app, mod) { 

      let sel = ".tweet-reply-" + this.tx.transaction.sig;

      document.querySelector(sel).onclick = (e) => {

          e.preventDefault();
          e.stopImmediatePropagation();

          let tweet_sig_id = el.getAttribute("data-id");

          let ptweet = new PostTweet(app, mod);
	      ptweet.parent_id = this.parent_id;
	      ptweet.thread_id = this.thread_id;
          ptweet.render(app, mod);

/*****
          let parent_tweet = $('#tweet-box-'+tweet_sig_id).clone();
          $('#redsquare-reply-tweet-overlay').append(parent_tweet);

          $(parent_tweet).find('.redsquare-tweet-tools').hide();

          // TO-DO move this to template file and append it from there
          $(parent_tweet).append('<div class="tweet-reply-container" data-id="'+tweet_sig_id+'">' +  
          '<textarea rows="5" class="reply-tweet-textarea" id="reply-tweet-textarea" name="post-tweet-textarea" placeholder="Type your reply" cols="60"></textarea>'+
          '<div class="saito-button-primary post-reply-tweet-button" id="post-reply-tweet-button" style="display: inline-block;">Reply</div></div>');
*****/

      };


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
	} else { 
	  this.children.push(tweet);
	}
      } else {
        for (let i = 0; i < this.children.length; i++) {
          let x = this.children[i].addTweet(app, mod, tweet); 
	  if (x == 1) { this.last_updated = tweet.last_updated; }
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

    render(app, mod, selector = "") {

      let html = TweetTemplate(app, mod, this);
      let tweet_id = this.tx.transaction.sig;
      let obj = document.getElementById(tweet_id);
      let my_selector = "#"+tweet_id;

      if (obj) {
        app.browser.replaceElementById(html, tweet_id);
      } else {
        app.browser.addElementToSelector(html, selector);
      }

      for (let i = 0; i < this.children.length; i++) {
        this.children[i].render(app, mod, my_selector);        
      }

      this.attachEvents(app, mod);
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


