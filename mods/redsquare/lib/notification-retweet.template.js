const Tweet = require('./tweet');
const SaitoUserTemplate = require('./../../../lib/saito/ui/saito-user/saito-user.template');

module.exports = (app, mod, tx, retweet_tx, retweet_txmsg) => {

    let txsig = retweet_tx.transaction.asig;
    let text_to_show = retweet_txmsg.data.text;
    if (retweet_tx?.transaction?.sig) { txsig = retweet_tx.transaction.sig; }

    return `
        <div class="tweet tweet-notification notification-item-${tx.transaction.sig} tweet-notif-retweet-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header"></div>
          <div class="tweet-body">
            <div class="tweet-sidebar"></div>
            <div class="tweet-main">
              <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${text_to_show}</div>
            </div>
          </div>
        </div>
    `;

}

