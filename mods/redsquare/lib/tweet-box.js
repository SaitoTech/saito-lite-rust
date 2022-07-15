const TweetBoxTemplate = require("./tweet-box.template");

class TweetBox {

    constructor(app, mod, tx) {
      this.tweet = tx;
    }

    render(app, mod, container = "") {
      app.browser.addElementToDom(TweetBoxTemplate(app, mod, this.tweet), document.getElementById('redsquare-list'));
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 


      $('.tweet-tool-like').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        let parent = $(this).parent().parent();
        let tweet_id = $(parent).attr('data-id');


        mod.sendLikeTweetTransaction(tweet_id);

        $(this).addClass('liked');
        let like_count = $(this).find('.tweet-like-count').text();
        $(this).find('.tweet-like-count').text(like_count+1);
      });

    }
}

module.exports = TweetBox;


