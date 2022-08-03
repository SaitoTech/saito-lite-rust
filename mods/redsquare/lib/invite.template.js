const SaitoUserWithAlert = require('./../../../lib/saito/new-ui/templates/saito-user-with-alert.template');
const SaitoUser = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {

    return `
       <div class="redsquare-item">
         ${SaitoUserWithAlert(app, mod, tx.transaction.from[0].add, "received recently", new Date().getTime())}
         <div class="redsquare-item-contents" id="redsquare-item-contents-${tx.transaction.sig}" data-id="${tx.transaction.sig}">
	   <div></div>
           <div class="redsquare-invite">

	     <div class="redsquare-invite-title">
               Twilight Struggle - League Match
             </div>

             <div class="redsquare-invite-comment">
             Wordblocks is a word game in which two to four players score points by placing TILES bearing a single letter onto a board divided into a grid of squares. The tiles must form words that, in crossword fashion, read left to right in rows or downward in columns, and be included in a standard dictionary or lexicon
             </div>

             <div class="redsquare-invite-participants">

	       ${SaitoUser(app, mod, tx.transaction.from[0].add)}
	       ${SaitoUser(app, mod, tx.transaction.from[0].add)}
	       ${SaitoUser(app, mod, tx.transaction.from[0].add)}
	       ${SaitoUser(app, mod, tx.transaction.from[0].add)}

             </div>

	     <div class="saito-button-secondary redsquare-invite-action">ACCEPT</div>

           </div>
         </div>
       </div>
    `;

}

