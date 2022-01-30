const EmailSidebarTemplate 	= require('./email-sidebar.template.js');
const EmailChat 		= require('./email-chat.js');


module.exports = EmailSidebar = {

    render(app, mod) {

      if (!document.getElementById("email-controls")) { app.browser.addElementToDom(EmailSidebarTemplate(), "email-sidebar"); }

      let email_apps = document.querySelector(".email-apps");
      let mods = app.modules.respondTo("email-appspace");
      for (let i = 0; i < mods.length; i++) {
        let module = mods[i];
        if (module.name === "MyQRCode") {
          email_apps.innerHTML += `<li class="email-apps-item email-apps-item-${i}" style="display:none" id="email-nav-${module.name}">${module.name}</li>`;
        } else {
          email_apps.innerHTML += `<li class="email-apps-item email-apps-item-${i}" id="email-nav-${module.name}">${module.name}</li>`;
        }
      }

      EmailChat.render(app, mod);
      EmailChat.attachEvents(app, mod);
    },

    attachEvents(app, mod) {

    }

}



