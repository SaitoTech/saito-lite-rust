const TweetBoxTemplate = require("./tweet-box.template");

class TweetBox {

    constructor(app, mod, tweet) {
      this.tweet_item = tweet;
      this.getIdenticon(app, mod);
    }

    render(app, mod, container = "") {

      console.log('inside tweet item');
      console.log(this.tweet_item);
      app.browser.addElementToDom(TweetBoxTemplate(app, mod, this.tweet_item), 'redsquare-list');
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
      $('.tweet-tool-like').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        let parent = $(this).parent().parent();
        let tweet_id = $(parent).attr('data-tweet-id');


        mod.sendLikeTweetTransaction(tweet_id);

        $(this).addClass('liked');
        let like_count = $(this).find('.tweet-like-count').text();
        $(this).find('.tweet-like-count').text(like_count+1);
      });

    }

    getIdenticon(app, mod) {
      let identicon = "";
      name = app.keys.returnUsername(this.tweet_item.publickey);

      if (name != "") {
        if (name.indexOf("@") > 0) {
          name = name.substring(0, name.indexOf("@"));
        }
      }

      identicon = app.keys.returnIdenticon(name);
      this.tweet_item.identicon = identicon;
    }
}

module.exports = TweetBox;


