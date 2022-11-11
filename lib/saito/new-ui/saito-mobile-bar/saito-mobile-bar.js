const SaitoMobileBarTemplate = require("./saito-mobile-bar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");


class SaitoMobileBar extends UIModTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name = "SaitoMobileBar UIComponent";
    this.leftSelector = '.saito-sidebar.left';
    this.rightSelector = '.saito-sidebar.right';

    this.chat_notifications = 0;

    this.initialize(app);

    app.connection.on("chat-render-request-notify", (gid) => {
      this.chat_notifications++;
      let qs = document.querySelector("#chat-toggle");
      if (qs) {
        qs.innerHTML = `<i id="chat-icon" class="far fa-comment-alt"></i>
                        <div class="saito-notification-counter">${this.chat_notifications}</div>`;
        }
    });

  }

  render(app, mod) {

    if (!document.querySelector(`.saito-mobile-bar`)) {
      app.browser.addElementToDom(SaitoMobileBarTemplate(app, mod));
    } else {
      app.browser.replaceElementBySelector(SaitoMobileBarTemplate(app, mod), `.saito-mobile-bar`);
    }

    //
    // If we want to add functional components to the mobile bar
    // this will add them to the template & load any scripts/styles listed in the constructor
    //
    super.render(app, mod, `.saito-mobile-bar`);

    this.attachEvents(app, mod)

  }

  attachEvents(app, mod) {

      let qs = document.querySelector("#chat-toggle");
      if (qs) {
        qs.onclick = (e) => {
          //console.log("preventing default");
          e.preventDefault();
          e.stopImmediatePropagation();

          //Clear notifications
          qs.innerHTML = `<i id="chat-icon" class="far fa-comment-alt"></i>`;
          this.chat_notifications = 0;

          app.connection.emit("open-chat-with");
        }
      }

      if (document.getElementById("saito-mobile-actions")){
        document.getElementById("saito-mobile-actions").onclick = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();

          let element = document.querySelector('.redsquare-actions-container');
          if (element){
            element.classList.toggle('display-actions');
          }

          let icon = document.querySelector("#saito-mobile-actions-icon");
          if (icon){
            icon.classList.toggle('fa-plus');
            icon.classList.toggle('fa-minus');
          }

        }
      }

      if (document.getElementById("saito-mobile-toggle-left")){
        document.getElementById("saito-mobile-toggle-left").onclick = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();

          const l_sidebar = document.querySelector(this.leftSelector);
          if (l_sidebar){
            l_sidebar.classList.toggle('mobile');
          }

          let icon = document.querySelector('#saito-mobile-toggle-left-icon');
          if (icon){
            icon.classList.toggle('fa-angle-right');
            icon.classList.toggle('fa-angle-left');
          }

        }
      }

      if (document.getElementById("saito-mobile-toggle-right")){
        document.getElementById("saito-mobile-toggle-right").onclick = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();

          let icon = document.querySelector('#saito-mobile-toggle-right-icon');
          if (icon){
            icon.classList.toggle('fa-angle-right');
            icon.classList.toggle('fa-angle-left');
          }
          const r_sidebar = document.querySelector(this.rightSelector);
          if (r_sidebar){
            r_sidebar.classList.toggle('mobile');            
          }

        }
      }

  }

}

module.exports = SaitoMobileBar;

