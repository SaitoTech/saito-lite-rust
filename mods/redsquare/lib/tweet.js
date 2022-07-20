const TweetTemplate = require("./tweet.template");
const LinkPreview = require("./link-preview");

class RedSquareTweet {

    constructor(app, mod, tx) {
      this.tweet = {};
      this.tweet.tx = tx;
      this.tweet.has_link = true;
      this.tweet.link_data = {};

      this.setKeys(tx.msg.data);
      this.setKeys(tx.optional);

      this.convertToHtml(app, mod, tx);
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(TweetTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }


    setKeys(obj) {
      for (let key in obj) { 
        if (typeof obj[key] != 'undefined') 
          this.tweet[key] = obj[key];  
      }
    }


    convertToHtml(app, mod, tx){
      var data = { key: "ac34f76a351cc3c6b1afedc3ea9beec5", q: "https://www.facebook.com" };

      fetch("https://api.linkpreview.net", {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((response) => {
          console.log(response);

          let link = new LinkPreview(app, mod, response);
          link.render(app, mod, "#link-preview-"+ tx.transaction.sig);
        });
      
    }


    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareTweet;


