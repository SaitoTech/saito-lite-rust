const SaitoUser = require("./saito-user.template");

module.exports = SaitoUserTemplateWithTime = (app, publickey = "", userline = "", timestamp = 0) => {

  if (!timestamp){
    timestamp = new Date().getTime();
  }

  let x = app.browser.formatDate(timestamp);
  let time = x.hours + ":" + x.minutes;

  return SaitoUser(app, publickey, userline, `<div class="saito-datetime">${time}</div>`); 

}

