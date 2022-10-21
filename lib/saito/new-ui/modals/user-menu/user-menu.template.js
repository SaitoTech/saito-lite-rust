
const SaitoUserSmall = require("./../../templates/saito-user-small.template");


module.exports = (app, publickey = "") => {

  return `
   <div class="saito-modal saito-modal-user-menu" id="saito-user-menu">
   <div class="saito-modal-title">User Menu: ${SaitoUserSmall(app, publickey)}</div>
   <div class="saito-modal-content">

   </div>
 </div>
  
   `
};
