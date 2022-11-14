const SaitoUser = require("./saito-user.template");

// This is an unnecessary file

module.exports = SaitoUserWithControlsTemplate = (app, publickey = "", userline = "") => {

  return SaitoUser(app, publickey, userline, `<div class="saito-controls"><i class="fas fa-solid fa-ellipsis-h"></i></div>`);

}


