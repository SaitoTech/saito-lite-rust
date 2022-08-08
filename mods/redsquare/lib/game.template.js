const SaitoArcadeInviteTemplate = require('./../../../lib/saito/new-ui/templates/saito-arcade-invite.template');

module.exports = (app, mod, tx) => {
  return `
    ${SaitoArcadeInviteTemplate(app, mod, tx)}
  `
}

