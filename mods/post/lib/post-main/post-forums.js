const PostForumsThreadTemplate = require('./post-forums-thread.template');

/*
  This creates a list of all arcade games and other modules for which we could have specific forums 
  (add a respond to "post-forum" to any module to have it show up) and creates a framework for splash page latest post visible
*/
module.exports = PostForums = {

  render(app, mod) {
  
    let modforums = [];
    let modgames = [];
    
    app.modules.respondTo("post-forum").forEach(mod => {
      modforums.push(mod);
    });
    
    app.modules.respondTo("arcade-games").forEach(mod => {
      modgames.push(mod);
    });

    //Create an array of objects for each module that responds to post-forum
    let sobj = [];
    for (let i = 0; i < modforums.length; i++) {
      sobj.push({
      	ft_img    : (modforums[i].img)? modforums[i].img : "/saito/img/background.png",
      	ft_mod    : modforums[i].returnSlug(),
      	ft_title  : modforums[i].name,
      	ft_desc   : modforums[i].description,
      });
    }

    //Create an array of objects for each module that responds to arcade-games
    let obj = [];
    for (let i = 0; i < modgames.length; i++) {
      obj.push({
      	ft_img    : `/${modgames[i].returnSlug()}/img/arcade.jpg`,
      	ft_mod    : modgames[i].returnSlug(),
      	ft_title  : modgames[i].gamename || modgames[i].name,
      	ft_desc   : modgames[i].description,
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
