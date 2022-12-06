const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

const JSON = require('json-bigint');

class Post {

  constructor(app, mod, tweet = null) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, true, true);
    this.parent_id = "";
    this.thread_id = "";
    this.images = [];
    this.tweet = tweet;
    this.render_after_submit = 1;
    this.file_event_added = false;
    this.publickey = app.wallet.returnPublicKey();
    this.source = 'post';
  }

  render() {
    if (document.querySelector('#redsquare-tweet-overlay') != null) {
      document.querySelector('#redsquare-tweet-overlay').parentNode.remove();
    }
    this.overlay.show(this.app, this.mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
    this.app.browser.addElementToSelector(
      PostTemplate(this.app, this.mod, this)
    , "#redsquare-tweet-overlay");
  
    this.attachEvents(); 
  }

  attachEvents() {

    let post_self = this;
    post_self.images = [];

    document.getElementById('post-tweet-button').addEventListener('click', function(e) {
      let text = document.getElementById('post-tweet-textarea').value;
      let parent_id = document.getElementById("parent_id").value;
      let thread_id = document.getElementById("thread_id").value;
      let source = document.getElementById("source").value;

      //
      // extract keys from text AND then tweet
      //
      let keys = post_self.app.browser.extractKeys(text);
      if (this.tweet != null) {
        for (let i = 0; i < this.tweet.tx.transaction.to.length; i++) {
          if (!keys.includes(this.tweet.tx.transaction.to[i].add)) {
            keys.push(this.tweet.tx.transaction.to[i].add);
          }
        }
      }

      //
      // saito-loader
      //
      post_self.overlay.hide();
      post_self.overlay.closebox = false;
      post_self.overlay.show(post_self.app, post_self.mod, '<div class="saito-loader"></div>');

      //
      // tweet data
      //
      let data = { text: text };
      if (parent_id !== "") {
        data = { text: text, parent_id: parent_id, thread_id: thread_id };
      }
      if (post_self.images.length > 0) {
        data['images'] = post_self.images;
      }

      setTimeout(() => {
        let newtx = post_self.mod.sendTweetTransaction(post_self.app, post_self.mod, data, keys);
        if (post_self.render_after_submit == 1) {
          document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
        }
        post_self.overlay.hide();
      }, 1000);
    });

  }

  addImg(img) {
    this.app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${img}"
           /><i data-id="${this.images.length - 1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
           </div>`, document.getElementById("post-tweet-img-preview-container"));
    this.images.push(img);
  }

  async resizeImg(img, dimensions, quality) {
    let imgSize = img.length / 1024;
    let resized_img = await this.app.browser.resizeImg(img);
    this.addImg(resized_img);
    return resized_img;
  }

}

module.exports = Post;

