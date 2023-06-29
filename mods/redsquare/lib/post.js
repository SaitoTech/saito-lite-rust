const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");
const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoEmoji = require("./../../../lib/saito/ui/saito-emoji/saito-emoji");
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
    this.publickey = app.wallet.publicKey;
    this.source = "Tweet";

    let userline = "create a text-tweet or drag-and-drop images...";
    if (this.source == "Retweet / Share") {
      userline = "add a comment to your retweet or just click submit...";
    }

    this.user = new SaitoUser(
      this.app,
      this.mod,
      `.tweet-overlay-header`,
      this.publickey,
      userline
    );
  }

  render() {
    this.overlay.show(PostTemplate(this.app, this.mod, this));

    //
    //
    //
    this.user.render();

    this.emoji = new SaitoEmoji(
      this.app,
      this.mod,
      "post-tweet-textarea",
      ".saito-emoji-icon-container"
    );
    this.emoji.render();

    let post_self = this;
    this.app.modules.mods.forEach((mod) => {
      try {
        if (mod.name == "Giphy") {
          const SaitoGif = require("./../../giphy/giphy");
          post_self.gif = new SaitoGif(
            post_self.app,
            post_self.mod,
            "post-tweet-textarea",
            function (img) {
              post_self.addImg(img);
            }
          );
          post_self.gif.render(this.app, this.mod);
        }
      } catch (err) {
        console.log(err);
      }
    });

    this.attachEvents();
  }

  attachEvents() {
    let post_self = this;
    post_self.images = [];

    if (post_self.file_event_added == false) {
      post_self.app.browser.addDragAndDropFileUploadToElement(
        "tweet-overlay",
        (file) => {
          if (post_self.images.length >= 4) {
            salert("Maximum 4 images allowed per tweet.");
          } else {
            let type = file.substring(file.indexOf(":") + 1, file.indexOf(";"));
            if (post_self.mod.allowed_upload_types.includes(type)) {
              post_self.resizeImg(file, 0.75, 0.75); // (img, dimensions, quality)
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

    document.getElementById("post-tweet-img-icon").addEventListener("click", function (e) {
      document.querySelector("#hidden_file_element_tweet-overlay").click();
      return;
    });

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

    document.getElementById("post-tweet-button").addEventListener("click", async (e) => {
      let text = document.getElementById("post-tweet-textarea").value;

      let parent_id = document.getElementById("parent_id").value;
      let thread_id = document.getElementById("thread_id").value;
      let source = document.getElementById("source").value;
      let keys = [];
      let identifiers = [];

      //don't send empty posts
      if (
        post_self.images.length == 0 &&
        text.trim().length == 0 &&
        post_self.source != "Retweet"
      ) {
        siteMessage("Post Empty", 1000);
        return;
      }

      //
      // extract keys from text AND then tweet
      //
      keys = post_self.app.browser.extractKeys(text);

      console.log(text, keys, "extracted keys and text");
      identifiers = post_self.app.browser.extractIdentifiers(text);

      if (this.tweet != null) {
        for (let i = 0; i < this.tweet.tx.transaction.to.length; i++) {
          if (!keys.includes(this.tweet.tx.transaction.to[i].add)) {
            keys.push(this.tweet.tx.transaction.to[i].add);
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
          if (post_self.tweet.tx.transaction) {
            for (let i = 0; i < post_self.tweet.tx.transaction.to.length; i++) {
              if (!keys.includes(post_self.tweet.tx.transaction.to[i].add)) {
                keys.push(post_self.tweet.tx.transaction.to[i].add);
              }
            }
          }
        }
      }

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

      if (source == "Retweet") {
        data.retweet_tx = post_self.tweet.tx.serialize_to_web(this.app);
      }

      if (post_self.images.length > 0) {
        data["images"] = post_self.images;
      }

      console.log(keys, "keys");

      let newtx = await post_self.mod.sendTweetTransaction(
        post_self.app,
        post_self.mod,
        data,
        keys
      );

      //
      // move to the top
      //
      var TweetClass = require("./tweet");
      let tweet = new TweetClass(this.app, this.mod, ".redsquare-appspace-body", newtx);
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
          document
            .querySelector(".saito-container")
            .scroll({ top: 0, left: 0, behavior: "smooth" });
        }
        post_self.overlay.hide();
      }, 500);
    });
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

  async resizeImg(img, dimensions, quality) {
    let imgSize = img.length / 1024;
    let resized_img = await this.app.browser.resizeImg(img);
    this.addImg(resized_img);
    return resized_img;
  }
}

module.exports = Post;
