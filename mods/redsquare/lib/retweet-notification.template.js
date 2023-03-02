const Tweet = require('./tweet');

module.exports = (app, mod, tx, retweet_tx, retweet_txmsg) => {

    let txsig = retweet_tx.transaction.sig;
    let text_to_show = retweet_txmsg.data.text;
    if (retweet_tx?.transaction?.sig) { txsig = retweet_tx.transaction.sig; }

    return `
        <div class="tweet notification-item-${tx.transaction.sig} tweet-notif-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
            ${SaitoUserTemplate(app, tx.transaction.from[0].add, "<i class='fa fa-repeat fa-notification'></i> <span class='notification-type'>retweeted your tweet</span>", app.browser.returnTime(new Date().getTime()))}
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${text_to_show}</div>
            </div>
          </div>
        </div>
    `;

}

