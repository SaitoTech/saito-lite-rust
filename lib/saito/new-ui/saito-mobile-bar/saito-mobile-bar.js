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
       if(e.target.id=== "icon"){
        let element = document.querySelector('.redsquare-actions-container');
        let icon = document.querySelector('.saito-redsquare-actions-buttons-icon i')
        if(element.classList.contains("display-actions")){
          element.classList.remove('display-actions');
          icon.classList.remove('fa-minus')
          icon.classList.add('fa-plus')
        }else {
          element.classList.add('display-actions');
          icon.classList.remove('fa-plus')
          icon.classList.add('fa-minus')
        }
       }
     })
}

}

module.exports = SaitoMobileBar;

