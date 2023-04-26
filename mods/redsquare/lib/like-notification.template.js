module.exports = (app, mod, tx) => {
  let txmsg = tx.returnMessage();
  let txsig = "";
  let tweet_to_show = "";
  let from = tx.transaction.from[0].add;

  if (txmsg.data?.sig) {
    txsig = txmsg.data.sig;
  }

  return `
        <div class="tweet notification-item-${tx.signature} tweet-notif-fav-${from}-${txsig}" data-id="${txsig}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
          </div>
        </div>
    `;
};
