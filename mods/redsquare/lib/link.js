const RedSquareLinkTemplate = require("./link.template");

class RedSquareLink {

  constructor(app, mod, container = "", tweet) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.tweet = tweet;
    this.name = "RedSquareLink";

    this.src = "/saito/img/dreamscape.png";
    this.url = "";
    this.title = "";
    this.description = "";

    if (this.tweet.link_properties) {
      if (this.tweet.link_properties['og:image']) {
        this.src = this.tweet.link_properties['og:image'];
      }
      if (this.tweet.link_properties['og:url']) {
        this.url = this.tweet.link_properties['og:url'];
      }
      if (this.tweet.link_properties['og:title']) {
        this.title = this.tweet.link_properties['og:title'];
      }
      if (this.tweet.link_properties['og:description']) {
        this.description = this.tweet.link_properties['og:description'];
      }
    }

    if (this.url == "") {
      this.url = tweet.link;
    }

  }

  render() {

    //
    // replace element or insert into page
    //
    if (typeof this.tweet.link != "undefined") {

      let qs = ".tweet-" + this.tweet.tx.signature + " > .tweet-body .tweet-main .tweet-preview";

      if (document.querySelector(qs)) {
        this.app.browser.replaceElementBySelector(RedSquareLinkTemplate(this), qs);
      } else {
        this.app.browser.addElementToSelectorOrDom(RedSquareLinkTemplate(this), this.container);
      }

      this.attachEvents();
    }
  }


  attachEvents() {
  }

}

module.exports = RedSquareLink;

