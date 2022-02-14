const ArcadePostsTemplate = require('./arcade-posts.template');
const PostTeaserTemplate = require('./post-teaser.template');
const PostView = require('./../post-overlay/post-view');
const PostCreate = require('./../post-overlay/post-create');

module.exports = ArcadePosts = {

  render(app, mod) {
    mod.renderMethod = "arcade";
    try {
      if (!document.getElementById("arcade-posts-container")) {
        app.browser.addElementToDom(ArcadePostsTemplate());
      }
      for (let i = mod.forums.length-1; i >= 0; i--) {
        console.log(mod.forums[i]);
        this.updateForum(app, mod, mod.forums[i]);
      }
      for (let i = mod.posts.length-1; i >= 0; i--) {
        console.log("rendering: " + mod.posts[i].transaction.sig);
        this.addPost(app, mod, mod.posts[i]);
      }
    } catch (err) {
      console.error(err);
    }
  },

  attachEvents(app, mod) {

    try {

      document.querySelectorAll('.arcade-post-title, .arcade-post-comments').forEach(el => {
        el.onclick = (e) => {
          let clickLocation = e.currentTarget.id.replace("arcade-post-", "");
          app.browser.logMatomoEvent("Posts", "ArcadePostsViewClick", clickLocation);
          let sig = e.currentTarget.getAttribute("data-id");
          PostView.render(app, mod, sig);
          PostView.attachEvents(app, mod, sig);
        }
      });

      document.querySelector('.arcade-posts-add').onclick = (e) => {
        PostCreate.render(app, mod);
        PostCreate.attachEvents(app, mod);

	// are we in a subforum
	let x = app.browser.returnURLParameter("game");
	if (x) {
	  let obj = document.querySelector(".post-create-forum");
	  if (obj) {
	    obj.value = x;
	  }
	}

      }
    } catch (err) {
    }

  },

  addPost(app, mod, post) {
    console.log(post);
    let post_this = 1;
    document.querySelectorAll('.arcade-post').forEach(el => {
      let sig = el.getAttribute("data-id");
      if (sig === post.transaction.sig) { post_this = 0; }
    });
    if (post_this == 0) { return; }
    app.browser.prependElementToDom(PostTeaserTemplate(app, mod, post), document.getElementById("arcade-posts-container"));
  },


  updateForum(app, mod, forum) {
    console.log(forum);
    let txmsg = forum.returnMessage();
    let topic = txmsg.forum;
    let divid = "forum-topic-"+topic;
    let fuser = app.keys.returnUsername(forum.transaction.from[0].add);
    let fdate = datetimeRelative(forum.transaction.ts);
    let fpost_num = forum.post_num;
    let fuid  = app.keys.returnIdenticon(forum.transaction.from[0].add);

    let ptitle = txmsg.title;
    if (ptitle.indexOf("\n") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("\n")); }
    if (ptitle.indexOf("<div>") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("<div>")); }
    if (ptitle.indexOf("<br") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("<br")); }
    if (ptitle.length > 80) { ptitle = ptitle.substring(0, 80) + "..."; }
   
    try {
      let postTitle = document.querySelector(`#arcade-post-latest-forum-topic-${topic}`);
      postTitle.innerHTML = ptitle;
      postTitle.setAttribute("data-id", forum.transaction.sig);
      document.querySelector(`#forum-topic-latest-post-user-${topic}`).innerHTML = fuser;
      document.querySelector(`#forum-topic-latest-post-date-${topic}`).innerHTML = fdate;
      document.querySelector(`#forum-topic-posts-num-${topic}`).innerHTML = fpost_num;

      document.querySelector(`#forum-topic-latest-post-image-${topic}`).style.visibility = "visible";
      document.querySelector(`#forum-topic-posts-${topic}`).style.visibility = "visible";
      document.querySelector(`#forum-topic-posts-num-${topic}`).style.visibility = "visible";
      document.querySelector(`#forum-topic-latest-post-${topic}`).style.visibility = "visible";
      document.querySelector(`#forum-topic-latest-post-image-${topic}`).innerHTML = `<img src="${fuid}" class="identicon" />`;

      if (fpost_num == 1) {
        document.querySelector(`#forum-topic-posts-text-${topic}`).innerHTML = "post";
      } else {
        document.querySelector(`#forum-topic-posts-text-${topic}`).innerHTML = "posts";
      }
    } catch (err) { 
      console.error(err);
    }

  }

}
