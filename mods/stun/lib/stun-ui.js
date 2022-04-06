
const StunUITemplate = require("./stun-ui-template");

module.exports = StunUI = {
      render(app, mod) {
             document.querySelector(".email-appspace").innerHTML = sanitize(StunUITemplate(app, mod));

      },


      attachEvents(app, mod) {

           app.connection.on('stun-update', (app)=> {
                  console.log('stun update', app);
                  this.render(app, mod);
                  this.attachEvents(app, mod);
             });   

            const generate_button = document.querySelector('.generate')
            generate_button.addEventListener('click', (e) => {
                  console.log('clicking');
                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.generateStun();

            })
      }
}



