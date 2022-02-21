const EmailAppspaceHeaderTemplate = require('./email-appspace-header.template');


module.exports = EmailAppspaceHeader = {
  render(app, mod) {
    document.querySelector('.email-header').innerHTML = sanitize(EmailAppspaceHeaderTemplate(app, mod));
  },

  attachEvents(app, mod) {

  },
}

