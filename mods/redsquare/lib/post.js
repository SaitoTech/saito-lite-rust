const PostTemplate = require("./post.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class Post {

    constructor(app, mod) {
      this.overlay = new SaitoOverlay(app, mod);
    }

    render(app, mod) {

      this.overlay.show(app, mod, '<div id="redsquare-tweet-overlay" class="redsquare-tweet-overlay"></div>');
      app.browser.addElementToSelector(PostTemplate(app, mod, app.wallet.returnPublicKey()), "#redsquare-tweet-overlay");
      this.attachEvents(app, mod);

    }

    attachEvents(app, mod) { 

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let text = document.getElementById('post-tweet-textarea').value;
        let data = { text : text };

        mod.sendTweetTransaction(app, mod, data);  
	this.overlay.hide();

      }
    }

}

module.exports = Post;

