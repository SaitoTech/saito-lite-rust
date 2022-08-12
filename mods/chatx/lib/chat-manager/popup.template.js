const SaitoUserSmallTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template.js');
const JSON = require('json-bigint');

module.exports = (app, mod, group_id) => {

console.log("group id: " + group_id);
    
    let group = mod.returnGroup(group_id);
    if (!group) { return ""; }

console.log("group: " + JSON.stringify(group));
    
    let message_blocks = mod.createMessageBlocks(group);
    
console.log("message blocks: " + JSON.stringify(message_blocks));

    let html = `

      <div class="chat-container chat-container-${group_id}" id="chat-container-${group_id}">

        <div class="chat-header">
          <i class="far fa-comment-dots"></i>
          <h6>Community Chat</h6>
          <i id="chat-container-close-${group_id}" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">
    `;

    for (let i = 0; i < message_blocks.length; i++) {
      let block = message_blocks[i];
      let msg = "";
      for (let z = 0; z < block.length; z++) {
        if (z > 0) { msg += '<br/>'; }
        let txmsg = block[z].returnMessage();
        msg += txmsg.message;       
      }
      html +=`${SaitoUserSmallTemplate(app, mod, app.wallet.returnPublicKey(), msg)}`;
    }

    html += `

        </div>

        <div class="chat-footer">
          <input type="text" placeholder="Type something..." />
          <i class="fas fa-paper-plane"></i>
        </div>

      </div>

  `;

  return html;

}


