const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item notification-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "<i class='fas fa-heart fa-notification'></i> <span class='notification-type'>liked your tweet</span>", new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-ed823481428a90a28e2e07f52dd2b5861e2a1dc8c6d73e110e7ab92ce47ed65c26be1d0110b42bbc1de717e5afaefc3838482a5e78f0386d66a6fdd89275d1c5" data-id="ed823481428a90a28e2e07f52dd2b5861e2a1dc8c6d73e110e7ab92ce47ed65c26be1d0110b42bbc1de717e5afaefc3838482a5e78f0386d66a6fdd89275d1c5">           
            <div class="tweet" id="tweet-ed823481428a90a28e2e07f52dd2b5861e2a1dc8c6d73e110e7ab92ce47ed65c26be1d0110b42bbc1de717e5afaefc3838482a5e78f0386d66a6fdd89275d1c5" data-id="ed823481428a90a28e2e07f52dd2b5861e2a1dc8c6d73e110e7ab92ce47ed65c26be1d0110b42bbc1de717e5afaefc3838482a5e78f0386d66a6fdd89275d1c5">Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.<br><br>Red Square is an open media and gaming platform running on the Saito network. Learn why Saito matters and how to build applications on our Saito Wiki. And please report bugs to our community team of devs.</div>
         </div>
       </div>
    `;

}

