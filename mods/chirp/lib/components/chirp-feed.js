const ChirpFeedTemplate = require("./chirp-feed.template");
const ChirpPost = require("./chirp-post");

module.exports = ChirpFeed = {

  render(app, mod) {
   
    if (!document.querySelector(".feed__header")) {
      app.browser.addElementToDom(ChirpFeedTemplate(app, mod), "feed");
    }

    for (let i = 0; i < 5; i++) {
console.log("chirp post!");
      ChirpPost.render(app, mod);
    }

    try {
    
      //
      // fetch any usernames needed
      //
      app.browser.addIdentifiersToDom();

    } catch (err) {
      console.error(err);
    }
  },

  attachEvents(app, mod) {

    for (let i = 0; i < 5; i++) {
      ChirpPost.attachEvents(app, mod);
    }

  },

};
