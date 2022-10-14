const SaitoMobileBarTemplate = require("./saito-mobile-bar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");


class SaitoMobileBar extends UIModTemplate {

  constructor(app, mod = null, selector = "") {

    super(app);

    this.app = app;
    this.name = "SaitoMobileBar UIComponent";
    this.selector = selector;

    this.initialize(app);

    app.connection.on("chat-render-request-notify", () => {
      document.querySelector(".saito-mobile-toggle-chat i").classList.remove("far");
      document.querySelector(".saito-mobile-toggle-chat i").classList.add("fa-solid");
    });

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

  attachEvents(app, mod) {
    try {
      let qs = document.querySelector("#chat-icon");
      if (qs != null) {
        document.querySelector(".saito-mobile-toggle-chat").onclick = (e) => {
          //console.log("preventing default");
          e.preventDefault();
          e.stopImmediatePropagation();

          for (let i = 0; i < app.modules.mods.length; i++) {
            if (app.modules.mods[i].slug === "chat" && app.modules.mods[i].gamesmenufilter === "chatx") {
              const chatx_mod = app.modules.mods[i];
              // 
              chatx_mod.mobile_chat_active = !chatx_mod.mobile_chat_active;

              document.querySelector(".saito-mobile-toggle-chat i").classList.add("far");
              document.querySelector(".saito-mobile-toggle-chat i").classList.remove("fa-solid");

              let community_chat_gid = chatx_mod.groups[0].id;

              if (document.querySelector(`#chat-container-close-${community_chat_gid}`) != null) {
                document.querySelector(`#chat-container-close-${community_chat_gid}`).click();
              } else {
                document.querySelector(`.chat-manager-list .saito-user-${community_chat_gid}`).click();
              }
            }
          }
        }
      }

      //Why do we have a click event on the body?!?!?
      document.body.addEventListener('click', e => {
        //console.log("preventing default 2");

        if (e.target.id === "saito-mobile-actions" || e.target.id === "saito-mobile-actions-icon") {
          let element = document.querySelector('.redsquare-actions-container');
          let icon = document.querySelector("#saito-mobile-actions-icon");

          element.classList.toggle('display-actions');
          icon.classList.toggle('fa-plus');
          icon.classList.toggle('fa-minus');

          e.preventDefault();
          e.stopImmediatePropagation();

        } else if (e.target.id == 'saito-mobile-toggle-left' || e.target.id === "saito-mobile-toggle-left-icon") {

          const l_sidebar = document.querySelector('.saito-sidebar.left');
          let icon = document.querySelector('#saito-mobile-toggle-left-icon');

          l_sidebar.classList.toggle('mobile');
          icon.classList.toggle('fa-angle-right');
          icon.classList.toggle('fa-angle-left');

          e.preventDefault();
          e.stopImmediatePropagation();

        } else if (e.target.id == 'saito-mobile-toggle-right' || e.target.id == 'saito-mobile-toggle-right-icon') {
          const r_sidebar = document.querySelector('.saito-sidebar.right');
          let icon = document.querySelector('#saito-mobile-toggle-right-icon');

          r_sidebar.classList.toggle('mobile');
          icon.classList.toggle('fa-angle-right');
          icon.classList.toggle('fa-angle-left');

          e.preventDefault();
          e.stopImmediatePropagation();

        }
      });

    } catch (err) {
      console.log("Path: saito-mobile-bar. ERROR: " + err);
    }
  }

}

module.exports = SaitoMobileBar;

