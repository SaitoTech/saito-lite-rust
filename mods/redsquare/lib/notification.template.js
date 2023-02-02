const SaitoUser = require('./../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, tweet) => {

  let tx = tweet.tx;
  let publickey = tx.transaction.from[0].add;
  let userline = "replied to your tweet...";
  let txmsg = tx.returnMessage();
  let text = "content of notification box";
  
  for (let i = 0; i < tx.transaction.to.length; i++) {
    if (tx.transaction.to[i].add == app.wallet.returnPublicKey()) {
      activity = "mentioned you...";
    }
  }

  if (txmsg.request === "like tweet") {
    activity = "liked your tweet";
  }

  return `
        <div class="tweet" id="tweet-${tweet.tx.transaction.sig}" data-id="${tweet.tx.transaction.sig}">
          <div class="tweet-notice">${notice}</div>
          <div class="tweet-header">
            ${SaitoUser(app, publickey, userline)}
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="tweet-text">${text}</div>
              <div class="tweet-preview tweet-preview-${tweet.tx.transaction.sig}"></div>
            </div>
          </div>
        </div>
  `;

}

