var ModTemplate = require('../../lib/templates/modtemplate');
const Toggler = require('../../lib/saito/saito-ui/dark_mode_toggler');

class App extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "App";
    this.description = "Rendering as a Single Page Application";
    this.categories = "Development";
    this.current_module = "";
    this.previous_module = "";



    this.darkModeToggler = new Toggler(app);

    return this;
  }





  handleUrlParams(urlParams) {
    // set param
    let module = urlParams.get("render");
    console.log('to render', module);
    this.current_module = module;

  }

  initialize(app) {
    if (app.BROWSER != 1) {
      return;
    }

    // set default mod to ui_elements
    if (!this.current_module) {
      this.current_module = "chirp";
    }

    super.initialize(app);

  }

  initializeHTML(app) {

    super.initializeHTML(app)

    this.darkModeToggler.initialize();





  }

  receiveEvent() {
  }

  attachEvents(app) {
    const self = this;
    const listener2 = $('#render_arcade').on('click', function (e) {
      const app_mod = app.modules.returnModule("App");
      const arcade_mod = app.modules.returnModule("Arcade");

      app_mod.render(app, arcade_mod);
      self.eventListeners.push({ type: 'click', listener2 });
    });


    document.querySelectorAll('.big-menu-link').forEach(link => {
      link.addEventListener('click', function () {

        const app_mod = app.modules.returnModule("App");
        const ui_mod = app.modules.returnModule("chirp");

        const url = this.getAttribute('data-url');
        const route = this.getAttribute('data-route');

        if (route) {
          const mod = app.modules.returnModule(route);
          app_mod.render(app, mod, route);
        } else if (url) {
          console.log(ui_mod, url, this);
          ui_mod.parameters['display'] = url.split("=")[url.split('=').length - 1];
          ui_mod.browser_active = 1;
          ui_mod.render(app);

        }

      })
    })
    function handleRoute() {

      const app_mod = app.modules.returnModule("App");
      const ui_mod = app.modules.returnModule("ui-elements");

      const url = this.getAttribute('data-url');
      const route = this.getAttribute('data-route');
      const additionalRoute = this.getAttribute('data-additional');

      if (route) {
        const mod = app.modules.returnModule(route);

        app_mod.render(app, mod, additionalRoute);
      } else if (url) {
        console.log(ui_mod, url, this);
        ui_mod.parameters['display'] = url.split("=")[url.split('=').length - 1];
        ui_mod.browser_active = 1;
        ui_mod.render(app);

      }


    }
    document.querySelectorAll('.breadcrumb-link').forEach(link => {
      link.addEventListener('click', handleRoute);
      const self = this;
      self.toggleMenu();
    })

    document.querySelectorAll('.route-link').forEach(link => {
      link.addEventListener('click', handleRoute)
    })

    document.querySelector(".switch").addEventListener('click', (e) => {
      e.preventDefault();
      console.log('toggling dark mode')
      const slider = document.querySelector(".slider");
      console.log(slider.classList.contains("checked"));
      const app_mod = app.modules.returnModule("App");

      app_mod.toggleDarkMode();
      // self.eventListeners.push({ type: 'click', listener });
      if (slider.classList.contains("checked")) {
        slider.classList.remove("checked");
      } else {
        slider.classList.add("checked");
      }
    })

    document.querySelector("#menuToggle").addEventListener("click", this.toggleMenu);


    document.querySelector("#sidebar-toggle-mobile").addEventListener("click", () => {
      console.log('clicking')
      document.querySelector('.sidebar-mobile').classList.contains('display') == false ? document.querySelector('.sidebar-mobile').classList.add('display') : document.querySelector('.sidebar-mobile').classList.remove('display')

    });

    //  Chat events
    document.querySelector("#chat-container-close").addEventListener("click", () => {

      document.querySelector('.saito-chat-container').classList.remove('display-chat');
    });

    document.querySelectorAll(".saito-chat-toggle").forEach(item => {
      item.addEventListener("click", () => {
        const chatContainer = document.querySelector('.saito-chat-container');
        const chatBody = document.querySelector('.saito-chat-body');
        chatContainer.classList.contains('display-chat') == false ? chatContainer.classList.add('display-chat') : chatContainer.classList.remove('display-chat')
        chatBody.scroll({
          top: chatBody.scrollHeight,
          behavior: "smooth"
        })

      });

    })

    document.body.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {

        sendMessage()
      }
    })

    document.querySelector("#saito-sendmsg-btn").addEventListener('click', sendMessage)

    function sendMessage() {
      const chatInput = document.querySelector('#saito-chat-input');
      const chatBody = document.querySelector('.saito-chat-body')

      const time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} `
      if (chatInput.value != "") {
        console.log(chatInput.value);
        const template = `<div class="saito-chat-bubble me"> 
       <div class="chat-dialog">
         <img src="/saito/img/account.svg"/>
         <div>
           <p class="saito-chat-address">kkadiaiudaol...</p>
           <p>${chatInput.value.trim()}</p>

         </div>
         <span>${time}</span>
       </div>

     </div>`;

        chatBody.insertAdjacentHTML('beforeend', template);
        chatInput.value = "";

        chatBody.scroll({
          top: chatBody.scrollHeight,
          behavior: "smooth"
        })

        console.log(template);
      }
    }




  }

  toggleMenu(e) {
    console.log("toggling menu");
    document
      .querySelector("#hamburger-contents")
      .classList.contains("show-menu")
      ? document
        .querySelector("#hamburger-contents")
        .classList.remove("show-menu")
      : document
        .querySelector("#hamburger-contents")
        .classList.add("show-menu");
  }



  render(app, mod, additionalURL) {

    const self = this;
    if (self.previous_module) {
      self.previous_module.destroy();
    }

    if (mod) {
      if (mod.name) {
        mod.browser_active = 1;
        mod.initialize(app);
        if (mod.returnBaseHTML) {
          const ui_template = mod.returnBaseHTML(app);
          if (ui_template) {
            self.setBaseHTML(app, ui_template);
          }

        }
        mod.initializeHTML(app, additionalURL);
        mod.render(app);
        mod.attachEvents(app);
        self.previous_module = mod;
      }
    } else {
      if (!additionalURL) {
        additionalURL = this.additionalURL;
      }
      app.modules.mods.forEach(mod => {
        if (mod.name.toLowerCase() === self.current_module) {
          mod.browser_active = 1;
          mod.initialize(app);
          mod.initializeHTML(app, additionalURL);
          if (mod.returnBaseHTML) {
            const ui_template = mod.returnBaseHTML(app);
            if (ui_template) {
              self.setBaseHTML(app, ui_template);
            }

          }


          mod.render(app);
          mod.attachEvents(app);
          self.previous_module = mod;
        } else {
        }
      })
    }


  }


  toggleDarkMode() {
    this.darkModeToggler.toggle();
  }


  // rerender(app) {
  //   let self = this;
  //   console.log('rerendering ', this.current_module);
  //   app.modules.mods.forEach(mod => {
  //     if (mod.name.toLowerCase() === this.current_module) {
  //       mod.destroy(app);
  //       self.render(app);
  //     }
  //   })
  // }




  setBaseHTML(app, html) {
    document.querySelector('.main-content').innerHTML = html;
  }






  respondTo(type) {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = this.renderEmail;
      return obj;
    }

    return null;
  }





}


module.exports = App;
