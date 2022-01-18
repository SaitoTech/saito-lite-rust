const PostMainTemplate = require('./post-main.template');
const PostTeaserTemplate = require('./post-teaser.template');
const PostForums = require('./post-forums');
const PostForumsTemplate = require('./post-forums.template');
const PostForumsThreadTemplate = require('./post-forums-thread.template');
const PostView = require('./../post-overlay/post-view');

module.exports = PostMain = {

  render(app, mod) {

    mod.renderMethod = "main";

    if (app.browser.returnURLParameter("forum")) {
      mod.forum = app.browser.returnURLParameter("forum");
    } else {
      mod.forum = "";
    }

    //
    // add parent wrapping class
    //
    if (mod.forum === "") {
      if (!document.getElementById("post-container")) {
        app.browser.addElementToDom('<div id="post-container" class="post-container"></div>');
      }
      if (!document.querySelector(".post-forums")) { 
        app.browser.addElementToDom(PostForumsTemplate(app, mod), "post-container"); 
        PostForums.render(app, mod);
        PostForums.attachEvents(app, mod);
      }
    } else {
      if (!document.getElementById("post-container")) {
        app.browser.addElementToDom('<div id="post-container" class="post-container"></div>');
      }
      if (!document.querySelector(".post-main")) { 
        app.browser.addElementToDom(PostMainTemplate(app, mod), "post-container"); 
      }
      for (let i = mod.posts.length-1; i >= 0; i--) {
        this.addPost(app, mod, mod.posts[i]);
      }
    }


  },


  attachEvents(app, mod) {

    document.querySelectorAll('.post-teaser-title').forEach(el => { 
      el.onclick = (e) => {
	let sig = e.currentTarget.getAttribute("data-id");
        PostView.render(app, mod, sig);
        PostView.attachEvents(app, mod, sig);
      }
    });

    document.querySelectorAll('.post-teaser-comments').forEach(el => { 
      el.onclick = (e) => {
	let sig = e.currentTarget.getAttribute("data-id");
        PostView.render(app, mod, sig);
        PostView.attachEvents(app, mod, sig);
      }
    });


  },

  addPost(app, mod, post) {
    let post_this = 1;
    document.querySelectorAll('.post-teaser').forEach(el => {
      let sig = el.getAttribute("data-id");
      if (sig === post.transaction.sig) { post_this = 0; }
    });
    if (post_this == 0) { return; }
    app.browser.prependElementToDom(PostTeaserTemplate(app, mod, post), document.getElementById("post-posts"));
  }


}

