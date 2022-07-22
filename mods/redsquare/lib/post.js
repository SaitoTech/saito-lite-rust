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

    attachEvents(app, mod) { 

      document.getElementById("post-tweet-button").onclick = (e) => {

        e.preventDefault();
        let text = document.getElementById('post-tweet-textarea').value;
        let data = { text : text };

console.log("TEXT IS: " + text);

console.log("about to send tweet");
        mod.sendTweetTransaction(app, mod, data);  
console.log("send tweet transaction");

      }
    }

}

module.exports = Post;

