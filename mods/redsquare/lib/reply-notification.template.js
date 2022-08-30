const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item notification-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "<i class='fas fa-comment fa-notification'></i> <span class='notification-type'>replied to your tweet</span>", new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">	           
            <div class="tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">I would shop elsewhere... but B&B has replaced every other clothing store in every shopping outlet within a 30 minute drive</div>
         </div>
       </div>
    `;

}

