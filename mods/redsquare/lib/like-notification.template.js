const SaitoUserWithTimeTemplate = require('./../../../lib/saito/new-ui/templates/saito-user-with-time.template');

module.exports = (app, mod, tx, counter) => {

    let txmsg = tx.returnMessage();
    let txsig = "";
    if (txmsg.data?.sig) { txsig = txmsg.data.sig; }

    let html = `
    <i class='fas fa-heart fa-notification'></i> <span class='notification-type'>liked your tweet <span class="likedd-tweet-${txsig}">${counter}</span> times </span>
    `

    return `
       <div class="redsquare-item notification-item notification-item-${tx.transaction.sig} " data-id="${txsig}">
         ${SaitoUserWithTimeTemplate(app, tx.transaction.from[0].add, html, new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">           
            <div class="tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}"></div>
         </div>
       </div>
    `;

}

