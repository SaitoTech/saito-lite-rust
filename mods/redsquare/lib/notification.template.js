const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');
const Tweet = require('./tweet');

module.exports = (app, mod, tx) => {

    let activity = "replied to your tweet...";
    if (!tx.transaction.to[0].includes(app.wallet.returnPublicKey())) {
      let activity = "mentioned you...";
    }
    if (!tx.msg.request === "like tweet") {
      let activity = "liked your tweet";
    }

    let tweet = new Tweet(app, mod, tx);
    tweet.generateTweetProperties(app, mod, 0);
    let embedded_html = tweet.returnHTML(app, mod, 0, 0);

    return `
       <div class="redsquare-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, activity)}
	 ${embedded_html}
       </div>
    `;

}

