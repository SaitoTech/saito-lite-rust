module.exports = (app, mod, tx) => {
  let txmsg = tx.returnMessage();
  let txsig = "";
  let tweet_to_show = "";
  if (txmsg.data?.sig) {
    txsig = txmsg.data.sig;
  }

  return `
        <div class="tweet notification-item-${tx.signature} tweet-notif-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
          </div>
          <div class="tweet-body">
            <div class="tweet-sidebar">
            </div>
            <div class="tweet-main">
              <div class="notification-tweet" id="tweet-${tx.signature}" data-id="${tx.signature}">${tweet_to_show}</div>
            </div>
          </div>
        </div>
    `;
};

