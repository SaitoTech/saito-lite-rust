const SaitoUserTemplate = require('./../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    let txmsg = tx.returnMessage();
    let txsig = "";
    if (txmsg.data?.sig) { txsig = txmsg.data.sig; }

    return `
       <div class="notification-item notification-item-${tx.transaction.sig} likedd-tweet-${txsig}" data-id="${txsig}">
         ${SaitoUserTemplate(app, tx.transaction.from[0].add, "<i class='fas fa-heart fa-notification'></i> <span class='notification-type'>liked your tweet</span>", new Date().getTime())}
         <div class="notification-item-contents" id="notification-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">           
            <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}"></div>
         </div>
       </div>
    `;

}

