const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class Post {

    constructor(app, mod) {
      this.overlay = new SaitoOverlay(app, mod);
      this.parent_id = "";
      this.thread_id = "";
    }

    render(app, mod) {

console.log("rending post overlay");
console.log("parent_id: " + this.parent_id);
console.log("thread_id: " + this.thread_id);

      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(PostTemplate(app, mod, app.wallet.returnPublicKey(), this.parent_id, this.thread_id), "#redsquare-tweet-overlay");
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let parent_id = document.getElementById("parent_id").value;
        let thread_id = document.getElementById("thread_id").value;
        let data = { text : text };
        if (parent_id !== "") {
          data = { text : text , parent_id : parent_id , thread_id : thread_id };
        }

        mod.sendTweetTransaction(app, mod, data);  
	this.overlay.hide();

      }
    }

}

module.exports = Post;

