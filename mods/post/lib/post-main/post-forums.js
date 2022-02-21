const PostForumsThreadTemplate = require('./post-forums-thread.template');

module.exports = PostForums = {

  render(app, mod) {

    let sobj = [];
/****
    sobj.push({
	ft_img    : "/saito/img/background.png",
	ft_mod    : "saito",
	ft_title  : "Saito Discussion",
	ft_desc   : "All about Saito and the Saito Post",
	ft_pnum   : 1423,
	ft_ptext  : "posts",
	ft_ptitle : "DEFCON Suicide Misadventures",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 15",
    });
    sobj.push({
	ft_img    : "/saito/img/background.png",
	ft_mod    : "development",
	ft_title  : "Saito Development",
	ft_desc   : "Building on Saito and the Saito Network",
	ft_pnum   : 1423,
	ft_ptext  : "posts",
	ft_ptitle : "DEFCON Suicide Misadventures",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 15",
    });
****/
    let modforums = [];
    app.modules.respondTo("post-forum").forEach(mod => {
      modforums.push(mod);
    });

    for (let i = 0; i < modforums.length; i++) {

      let img = "/saito/img/background.png";
      if (modforums[i].img) { img = modforums[i].img; }
      let desc = modforums[i].description;
      if (desc.length > 80) { desc = desc.substr(0, 80) + "..."; }
      if (desc.indexOf(".") > 0 && desc.indexOf(".") < 80) { desc = desc.substr(0, desc.indexOf(".")+1); }
      let title = modforums[i].name;

      sobj.push({
	ft_img    : img,
	ft_mod    : modforums[i].returnSlug(),
	ft_title  : title,
	ft_desc   : desc,
	ft_pnum   : modforums[i].post_num,
	ft_ptext  : "posts",
	ft_ptitle : "Splitting Hands and Doubling Down",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 12",
      });
    }

    //
    // listen for txs from arcade-supporting games
    //
    let modgames = [];
    app.modules.respondTo("arcade-games").forEach(mod => {
      modgames.push(mod);
    });

    let obj = [];
    for (let i = 0; i < modgames.length; i++) {

      let desc = modgames[i].description;
      if (desc.length > 80) { desc = desc.substr(0, 80) + "..."; }
      if (desc.indexOf(".") > 0 && desc.indexOf(".") < 80) { desc = desc.substr(0, desc.indexOf(".")+1); }
      let title = modgames[i].gamename;
      if (!title) { title = modgames[i].name; }

      obj.push({
	ft_img    : `/${modgames[i].returnSlug()}/img/arcade.jpg`,
	ft_mod    : modgames[i].returnSlug(),
	ft_title  : title,
	ft_desc   : desc,
	ft_pnum   : modgames[i].post_num,
	ft_ptext  : "",
	ft_ptitle : "",
	ft_puser  : "",
	ft_pdate  : "",
      });
    }

   

    if (document.querySelector(".post-forums")) { 
      //app.browser.addElementToDom('<div class="forum-post-header">Saito Discussion</div>', "post-forums");
      for (let i = 0; i < sobj.length; i++) {
        app.browser.addElementToDom(PostForumsThreadTemplate(sobj[i]), "post-forums");
      }
      //app.browser.addElementToDom('<div class="forum-post-header">Post Games</div>', "post-forums");
      for (let i = 0; i < obj.length; i++) {
        app.browser.addElementToDom(PostForumsThreadTemplate(obj[i]), "post-forums");
      }
    }

  },


  attachEvents(app, mod) {
    app.modules.respondTo("arcade-posts").forEach(module => {
      if (module != null) {
        module.respondTo('arcade-posts').attachEvents(app, module);
      }
    });
  },
}
