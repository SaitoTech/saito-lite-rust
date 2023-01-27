const SaitoUserWithTimeTemplate = require('./../../../lib/saito/new-ui/templates/saito-user-with-time.template');
const Tweet = require('./tweet');

module.exports = (app, mod, tx, retweet_tx, retweet_txmsg) => {

    let txsig = retweet_tx.transaction.sig;
    let text_to_show = retweet_txmsg.data.text;


    if (retweet_tx?.transaction?.sig) { txsig = retweet_tx.transaction.sig; }

    return `
       <div class=" notification-item notification-item-${tx.transaction.sig} liked-tweet-${txsig}" data-id="${txsig}">
         ${SaitoUserWithTimeTemplate(app, tx.transaction.from[0].add, "<i class='fa fa-repeat fa-notification'></i> <span class='notification-type'>retweeted your tweet</span>", new Date().getTime())}
         <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${text_to_show}</div>
       </div>
    `;

}

