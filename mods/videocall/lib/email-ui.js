const EmailUITemplate = require("./email-ui.template");
const CreateUITemplate = require("./create-ui.template");
const JoinUITemplate = require("./join-ui.template");


const EmailUI = {

      render(app, mod) {

            if (!document.querySelector('.video-invite-ui')) { document.querySelector('.email-appspace').innerHTML = sanitize(EmailUITemplate(app, mod)); }

	

      },


      attachEvents(app, mod) {

console.log("ATTACH EVENTS");

            //const generate_button = document.querySelector('#generate');
            //const update_button = document.querySelector('#update');
            //const input = document.querySelector('#input_address');
            document.querySelector('.create-video-chat-button').onclick = (e) => {
console.log("click create");
	      mod.overlay.showOverlay(app, mod, CreateUITemplate(app, mod));
            };

            document.querySelector('.join-video-chat-button').onclick = (e) => {
console.log("lick create");
alert("click join");
	      mod.overlay.showOverlay(app, mod, JoinUITemplate(app, mod));
            };

      }

}



module.exports = EmailUI;


