const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class Post {

    constructor(app, mod) {
      this.overlay = new SaitoOverlay(app, mod);
      this.parent_id = "";
      this.thread_id = "";
      this.images = [];
    }

    render(app, mod) {

      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(PostTemplate(app, mod, app.wallet.returnPublicKey(), this.parent_id, this.thread_id), "#redsquare-tweet-overlay");
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 

      app.browser.addDragAndDropFileUploadToElement("redsquare-tweet-overlay", (file) => {
alert("image uploaded");
        this.images.push(file);
      }, false);


      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let parent_id = document.getElementById("parent_id").value;
        let thread_id = document.getElementById("thread_id").value;
        let data = { text : text };
        if (parent_id !== "") {
          data = { text : text , parent_id : parent_id , thread_id : thread_id };
        }
        if (this.images.length > 0) {
          data['images'] = this.images;
        }

        let newtx = mod.sendTweetTransaction(app, mod, data);  
	mod.addTweetFromTransaction(app, mod, newtx);

        if (thread_id !== "") {
	  mod.renderMainPage(app, mod);
	} else {
  	  mod.renderWithChildren(app, mod, thread_id);
	}

	this.overlay.hide();

      }
    }

}

module.exports = Post;

