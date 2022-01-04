const ArcadePostsTemplate = require('./templates/arcade-posts.template');

module.exports = ArcadePosts = {

  render(app, mod) {

console.log("RAP");

    if (!document.querySelector(".arcade-posts")) { app.browser.addElementToDom(ArcadePostsTemplate(), "arcade-sub"); }

    app.modules.respondTo("arcade-posts").forEach(module => {
      if (module != null) {
console.log("and module!");
        module.respondTo('arcade-posts').render(app, module);
      }
    });


  },


  attachEvents(app, mod) {

console.log("AAAP");
    app.modules.respondTo("arcade-posts").forEach(module => {
console.log("and module!");
      if (module != null) {
console.log("add AAAP");
        module.respondTo('arcade-posts').attachEvents(app, module);
      }
    });
  },
}
