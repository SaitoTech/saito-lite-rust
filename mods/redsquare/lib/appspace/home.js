const AppspaceHomeTemplate = require("./home.template");
const Post = require("./../post");



class AppspaceHome {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceHome";
  }

  render() {

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    //
    //
    //
    for (let i = 0; i < this.mod.tweets.length; i++) {
      this.mod.tweets[i].container = ".redsquare-home";
      this.mod.tweets[i].render();
    }

    this.attachEvents();
  }  

  attachEvents() {

    document.getElementById("redsquare-tweet").onclick = (e) => {
      let post = new Post(this.app, this);
      post.render();
    }

    document.getElementById("redsquare-profile").onclick = (e) => {
      this.app.connection.emit('redquare-profile-render-request', app.wallet.returnPublicKey());
    }

  }

}

module.exports = AppspaceHome;



