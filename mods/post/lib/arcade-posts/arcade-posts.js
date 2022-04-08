const ArcadePostsTemplate = require('./arcade-posts.template');
const PostTeaserTemplate = require('./post-teaser.template');
const PostView = require('./../post-overlay/post-view');
const PostCreate = require('./../post-overlay/post-create');
const JSON = require("json-bigint");

module.exports = ArcadePosts = {

  render(app, mod) {
    mod.renderMethod = "arcade";
    try {
      if (!document.getElementById("arcade-posts")) {
        app.browser.addElementToDom(ArcadePostsTemplate());
      }
      if (mod.posts.length > 0){
        document.querySelector("#arcade-posts-container").innerHTML = "";
      }

      for (let i = mod.forums.length-1; i >= 0; i--) {
        //console.log("rendering forum: " + JSON.stringify(mod.forums[i]));
        this.updateForum(app, mod, mod.forums[i]);
      }
      
      for (let i = mod.posts.length-1; i >= 0; i--) {
        //console.log("rendering posts: " + JSON.stringify(mod.posts[i]));
        this.addPost(app, mod, mod.posts[i]);
      }
    } catch (err) {
      console.log(err);
    }
  },

  attachEvents(app, mod) {

    try {

      document.querySelectorAll('.arcade-post-title, .arcade-post-comments, .forum-topic-latest-post').forEach(el => {
        el.onclick = (e) => {
          let clickLocation = e.currentTarget.id.replace("arcade-post-", "");
          clickLocation = clickLocation.replace("forum-topic-","");
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
    //console.log(post);
    let post_this = 1;
    document.querySelectorAll('.arcade-post').forEach(el => {
      let sig = el.getAttribute("data-id");
      if (sig === post.transaction.sig) { post_this = 0; }
    });
    if (post_this == 0) { return; }
    app.browser.prependElementToDom(PostTeaserTemplate(app, mod, post), document.getElementById("arcade-posts-container"));
  },


  updateForum(app, mod, forum) {

    let txmsg = forum.returnMessage();
    let topic = txmsg.forum;
    let divid = "forum-topic-"+topic;
    let fuser = app.keys.returnUsername(forum.transaction.from[0].add);
    let fdate = datetimeRelative(forum.transaction.ts);
    let fpost_num = forum.post_num;
    let fuid  = app.keys.returnIdenticon(forum.transaction.from[0].add);
    //console.log(txmsg.forum);
    let ptitle = txmsg.title;
    if (ptitle.indexOf("\n") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("\n")); }
    if (ptitle.indexOf("<div>") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("<div>")); }
    if (ptitle.indexOf("<br") > 0) { ptitle = ptitle.substring(0, ptitle.indexOf("<br")); }
    if (ptitle.length > 80) { ptitle = ptitle.substring(0, 80) + "..."; }

    try {
 
      document.querySelector(`#forum-topic-latest-post-title-${topic}`).innerHTML = sanitize(ptitle);
      document.querySelector(`#forum-topic-latest-post-user-${topic}`).innerHTML = sanitize(fuser);
      document.querySelector(`#forum-topic-latest-post-date-${topic}`).innerHTML = sanitize(fdate);
      document.querySelector(`#forum-topic-posts-num-${topic}`).innerHTML = sanitize(fpost_num);

      if (fpost_num == 1) {
        document.querySelector(`#forum-topic-posts-text-${topic}`).innerHTML = "post";
      } else {
        document.querySelector(`#forum-topic-posts-text-${topic}`).innerHTML = "posts";
      }

      document.querySelector(`#forum-topic-posts-${topic}`).style.visibility = "visible";
      let lastEntry = document.querySelector(`#forum-topic-latest-post-${topic}`);
      lastEntry.style.visibility = "visible";
      lastEntry.setAttribute("data-id", forum.id);

      //Tip text doesn't work
      let identicon = document.querySelector(`#forum-topic-latest-post-image-${topic}`);
      identicon.classList.add("tip");
      identicon.innerHTML = `<img class="identicon" src="${fuid}" /><div class="tiptext">${app.browser.returnAddressHTML(forum.transaction.from[0].add)}</div>`;

      
    } catch (err) {
      console.log(err);
    }

  }

}
