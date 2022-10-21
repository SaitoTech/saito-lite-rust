const SaitoUserSmall = require('./../../../../lib/saito/new-ui/templates/saito-user-small.template');
const SaitoUser = require('./../../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, invite) => {

    let html = `

       <div class="redsquare-item">

         ${SaitoUserSmall(app, mod, invite.creator, "received recently", new Date().getTime())}

         <div class="redsquare-item-contents" id="redsquare-item-contents-${invite.invite_id}" data-id="${invite.invite_id}">
	   <div></div>
           <div class="redsquare-invite">

	     <div class="redsquare-invite-title">
               Invitation Title
             </div>

             <div class="redsquare-invite-comment">

               We can have a description of the invitatino here.

             </div>

             <div class="redsquare-invite-participants">

    `;
    let added = 0;
    for (let i = 0; i < invite.adds.length; i++) {
      let status = '<span class="saito-primary-color saito-primary">yet to accept</span>';
      if (invite.terms[i] === "on accept") {
        status = '<span class="saito-primary-color saito-primary">accepted</span>';
      }
      html += `   ${ SaitoUser(app, mod, invite.adds[i], status) } `;
      added++;
    }
    while (added < invite.num) {
      html += `   ${ SaitoUser(app, mod, "open slot", "anyone can join") } `;
      added++;
    }

    html += `
             </div>

             <div class="invites-invitation-controls" id="invites-invitation-controls-${invite.invite_id}">
               <div id="invites-invitation-join-${invite.invite_id}" class="invites-invitation-join saito-button-secondary small" data-id="${invite.invite_id}">join</div>
               <div id="invites-invitation-accept-${invite.invite_id}" class="invites-invitation-accept saito-button-secondary small" data-id="${invite.invite_id}">accept</div>
               <div id="invites-invitation-cancel-${invite.invite_id}" class="invites-invitation-cancel saito-button-secondary small" data-id="${invite.invite_id}>cancel</div>
             </div>

           </div>
         </div>
       </div>

    `;

    return html;

}

