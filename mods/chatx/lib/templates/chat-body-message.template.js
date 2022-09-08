
const SaitoUserSmallTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template.js');

module.exports  =   (app, mod, gid) => {

    let group = mod.returnGroup(gid);
    let message_blocks = mod.createMessageBlocks(group);
    let html = "";
      for (let i = 0; i < message_blocks.length; i++) {
        let block = message_blocks[i];
        if (block.length > 0) {
          let sender = "";
          let msg = "";
          for (let z = 0; z < block.length; z++) {
            if (z > 0) { msg += '<br/>'; }
            let txmsg = block[z].returnMessage();
        sender = block[z].transaction.from[0].add;
  console.log("add: "+txmsg.message + " - " + z);
            msg += txmsg.message;       
          }
          html +=`${SaitoUserSmallTemplate(app, mod, sender, msg)}`;
        }
      }

      return html;
   
}