const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item notification-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "<i class='fas fa-heart fa-notification'></i> <span class='notification-type'>liked your tweet</span>", new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">           
            <div class="tweet" id="tweet-${tx.transaction.sig}" data-id="${tx.transaction.sig}">Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.</div>
         </div>
       </div>
    `;

}

