const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx, txmsg) => {

    return `
       <div class="redsquare-item notification-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "<i class='fa fa-repeat fa-notification'></i> <span class='notification-type'>retweeted your tweet</span>", new Date().getTime())}
         <div class="tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${txmsg.data.text}</div>
       </div>
    `;

}

