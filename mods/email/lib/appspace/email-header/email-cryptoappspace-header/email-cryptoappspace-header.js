const EmailCryptoAppspaceHeaderTemplate = require('./email-cryptoappspace-header.template');


module.exports = EmailAppspaceHeader = {
  render(app, mod) {
    document.querySelector('.email-header').innerHTML = sanitize(EmailCryptoAppspaceHeaderTemplate(app, mod));
  },

  attachEvents(app, mod) {

  },
}

