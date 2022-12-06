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
  }

  render() {
    if (document.querySelector('#redsquare-tweet-overlay') != null) {
      document.querySelector('#redsquare-tweet-overlay').parentNode.remove();
    }
    this.overlay.show(this.app, this.mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
    this.app.browser.addElementToSelector(
      PostTemplate(this.app, this.mod, this.app.wallet.returnPublicKey(), this.parent_id, this.thread_id)
    , "#redsquare-tweet-overlay");
  
    this.attachEvents(); 
  }

  attachEvents() {

    let post_self = this;
    post_self.images = [];

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

