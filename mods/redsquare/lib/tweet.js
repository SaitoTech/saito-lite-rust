const RedSquareTweetTemplate = require("./tweet.template");
const ImageOverlay = require("./appspace/image-overlay");
const LinkPreview = require("./link-preview");

class RedSquareTweet {

  constructor(app, mod, container = "", tx) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareTweet";

    this.tx = tx;

    this.parent_id = "";
    this.thread_id = "";
    this.updated_at = 0;

    this.children = [];
    this.children_sigs_hmap = {};
    this.unknown_children = [];
    this.unknown_children_sigs_hmap = {};
    this.critical_child = null;

    this.retweet = null;
    this.retweeters = [];
    this.retweet_tx = null;
    this.retweet_tx_sig = null;
    this.link_properties = null;

    this.setKeys(tx.msg.data);
    this.setKeys(tx.optional);

    //
    // create retweet if exists
    //
    if (this.retweet != null) {
      let newtx = new saito.default.transaction(JSON.parse(this.retweet_tx));
      this.retweet = new RedSquareTweet(this.app, this.mod, (".tweet-preview-"+this.tx.transaction.sig), newtx);
    }

    this.text =  "Og Link preview https://stackoverflow.com/questions/9346211/how-to-kill-a-process-on-a-port-on-ubuntu";
    this.generateTweetProperties(app, mod, 1);


    // subcomponents
    let tweet_container = "#tweet-"+this.tx.transaction.sig+ " > .tweet-body .tweet-preview";
    this.link_preview = new LinkPreview(app, mod, tweet_container, this);
  }

  render() {

    //
    // replace element or insert into page
    //
    // if (document.querySelector(".redsquare-menu")) {
    //   this.app.browser.replaceElementBySelector(RedSquareTweetTemplate(this.app, this.mod), ".redsquare-menu");
    // } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareTweetTemplate(this.app, this.mod, this), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareTweetTemplate(this.app, this.mod, this));
      }
    //}

    //
    // this should render any (re)tweet into the tweet-preview.
    //
    if (this.retweet != null) {
      this.retweet.render();
    }


    if (this.link_preview != null) {
      this.link_preview.render();
    }


    this.attachEvents();

  }

  attachEvents() {
    tweet_self = this;

    ///
    // view image
    //
    sel = `.tweet-picture > img`;
    if (document.querySelectorAll(sel)) {
      document.querySelectorAll(sel).forEach(img => {
        img.onclick = (e) => {
          let img = e.target;
          
          let img_overlay = new ImageOverlay(this.app, img);
          img_overlay.render(this.app, this.mod);
        }
      });
    }

  }

  setKeys(obj) {
    for (let key in obj) {
      if (typeof obj[key] !== 'undefined') {
        if (this[key] === 0 || this[key] === "" || this[key] === null) {
          this[key] = obj[key];
        }
      }
    }
  }



  addTweet(tweet, levels_deep=0) {

    //
    // still here? add in unknown children
    //
    // this means we know the comment is supposed to be somewhere in this thread/parent
    // but its own parent doesn't yet exist, so we are simply going to store it here
    // until we possibly add the parent (where we will check all unknown children) for
    // placement then.
    //
    this.unknown_children.push(tweet);
    this.unknown_children_sigs_hmap[tweet.tx.transaction.sig] = 1;

    //
    // if this tweet is the parent-tweet of a tweet we have already downloaded
    // and indexed here. this can happen if tweets arrive out-of-order.
    //
    for (let i = 0; i < this.unknown_children.length; i++) {
      if (this.unknown_children[i].parent_id === tweet.tx.transaction.sig) {

        if (this.isCriticalChild(this.unknown_children[i])) {
          this.critical_child = this.unknown_children[i];
          this.updated_at = this.critical_child.updated_at;
        }
        this.unknown_children[i].parent_tweet = tweet;

	//
	// tweet adds its orphan
	//
        tweet.addTweet(this.unknown_children[i], (levels_deep+1));

	//
	// and delete from unknown children
	//
        if (this.unknown_children_sigs_hmap[this.unknown_children[i].tx.transaction.sig]) {
	  delete this.unknown_children_sigs_hmap[this.unknown_children[i].tx.transaction.sig];
        }
        this.unknown_children.splice(i, 0);
      }
    }

    //
    // tweet is direct child
    //
    if (tweet.parent_id == this.tx.transaction.sig) {

      //
      // already added?
      //
      if (this.children_sigs_hmap[tweet.tx.transaction.sig]) {
        return 0;
      }

      //
      // make critical child if needed
      //
      if (this.isCriticalChild(tweet) || tweet.tx.transaction.ts > this.updated_at && this.critical_child == null) {
        this.critical_child = tweet;
        this.updated_at = tweet.updated_at;
      }

      //
      // prioritize tweet-threads
      //
      if (tweet.tx.transaction.from[0].add === this.tx.transaction.from[0].add) {
        this.children.unshift(tweet);
	this.children_sigs_hmap[tweet.tx.transaction.sig] == 1;
        return 1;
      } else {
        tweet.parent_tweet = this;
        this.children.push(tweet);
	this.children_sigs_hmap[tweet.tx.transaction.sig] == 1;
        return 1;
      }

    //
    // tweet belongs to a child
    //
    } else {

      //
      // maybe it is a critical child
      //
      if (this.isCriticalChild(tweet)) {
        this.critical_child = tweet;
      }

      if (this.children_sigs_hmap[tweet.parent_id]) {

        for (let i = 0; i < this.children.length; i++) {
          if (this.children[i].addTweet(tweet, (levels_deep+1))) {
	    this.children_sigs_hmap[tweet.tx.transaction.sig] = 1;
            this.updated_at = tweet.updated_at;
            return 1;
          }
        }

      } else {

        //
        // if still here, add to unknown children if top-level as we didn't add to any children
        //
        if (level == 0) {
          this.unknown_children.push(tweet);
          this.unknown_children_sigs_hmap[tweet.tx.transaction.sig] = 1;
        }

      }
    }
  }


  isCriticalChild(tweet) {
    for (let i = 0; i < tweet.tx.transaction.to.length; i++) {
      if (tweet.tx.transaction.to[i].add === this.app.wallet.returnPublicKey()) {
        if (this.critical_child == null) { return true; }
        if (tweet.tx.transaction.ts > this.critical_child.tx.transaction.tx) {
          return true;
        }
      }
    }
    return false;
  }


  async generateTweetProperties(app, mod, fetch_open_graph = 0) {

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
        console.log("Fetching open graph*************************");
        let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
        
        
        console.log("RESULT open graph*************************");
        console.log(res);
        
        if (res != '') {
          this.link_properties = res;
        }
      }

      return this;

    }

    return this;

  }




}

module.exports = RedSquareTweet;

