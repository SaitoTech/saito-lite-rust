const SaitoUser = require("./saito-user.template");

module.exports = SaitoUserWithControlsTemplate = (app, mod, publickey = "", userline = "") => {

  return SaitoUser(app, mod, publickey, userline, `<div class="saito-controls"><i class="fas fa-solid fa-ellipsis-h"></i></div>`);

}


