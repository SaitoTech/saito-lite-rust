const StakingAppspaceTemplate = require('./staking-appspace.template.js');


module.exports = StakingAppspace = {

  render(app, mod) {
    document.querySelector(".email-appspace").innerHTML = StakingAppspaceTemplate(app);
  },

  attachEvents(app, mod) {
  },

}


