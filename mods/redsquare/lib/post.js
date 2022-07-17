const PostTemplate = require("./post.template");

class Post {

    constructor(app, mod, selector = "") {
      this.selector = selector;
    }

    render(app, mod, selector = "") {

console.log("RENDERING w/ THIS.SELECTOR: " + this.selector);
      if (selector === "" || this.selector !== "") { selector = this.selector; }

console.log("RENDERING POST INTO: " + selector);

      app.browser.addElementToSelector(PostTemplate(app, mod), selector);  

console.log("TEMPLATE ADDED: " + selector);

      this.attachEvents(app, mod);

    }

    attachEvents() { 

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();

        let data = {
          content: document.getElementById('post-tweet-textarea').value,
        };

        mod.sendTweetTransaction(data);  
      }
    }

}

module.exports = Post;

