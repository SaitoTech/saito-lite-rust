let SaitoUserSmallTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template.js');

module.exports = (app, mod, chat_container_id) => {

    return `

      <div class="chat-container chat-container-${chat_container_id}" id="chat-container-${chat_container_id}">

        <div class="chat-header">
          <i class="far fa-comment-dots"></i>
          <h6>Community Chat</h6>
          <i id="chat-container-close-${chat_container_id}" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">
    
	  ${new SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), "chat line 1")}
	  ${new SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), "chat line 2")}
	  ${new SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), "chat line 3")}
	  ${new SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), "chat line 4")}
	  ${new SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), "chat line 5")}

        </div>

        <div class="chat-footer">
          <input type="text" placeholder="Type something..." />
          <i class="fas fa-paper-plane"></i>
        </div>

      </div>

  `;

}


