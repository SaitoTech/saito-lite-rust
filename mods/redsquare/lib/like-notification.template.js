const SaitoUserTemplate = require('./../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    let txmsg = tx.returnMessage();
    let txsig = "";
    let tweet_to_show = "";
    if (txmsg.data?.sig) { txsig = txmsg.data.sig; }

    return `
        <div class="tweet notification-item-${tx.transaction.sig} tweet-notif-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
            ${SaitoUserTemplate(app, tx.transaction.from[0].add, "<i class='fas fa-heart fa-notification'></i> <span class='notification-type'>liked your tweet</span>", app.browser.returnTime(new Date().getTime()))}
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="notification-tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">${tweet_to_show}</div>
            </div>
          </div>
        </div>
    `;

}

