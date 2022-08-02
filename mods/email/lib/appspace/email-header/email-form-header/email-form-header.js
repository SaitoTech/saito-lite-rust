const EmailFormHeaderTemplate = require('./email-form-header.template');

module.exports = EmailFormHeader = {

  render(app, mod) {
    document.querySelector('.email-header').innerHTML = sanitize(EmailFormHeaderTemplate(app, mod));
  },

  attachEvents(app, mod) {

  }
}
