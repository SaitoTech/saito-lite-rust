const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
//const SaitoEmoji = require("./../../../lib/saito/new-ui/saito-emoji/saito-emoji");

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

  render(app, mod) {
    if (document.querySelector('#redsquare-tweet-overlay') != null) {
      document.querySelector('#redsquare-tweet-overlay').parentNode.remove();
    }
    this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
    app.browser.addElementToSelector(PostTemplate(app, mod, app.wallet.returnPublicKey(), this.parent_id, this.thread_id), "#redsquare-tweet-overlay");
    //document.getElementById("post-tweet-textarea").focus();
    //this.attachEvents(app, mod);

    // this.emoji = new SaitoEmoji(app, mod, 'post-tweet-textarea');
    // this.emoji.render(app, mod);

    let post_self = this;
    
    // app.modules.mods.forEach(mod => {
    //   try {
    //     if (mod.name == "Giphy") {
    //       const SaitoGif = require("./../../giphy/giphy");
    //       post_self.gif = new SaitoGif(app, mod, "post-tweet-textarea", function (img) { post_self.addImg(img) });
    //       post_self.gif.render(app, mod);
    //     }
    //   } catch {
    //     console.log(err);
    //   }
    // });
  }

  attachEvents(app, mod) {

    let post_self = this;
    post_self.images = [];
    // if (post_self.file_event_added == false) {
    //   app.browser.addDragAndDropFileUploadToElement("redsquare-tweet-overlay",
    //     (file) => {
    //       if (this.images.length >= 4) {
    //         salert("Maximum 4 images allowed per tweet.");
    //       } else {
    //         let type = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
    //         if (mod.allowed_upload_types.includes(type)) {
    //           this.resizeImg(file, 0.75, 0.75); // (img, dimensions, quality)
    //         } else {
    //           salert("allowed file types: " + mod.allowed_upload_types.join(', '));
    //         }
    //       }

    //       post_self.file_event_added = true;
    //     },
    //     false);
    // }

    // document.querySelector('.redsquare-tweet-overlay').onclick = (e) => {

    //   if (e.target.classList.contains("fa-image")) {
    //     document.querySelector("#hidden_file_element_redsquare-tweet-overlay").click();
    //     return;
    //   }


    //   if (e.target.id === "post-tweet-button") {


    //     document.getElementById("post-tweet-loader").style.display = 'block';
    //     e.preventDefault();

    //     let text = document.getElementById('post-tweet-textarea').value;
    //     let parent_id = document.getElementById("parent_id").value;
    //     let thread_id = document.getElementById("thread_id").value;

    //     //
    //     // extract keys from text AND then tweet
    //     //
    //     let keys = app.browser.extractKeys(text);
    //     if (this.tweet != null) {
    //       for (let i = 0; i < this.tweet.tx.transaction.to.length; i++) {
    //         if (!keys.includes(this.tweet.tx.transaction.to[i].add)) {
    //           keys.push(this.tweet.tx.transaction.to[i].add);
    //         }
    //       }
    //     }

    //     //
    //     // saito-loader
    //     //
    //     post_self.overlay.hide();
    //     post_self.overlay.closebox = false;
    //     post_self.overlay.show(app, mod, '<div class="saito-loader"></div>');

    //     //
    //     // tweet data
    //     //
    //     let data = { text: text };
    //     if (parent_id !== "") {
    //       data = { text: text, parent_id: parent_id, thread_id: thread_id };
    //     }
    //     if (this.images.length > 0) {
    //       data['images'] = this.images;
    //     }

    //     //
    //     // check if posting tweet from overlay (reply tweet)
    //     // if yes then update reply counter
    //     //
    //     if (e.target.parentNode.id == 'redsquare-tweet-overlay') {
    //       if (e.target.parentNode.querySelector('.post-tweet-preview') != null) {
    //         let sig = e.target.parentNode.querySelector('.post-tweet-preview').getAttribute('data-id');
    //         let sel = ".tweet-tool-comment-count-" + sig;
    //         let obj = document.querySelector(sel);
    //         obj.innerHTML = parseInt(obj.innerHTML) + 1;
    //         if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
    //           obj.parentNode.classList.remove("saito-tweet-no-activity");
    //           obj.parentNode.classList.add("saito-tweet-activity");
    //         }
    //       }
    //     }

    //     setTimeout(() => {
    //       let newtx = mod.sendTweetTransaction(app, mod, data, keys);
    //       if (post_self.render_after_submit == 1) {
    //         mod.prependTweetFromTransaction(app, mod, newtx, true);
    //         document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
    //         // if (thread_id !== "") {
    //         //   mod.renderWithChildren(app, mod, thread_id);
    //         // } else {
    //         //   if (parent_id !== "") {
    //         //     mod.renderWithChildren(app, mod, parent_id);
    //         //   } else {
    //         //     mod.renderMainPage(app, mod);
    //         //   }
    //         // }
    //       }
    //       post_self.overlay.hide();
    //     }, 1000);

    //   }

    // }

    // if (typeof document.querySelector(".my-form") != "undefined" &&
    //   document.querySelector(".my-form") != null) {
    //   document.querySelector(".my-form").style.display = "none";
    // }
    // document.onclick = function (e) {
    //   if (typeof (e.target.classList) != 'undefined') {
    //     if (e.target.classList.contains('post-tweet-img-preview-close')) {
    //       let array_position = e.target.getAttribute("data-id");
    //       e.target.parentNode.remove();
    //       (post_self.images).splice(array_position, 1);
    //       document.querySelectorAll('.post-tweet-img-preview-close').forEach(el2 => {
    //         let array_position2 = el2.getAttribute("data-id");
    //         if (array_position2 > array_position) {
    //           el2.setAttribute("data-id", (array_position2 - 1));
    //         }
    //       });
    //     }
    //   }
    // };

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

