const ChirpPostTemplate = require("./chirp-post.template");

module.exports = ChirpPost = {

  render(app, mod) {
    app.browser.prependElementToDom(ChirpPostTemplate(), document.getElementById("posts"));
  },

  attachEvents(app, mod) {
  },

};
