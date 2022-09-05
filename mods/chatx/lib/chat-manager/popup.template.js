const SaitoUserSmallTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template.js');
const JSON = require('json-bigint');

module.exports = (app, mod, group_id) => {

    let group = mod.returnGroup(group_id);
    if (!group) { return ""; }

    let message_blocks = mod.createMessageBlocks(group);
    
    let html = `

      <div class="chat-container chat-container-${group_id}" id="chat-container-${group_id}">

        <div class="chat-header">
          <i class="far fa-comment-dots"></i>
          <h6>${group.name}</h6>
          <i id="chat-container-close-${group_id}" class="chat-container-close fas fa-times"></i>
        </div>

        <div class="chat-body">
    `;

console.log("MESSAGE BLOCKS: ");
console.log(JSON.stringify(message_blocks));

    for (let i = 0; i < message_blocks.length; i++) {
console.log("blocks i: " + i);
      let block = message_blocks[i];
      if (block.length > 0) {
        let sender = "";
        let msg = "";
        for (let z = 0; z < block.length; z++) {
          if (z > 0) { msg += '<br/>'; }
          let txmsg = block[z].returnMessage();
	  sender = block[z].transaction.from[0].add;
console.log("message blocks msg: " + txmsg.message);
          msg += txmsg.message;       
        }
        html +=`${SaitoUserSmallTemplate(app, mod, sender, msg)}`;
      }
    }

    html += `

        </div>

        <div class="chat-footer">
          <input name="chat-input" id="chat-input-${group_id}" type="text" placeholder="Type something..." />
          <i class="fas fa-paper-plane chat-input-submit" id="chat-input-submit-${group_id}"></i>
        </div>

      </div>

  `;

  return html;

}


