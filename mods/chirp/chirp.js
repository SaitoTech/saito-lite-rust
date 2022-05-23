const Toggler = require('../../lib/saito/saito-ui/dark_mode_toggler');
const ModTemplate = require("../../lib/templates/modtemplate");
const ChirpMain = require("./lib/main/chirp-main");

class Chirp extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "Chirp";
    this.description = "Twitter-style Social Media Network on Saito";
    this.categories = "Social Information Community";

    this.events = ["chat-render-request"];
    this.icon_fa = "fas fa-crow";
    this.mods = [];
    this.affix_callbacks_to = [];

    this.header = null;
    this.overlay = null;
    this.darkModeToggler = new Toggler(app);

    this.styles = ['/saito/chirp.css', '/saito/lib/fullcalendar/packages/daygrid/main.css', '/saito/lib/fullcalendar/packages/core/main.css', '/saito/lib/fullcalendar/packages/list/main.css',];
    this.scripts = ['/saito/lib/fullcalendar/packages/core/main.js', '/saito/lib/fullcalendar/packages/daygrid/main.js', '/saito/lib/fullcalendar/packages/list/main.js']

  }

  render(app) {

    super.render(app)

    this.darkModeToggler.initialize();
    ChirpMain.render(app, this);

  }

  attachEvents(app) {

    const self = this;

    document.querySelector(".switch").addEventListener('click', (e) => {
      e.preventDefault();
      console.log('toggling dark mode')
      const slider = document.querySelector(".slider");
      console.log(slider.classList.contains("checked"));


      self.darkModeToggler.toggle();
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


}

module.exports = Chirp;


