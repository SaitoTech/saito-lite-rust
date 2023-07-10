const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");
const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoInput = require("./../../../lib/saito/ui/saito-input/saito-input");
const JSON = require("json-bigint");

class Post {
  constructor(app, mod, tweet = null) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, true, true);
    this.parent_id = "";
    this.thread_id = "";
    this.images = [];
    this.tweet = tweet;

    if (tweet != null) {
      if (tweet.parent_id) {
        this.parent_id = tweet.parent_id;
        if (tweet.thread_id) {
          this.thread_id = tweet.thread_id;
        } else {
          this.thread_id = this.parent_id;
        }
      }
    }

    this.render_after_submit = 1;
    this.file_event_added = false;
    this.publickey = null;
    this.source = "Tweet";

    this.userline = "create a text-tweet or drag-and-drop images...";
    if (this.source == "Retweet / Share") {
      this.userline = "add a comment to your retweet or just click submit...";
    }

    this.user = null;
  }

  async render() {
    this.publickey = await this.app.wallet.getPublicKey();
    this.user = new SaitoUser(
      this.app,
      this.mod,
      `.tweet-overlay-header`,
      this.publickey,
      this.userline
    );

    this.overlay.show(PostTemplate(this.app, this.mod, this));

    //
    //
    //

    console.log("i am before error ///////");
    this.user.render();
    console.log("i am after error //////////");

    if (!this.input) {
      this.input = new SaitoInput(this.app, this.mod, ".tweet-overlay-content");
    }

    this.input.display = "large";

    this.input.placeholder = "What's happening";
    if (this.source == "Retweet / Share") {
      this.input.placeholder = "Optional comment?";
    }

    this.input.callbackOnReturn = async () => {
      await this.postTweet();
    };
    this.input.callbackOnUpload = async (file) => {
      if (this.images.length >= 4) {
        salert("Maximum 4 images allowed per tweet.");
      } else if (file.includes("giphy.gif")) {
        this.addImg(file);
      } else {
        let type = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
        if (this.mod.allowed_upload_types.includes(type)) {
          let resized_img = await this.app.browser.resizeImg(file);
          this.addImg(resized_img);
        } else {
          salert(`Cannot upload ${type} image, allowed file types: 
              ${this.mod.allowed_upload_types.join(", ")} 
              - this issue can be caused by image files missing common file-extensions. In this case try clicking on the image upload button and manually uploading.`);
        }
      }
    };

    this.input.render();

    this.attachEvents();
  }

  triggerClick(querySelector) {
    if (typeof document.querySelector(querySelector) != "undefined") {
      document.querySelector(querySelector).click();
    }
  }

  attachEvents() {
    let post_self = this;
    post_self.images = [];

    if (post_self.file_event_added == false) {
      post_self.app.browser.addDragAndDropFileUploadToElement(
        "tweet-overlay",
        async (file) => {
          if (post_self.images.length >= 4) {
            salert("Maximum 4 images allowed per tweet.");
          } else {
            let type = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
            if (post_self.mod.allowed_upload_types.includes(type)) {
              let resized_img = await this.app.browser.resizeImg(file);
              this.addImg(resized_img);
            } else {
              salert(
                "allowed file types: " +
                  post_self.mod.allowed_upload_types.join(", ") +
                  " - this issue can be caused by image files missing common file-extensions. In this case try clicking on the image upload button and manually uploading."
              );
            }
          }
          post_self.file_event_added = true;
        },
        false
      );
    }

    if (
      typeof document.querySelector(".my-form") != "undefined" &&
      document.querySelector(".my-form")
    ) {
      document.querySelector(".my-form").style.display = "none";
    }

    document.querySelector(".post-tweet-textarea").addEventListener("keydown", (e) => {
      if (e.keyCode === 13 && e.ctrlKey) {
        document.getElementById("post-tweet-button").click();
        e.preventDefault();
      }
    });

    document.getElementById("post-tweet-button").addEventListener("click", (e) => {
      this.postTweet();
    });
  }

  async postTweet() {
    let post_self = this;
    let text = document.getElementById("post-tweet-textarea").value;
    let parent_id = document.getElementById("parent_id").value;
    let thread_id = document.getElementById("thread_id").value;
    let source = document.getElementById("source").value;
    let keys = [];
    let identifiers = [];

    //don't send empty posts
    if (post_self.images.length == 0 && text.trim().length == 0 && post_self.source != "Retweet") {
      siteMessage("Post Empty", 1000);
      return;
    }

    //
    // extract keys from text AND then tweet
    //
    keys = post_self.app.browser.extractKeys(text);
    identifiers = post_self.app.browser.extractIdentifiers(text);

    if (this.tweet != null) {
      for (let i = 0; i < this.tweet.tx.to.length; i++) {
        if (!keys.includes(this.tweet.tx.to[i].publicKey)) {
          console.log(this.tweet.tx.to[i]);
          keys.push(this.tweet.tx.to[i].publicKey);
        }
      }
    }

    //
    // add identifiers as available
    //
    for (let i = 0; i < identifiers.length; i++) {
      let key = this.app.keychain.returnPublicKeyByIdentifier(identifiers[i]);
      if (key) {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
    }

    //
    // any previous recipients get added to "to"
    //
    if (post_self.tweet) {
      if (post_self.tweet.tx) {
        for (let i = 0; i < post_self.tweet.tx.to.length; i++) {
          if (!keys.includes(post_self.tweet.tx.to[i].publicKey)) {
            keys.push(post_self.tweet.tx.to[i].publicKey);
          }
        }
      }
    }

    if (this.tweet != null) {
      for (let i = 0; i < this.tweet.tx.to.length; i++) {
        if (!keys.includes(this.tweet.tx.to[i].publicKey)) {
          keys.push(this.tweet.tx.to[i].publicKey);
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

    if (source == "Retweet") {
      data.retweet_tx = post_self.tweet.tx.serialize();
    }

    if (post_self.images.length > 0) {
      data["images"] = post_self.images;
    }

    console.log("extracted keys ", keys, "text ", text, "this.tweet", this.tweet);
    let newtx = await post_self.mod.sendTweetTransaction(post_self.app, post_self.mod, data, keys);

    console.log("new transaction ", newtx);

    //
    // move to the top
    //
    var TweetClass = require("./tweet");
    let tweet = new TweetClass(this.app, this.mod, ".tweet-manager", newtx);
    //
    //
    //
    let rparent_id = parent_id;

    let rparent = this.mod.returnTweet(rparent_id);

    if (rparent) {
      //
      // loop to remove anything we will hide
      //
      let rparent2 = rparent;
      while (this.mod.returnTweet(rparent2.parent_id)) {
        let x = this.mod.returnTweet(rparent2.parent_id);
        let qs = ".tweet-" + x.tx.signature;
        if (document.querySelector(qs)) {
          document.querySelector(qs).remove();
        }
        rparent2 = x;
      }

      rparent.addTweet(tweet);
      this.mod.addTweet(tweet.tx);
      rparent.updated_at = new Date().getTime();
      rparent.critical_child = tweet;
      if (tweet.retweet_tx) {
        rparent.tx.optional.num_retweets++;
      } else {
        rparent.tx.optional.num_replies++;
      }
      this.app.connection.emit(
        "redsquare-home-tweet-and-critical-child-prepend-render-request",
        rparent
      );
    } else {
      this.mod.addTweet(tweet.tx);
      this.app.connection.emit("redsquare-home-tweet-prepend-render-request", tweet);
    }

    setTimeout(() => {
      if (post_self.render_after_submit == 1) {
        //
        // scroll to top
        //
        document.querySelector(".saito-container").scroll({ top: 0, left: 0, behavior: "smooth" });
      }
      post_self.overlay.hide();
    }, 500);
  }

  addImg(img) {
    post_self = this;
    this.app.browser.addElementToDom(
      `<div class="post-tweet-img-preview"><img src="${img}"
           /><i data-id="${
             this.images.length - 1
           }" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
           </div>`,
      document.getElementById("post-tweet-img-preview-container")
    );
    this.images.push(img);

    // attach img preview event
    // event added here because img-prievew is added dynamically
    let sel = ".post-tweet-img-preview-close";
    document.querySelectorAll(sel).forEach((elem) => {
      elem.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        let array_position = e.target.getAttribute("data-id");
        e.target.parentNode.remove();
        post_self.images.splice(array_position, 1);
        document.querySelectorAll(".post-tweet-img-preview-close").forEach((el2) => {
          let array_position2 = el2.getAttribute("data-id");
          if (array_position2 > array_position) {
            el2.setAttribute("data-id", array_position2 - 1);
          }
        });
      });
    });
  }
}

module.exports = Post;
