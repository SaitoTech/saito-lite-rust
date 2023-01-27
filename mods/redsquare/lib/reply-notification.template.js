const SaitoUserWithTimeTemplate = require('./../../../lib/saito/new-ui/templates/saito-user-with-time.template');

module.exports = (app, mod, tx, txmsg) => {

    let txsig = "";
    if (txmsg.data?.parent_id) { txsig = txmsg.data.parent_id; }

    return `
       <div class="notification-item notification-item-${tx.transaction.sig} liked-tweet-${txsig}" data-id="${txsig}">
         ${SaitoUserWithTimeTemplate(app, tx.transaction.from[0].add, "<i class='fas fa-comment fa-notification'></i> <span class='notification-type'>replied to your tweet</span>", new Date().getTime())}
         <div class="notification-item-contents" id="notification-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">	           
            <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${txmsg.data.text}</div>
         </div>
       </div>
    `;

}

