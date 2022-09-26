const SaitoMobileBarTemplate = require("./saito-mobile-bar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");


class SaitoMobileBar extends UIModTemplate {

  constructor(app, mod = null, selector = "") {

    super(app);

    this.app = app;
    this.name = "SaitoMobileBar UIComponent";
    this.selector = selector;

    this.initialize(app);

  }

  render(app, mod) {

    if (this.selector !== "" && (selector === "" || selector === ".saito-container")) { selector = this.selector; }

    if (!document.querySelector(`.saito-mobile-bar`)) {
      app.browser.addElementToSelector(SaitoMobileBarTemplate(app, mod), 'body');
    } else {
      app.browser.replaceElementBySelector(SaitoMobileBarTemplate(app, mod), 'body');
    }
   
    super.render(app, mod, `.saito-sidebar.${this.align}`);

    this.attachEvents(app, mod)

  }

  attachEvents(app, mod){
    try {  
      document.querySelector(".saito-mobile-toggle-chat").onclick = ()=> {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].slug === "chat" && app.modules.mods[i].gamesmenufilter === "chatx") {
            const chatx_mod = app.modules.mods[i];
            let community_chat_gid = chatx_mod.groups[0].id;
            document.querySelector(`.chat-manager-list .saito-user-${community_chat_gid}`).click();
          }
        }
         
      }

      document.body.addEventListener('click', e => {
        console.log(e.target.id);

         if(e.target.id=== "saito-mobile-actions-icon"){
          let element = document.querySelector('.redsquare-actions-container');
          let icon = document.querySelector('.saito-redsquare-actions-buttons-icon i')
          if(element.classList.contains("display-actions")){
            element.classList.remove('display-actions');
            e.target.classList.remove('fa-minus')
            e.target.classList.add('fa-plus')

          } else {
            element.classList.add('display-actions');
            e.target.classList.remove('fa-plus')
            e.target.classList.add('fa-minus')
          }
         } else if (e.target.id == 'saito-mobile-toggle-left-icon') {
          const l_sidebar = document.querySelector('.saito-sidebar.left');
          if (l_sidebar.classList.contains('mobile')) {
            l_sidebar.classList.remove('mobile');
            e.target.className = "fas fa-angle-right";
          } else {
            e.target.className = "fas fa-angle-left";
            l_sidebar.classList.add('mobile');
          }
        } else if (e.target.id == 'saito-mobile-toggle-right-icon') {
          const r_sidebar = document.querySelector('.saito-sidebar.right');
          if (r_sidebar.classList.contains('mobile')) {
            r_sidebar.classList.remove('mobile');
            e.target.className = "fas fa-angle-left";
          } else {
            e.target.className = "fas fa-angle-right";
            r_sidebar.classList.add('mobile');
          }
        }
       });

    } catch (err) {
      console.log("Path: saito-mobile-bar. ERROR: " + err);
    }
  }

}

module.exports = SaitoMobileBar;

