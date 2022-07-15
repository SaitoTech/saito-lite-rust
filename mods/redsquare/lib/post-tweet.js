const PostTweetTemplate = require("./post-tweet.template");

class TweetBox {

    constructor(app, mod) {
      //this.getIdenticon(app, mod);
    }

    render(app, mod, container = "") {
      app.browser.addElementToDom(PostTweetTemplate(app, mod), document.getElementById('redsquare-input-container'));
      this.attachEvents(app, mod);
    }

    attachEvents() { 
      let tweetBtn = document.querySelector('#redsquare-input-container button');
      tweetBtn.onclick = (e) => {
        e.preventDefault();

        let content = document.querySelector('#redsquare-input-container textarea').value;     
        let img = '';

        let data = {
          content: content,
          img: img,
          parent_id: '', 
          flagged: 0,
          moderated: 0
        };

        mod.sendTweetTransaction(data);  
      }
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


