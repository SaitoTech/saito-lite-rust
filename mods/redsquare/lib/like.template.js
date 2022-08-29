const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item">
         ${SaitoUser(app, mod, tx.transaction.from[0].add, "liked your tweet", new Date().getTime())}
       </div>
    `;

}

