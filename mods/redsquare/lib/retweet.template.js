const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "retweeted your tweet", new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">
	   Retweet Goes Here
         </div>
       </div>
    `;

}

