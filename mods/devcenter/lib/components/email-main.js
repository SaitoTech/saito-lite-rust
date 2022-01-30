const EmailMainTemplate = require('./email-main.template');

module.exports = EmailMain = {

  render(app, mod) {

    let email_main = document.querySelector(".email-main");
    if (!document.querySelector(".email-main")) { app.browser.addElementToDom(EmailMainTemplate(app, mod)); }

  },

  attachEvents(app, mod) {
  },


}
