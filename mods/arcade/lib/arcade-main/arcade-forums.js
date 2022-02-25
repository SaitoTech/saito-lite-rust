const ArcadeForumsTemplate = require("./templates/arcade-forums.template");
const ArcadeForumsThreadTemplate = require("./templates/arcade-forums-thread.template");

module.exports = ArcadeForums = {
  render(app, mod) {
   
    let modforums = [];
    let modgames = [];
     
    try {    // set forum to renderMode.arcade if needed
      let post_mod = this.app.returnModule("Post");
      post_mod.renderMethod = "arcade";
    } catch (err) {}

    app.modules.respondTo("post-forum").forEach((mod) => {
      modforums.push(mod);
    });

    app.modules.respondTo("arcade-games").forEach((mod) => {
      modgames.push(mod);
    });

    //Create an array of objects for each module that responds to post-forum
    let sobj = [];
    
    for (let i = 0; i < modforums.length; i++) {
      sobj.push({
        ft_link: "/post/?forum=" + modforums[i].returnSlug(),
        ft_img: (modforums[i].img)? modforums[i].img: "/saito/img/background.png",
        ft_mod: modforums[i].returnSlug(),
        ft_title: modforums[i].name,
        ft_desc: modforums[i].description,
      });
    }

    //Create an array of objects for each module that responds to arcade-games
    let obj = [];
    for (let i = 0; i < modgames.length; i++) {
      obj.push({
        ft_link: "/arcade/?game=" + modgames[i].returnSlug(),
        ft_img: `/${modgames[i].returnSlug()}/img/arcade.jpg`,
        ft_mod: modgames[i].returnSlug(),
        ft_title: modgames[i].gamename || modgames[i].name,
        ft_desc: modgames[i].description,
      });
    }

    if (!document.querySelector(".arcade-posts-container")) {
      app.browser.addElementToDom(ArcadeForumsTemplate(), "arcade-sub");
      
      app.browser.addElementToDom('<div class="forum-post-header">Saito Discussions</div>', "arcade-posts-container");
      for (let i = 0; i < sobj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(sobj[i]), "arcade-posts-container");
      }
      
      app.browser.addElementToDom('<div class="forum-post-header">Game-Specific Forums</div>', "arcade-posts-container");
      for (let i = 0; i < obj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(obj[i]), "arcade-posts-container");
      }
    }
  },

  attachEvents(app, mod) {
    app.modules.respondTo("arcade-posts").forEach((module) => {
      if (module != null) {
        module.respondTo("arcade-posts").attachEvents(app, module);
      }
    });
  },
};
