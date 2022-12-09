const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoEmoji = require("./../../../lib/saito/ui/saito-emoji/saito-emoji");

const JSON = require('json-bigint');

class Post {

  constructor(app, mod, tweet = null) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, true, true);
    this.parent_id = "";
    this.thread_id = "";
    this.images = [];
    this.tweet = tweet;
    this.render_after_submit = 1;
    this.file_event_added = false;
    this.publickey = app.wallet.returnPublicKey();
    this.source = 'Tweet';
  }

  render() {
    if (document.querySelector('#redsquare-tweet-overlay') != null) {
      document.querySelector('#redsquare-tweet-overlay').parentNode.remove();
    }
    this.overlay.show('<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
    this.app.browser.addElementToSelector(
      PostTemplate(this.app, this.mod, this)
    , "#redsquare-tweet-overlay");

    this.emoji = new SaitoEmoji(this.app, this.mod, 'post-tweet-textarea');
    this.emoji.render();

    let post_self = this;
    this.app.modules.mods.forEach(mod => {
      try {
        if (mod.name == "Giphy") {
          const SaitoGif = require("./../../giphy/giphy");
          post_self.gif = new SaitoGif(post_self.app, post_self.mod, "post-tweet-textarea", function (img) { post_self.addImg(img) });
          post_self.gif.render(app, mod);
        }
      } catch {
        console.log(err);
      }
    });
  
    this.attachEvents(); 
  }

  attachEvents() {

    let post_self = this;
    post_self.images = [];

    if (post_self.file_event_added == false) {
      post_self.app.browser.addDragAndDropFileUploadToElement("redsquare-tweet-overlay",
        (file) => {
          if (post_self.images.length >= 4) {
            salert("Maximum 4 images allowed per tweet.");
          } else {
            let type = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
            if (post_self.mod.allowed_upload_types.includes(type)) {
              post_self.resizeImg(file, 0.75, 0.75); // (img, dimensions, quality)
            } else {
              salert("allowed file types: " + mod.allowed_upload_types.join(', '));
            }
          }

          post_self.file_event_added = true;
        },
        false);
    }


    document.getElementById('post-tweet-img-icon').addEventListener('click', function(e) {
      document.querySelector("#hidden_file_element_redsquare-tweet-overlay").click();
      return;
    });

    
    if (typeof document.querySelector(".my-form") != "undefined" &&
      document.querySelector(".my-form") != null) {
      document.querySelector(".my-form").style.display = "none";
    }

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
      post_self.overlay.show('<div class="saito-loader"></div>');

      //
      // tweet data
      //
      let data = { text: text };
      if (parent_id !== "") {
        data = { text: text, parent_id: parent_id, thread_id: thread_id };
      }

      if (source == 'Retweet / Share') {
        data.retweet_tx = JSON.stringify(post_self.tweet.tx.transaction);
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
    post_self = this;
    this.app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${img}"
           /><i data-id="${this.images.length - 1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
           </div>`, document.getElementById("post-tweet-img-preview-container"));
    this.images.push(img);
    
    // attach img preview event
    // event added here because img-prievew is added dynamically 
    let sel = ".post-tweet-img-preview-close";
    document.querySelectorAll(sel).forEach(elem => { 
      elem.addEventListener('click', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        let array_position = e.target.getAttribute("data-id");
        e.target.parentNode.remove();
        (post_self.images).splice(array_position, 1);
        document.querySelectorAll('.post-tweet-img-preview-close').forEach(el2 => {
          let array_position2 = el2.getAttribute("data-id");
          if (array_position2 > array_position) {
            el2.setAttribute("data-id", (array_position2 - 1));
          }
        });
      });
    });

  }

  async resizeImg(img, dimensions, quality) {
    let imgSize = img.length / 1024;
    let resized_img = await this.app.browser.resizeImg(img);
    this.addImg(resized_img);
    return resized_img;
  }

}

module.exports = Post;

