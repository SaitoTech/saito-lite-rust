const EmailSidebarTemplate = require("./email-sidebar.template.js");
const EmailChat = require("./email-chat.js");


module.exports = EmailSidebar = {
  welcome_space: "",
  render(app, mod) {
    if (!document.getElementById("email-sidebar")) {
      app.browser.addElementToDom(EmailSidebarTemplate(), "email-container");

    }

    let email_apps = document.querySelector(".email-apps");
    mod.mods = app.modules.respondTo("email-appspace");
    for (let i = 0; i < mod.mods.length; i++) {
      let module = mod.mods[i];
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

    document.querySelectorAll(".email-navigator-item").forEach((item) => {
      item.onclick = (e) => {
        document.querySelectorAll(".active").forEach((item) => {
          item.classList.remove("active");
        });
        e.currentTarget.classList.add("active");
        // console.log("navigator - " + e.currentTarget.id);
        window.location.hash = "#" + e.currentTarget.id;
        // if (e.currentTarget.id === "welcome-nav-inbox") {
        //   window.location.reload();
        //   return;
        // }
        this.renderAccordingToHash(app, mod);
        //let subPage = e.currentTarget.id.replace('email-nav-','').replace('mobile-','');
        //window.location.hash = mod.goToLocation(`#page=email_list&subpage=${subPage}`);
      };
    });

    document.querySelectorAll(".email-apps-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        document.querySelectorAll(".active").forEach((item) => {
          item.classList.remove("active");
        });
        e.currentTarget.classList.add("active");

        window.location.hash = "#" + e.currentTarget.id;
        // console.log("apps - " + e.currentTarget.id);
        // if (e.currentTarget.id === "welcome-nav-inbox") {
        //   window.location.reload();
        //   return;
        // }

        this.renderAccordingToHash(app, mod);
      });
    });
  },

  renderAccordingToHash(app, mod) {
    if (!this.welcome_space){
      this.welcome_space = document.getElementById("email-appspace").innerHTML;
    }
    if (window.location.hash === "#welcome-nav-inbox") {
      document.getElementById("email-appspace").innerHTML = this.welcome_space;
      return;
    }
    let modname = window.location.hash.substring(11);
    for (let i = 0; i < mod.mods.length; i++) {
      let module = mod.mods[i];
      if (modname === module.name) {
        let obj = module.respondTo("email-appspace");
        obj.render(mod.app, module);
        obj.attachEvents(mod.app, module);
      }
    }
  }

};


