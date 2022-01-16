const ArcadeForumsTemplate = require('./templates/arcade-forums.template');
const ArcadeForumsThreadTemplate = require('./templates/arcade-forums-thread.template');

module.exports = ArcadeForums = {

  render(app, mod) {

    let sobj = [];
    sobj.push({
	ft_img    : "/saito/img/background.png",
	ft_mod    : "twilight",
	ft_title  : "Saito Discussion",
	ft_desc   : "All about Saito and the Saito Arcade",
	ft_pnum   : 1423,
	ft_ptext  : "posts",
	ft_ptitle : "DEFCON Suicide Misadventures",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 15",
    });
    sobj.push({
	ft_img    : "/saito/img/background.png",
	ft_mod    : "twilight",
	ft_title  : "Saito Discussion",
	ft_desc   : "All about Saito and the Saito Arcade",
	ft_pnum   : 1423,
	ft_ptext  : "posts",
	ft_ptitle : "DEFCON Suicide Misadventures",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 15",
    });


    //
    // listen for txs from arcade-supporting games
    //
    let modgames = [];
    app.modules.respondTo("arcade-games").forEach(mod => {
      modgames.push(mod);
    });

    let obj = [];
    for (let i = 0; i < modgames.length; i++) {
      obj.push({
	ft_img    : `/${modgames[i].returnSlug()}/img/arcade.jpg`,
	ft_mod    : modgames[i].returnSlug(),
	ft_title  : modgames[i].gamename,
	ft_desc   : modgames[i].description.substr(0,50) + "...",
	ft_pnum   : 245,
	ft_ptext  : "posts",
	ft_ptitle : "Splitting Hands and Doubling Down",
	ft_puser  : "david@saito",
	ft_pdate  :  "Jan 12",
      });
    }

   

    if (!document.querySelector(".arcade-posts")) { 

      app.browser.addElementToDom(ArcadeForumsTemplate(), "arcade-sub");
      app.browser.addElementToDom('<div class="arcade-post-header">Saito Discussion</div>', "arcade-posts");
      for (let i = 0; i < sobj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(sobj[i]), "arcade-posts");
      }
      app.browser.addElementToDom('<div class="arcade-post-header">Arcade Games</div>', "arcade-posts");
      for (let i = 0; i < obj.length; i++) {
        app.browser.addElementToDom(ArcadeForumsThreadTemplate(obj[i]), "arcade-posts");
      }

    }

/***
    app.modules.respondTo("arcade-posts").forEach(module => {
      if (module != null) {
        module.respondTo('arcade-posts').render(app, module);
      }
    });
***/


  },


  attachEvents(app, mod) {

    app.modules.respondTo("arcade-posts").forEach(module => {
      if (module != null) {
        module.respondTo('arcade-posts').attachEvents(app, module);
      }
    });
  },
}
