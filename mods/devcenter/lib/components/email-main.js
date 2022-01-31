const EmailMainTemplate = require('./email-main.template');

module.exports = EmailMain = {

  render(app, mod) {

    if (!document.getElementById("email-main")) { app.browser.addElementToDom(EmailMainTemplate(app, mod), "email-container"); }

  },

  attachEvents(app, mod) {
  },


}
