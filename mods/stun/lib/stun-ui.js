
const StunUITemplate = require("./stun-ui-template");

module.exports = StunUI = {
      render(app, mod) {
             document.querySelector(".email-appspace").innerHTML = sanitize(StunUITemplate(app, mod));

      },


      attachEvents(app, mod) {

            const generate_button = document.querySelector('#generate');
            const update_button = document.querySelector('#update');
            const input = document.querySelector('#input_address');
            
           app.connection.on('stun-update', (app)=> {
                  console.log('stun update', app);
                  this.render(app, mod);
                  this.attachEvents(app, mod);
             });   

            
            generate_button.addEventListener('click', (e) => {
                  let publicKey = input.value.trim();
                  console.log('clicking');
                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.generateStun(publicKey);

            })

            update_button.addEventListener('click', (e) => {
                  let publicKey = input.value.trim();
                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.updateKey(publicKey);
            })

      }
}



