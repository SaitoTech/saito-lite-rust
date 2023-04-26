const Tweet = require("./tweet");
const SaitoUserTemplate = require("./../../../lib/saito/ui/saito-user/saito-user.template");

module.exports = (app, mod, tx, retweet_tx, retweet_txmsg) => {
  let txsig = retweet_tx.transaction.asig;
  let text_to_show = retweet_txmsg.data.text;
  if (retweet_tx?.signature) {
    txsig = retweet_tx.signature;
  }

  console.log("ABOUT TO USER TEMPLATE THIS PUPPY");

  return `
        <div class="tweet notification-item-${
          tx.signature
        } tweet-notif-retweet-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
            ${SaitoUserTemplate({
              app: app,
              publickey: tx.from[0].publicKey,
              notice:
                "<i class='fa fa-repeat fa-notification'></i> <span class='notification-type'>retweeted your tweet</span>",
              fourthelem: app.browser.returnTime(new Date().getTime()),
            })}
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="notification-tweet" id="tweet-${tx.signature}" data-id="${
    tx.signature
  }">${text_to_show}</div>
            </div>
          </div>
        </div>
    `;
};
