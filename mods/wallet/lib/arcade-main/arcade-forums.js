const ArcadeForumsTemplate = require('./templates/arcade-forums.template');
const ArcadeForumsThreadTemplate = require('./templates/arcade-forums-thread.template');

module.exports = ArcadeForums = {

  render(app, mod) {

    let sobj = [];
    let modforums = [];

    //
    // set forum to renderMode.arcade if needed
    //
    try {
      let post_mod = this.app.returnModule("Post");
      post_mod.renderMethod = "arcade"; 
    } catch (err) {}

    app.modules.respondTo("post-forum").forEach(mod => {
      modforums.push(mod);
    });
    for (let i = 0; i < modforums.length; i++) {

      let img = "/saito/img/background.png";
      if (modforums[i].img) { img = modforums[i].img; }
      let desc = modforums[i].description;
      if (desc.length > 80) { desc = desc.substr(0, 80) + "..."; }
      let title = modforums[i].name;

      sobj.push({
	ft_link   : "/post/?forum="+modforums[i].returnSlug(),
	ft_img    : img,
	ft_mod    : modforums[i].returnSlug(),
	ft_title  : title,
	ft_desc   : desc,
	ft_pnum   : 0,
	ft_ptext  : "",
	ft_ptitle : "",
	ft_puser  : "",
	ft_pdate  : "",
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
      let title = modgames[i].gamename;
      if (!title) { title = modgames[i].name; }

      obj.push({
	ft_link   : "/arcade/?game="+modgames[i].returnSlug(),
	ft_img    : `/${modgames[i].returnSlug()}/img/arcade.jpg`,
	ft_mod    : modgames[i].returnSlug(),
	ft_title  : title,
	ft_desc   : desc,
	ft_pnum   : 0,
	ft_ptext  : "",
	ft_ptitle : "",
	ft_puser  : "",
	ft_pdate  : "",
      });
    }
   

    if (!document.querySelector(".arcade-posts")) { 

      app.browser.addElementToDom(ArcadeForumsTemplate(), "arcade-sub");
      app.browser.addElementToDom('<div class="forum-post-header">Saito Discussions</div>', "arcade-posts");
      for (let i = 0; i < sobj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(sobj[i]), "arcade-posts");
      }
      app.browser.addElementToDom('<div class="forum-post-header">Game-Specific Forums</div>', "arcade-posts");
      for (let i = 0; i < obj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(obj[i]), "arcade-posts");
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
