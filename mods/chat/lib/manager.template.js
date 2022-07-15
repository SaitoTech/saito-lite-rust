const SaitoUserWithTime = require('./../../../lib/saito/new-ui/templates/saito-user-with-time.template');

module.exports = ChatManagerTemplate = (app, mod) => {

  return `
  <div class="chat-manager">
  <div>
      <div class="saito-list  saito-white-background  ">
	${SaitoUserWithTime(app, mod, "Saito Community Chat", "last msg...", new Date().getTime())}
      </div>
  </div>
</div>
    `

}
