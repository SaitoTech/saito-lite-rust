const SaitoUser = require('./../../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, invite) => {

    console.log("WHAT IS OUR INVITE? " + JSON.stringify(invite));

    //
    // text
    //
    let tweet_text = invite.title;
    if (invite.description) { 
      tweet_text += '<p></p>';
      tweet_text += invite.description; 
    }

    //
    // userline
    //
    let userline = "has created an invitation";


    //
    // participants
    //
    let participants = "";
    let added = 0;
    for (let i = 0; i < invite.adds.length; i++) {
console.log("invite adds: " + i);
      let status = '<span class="saito-primary-color saito-primary">yet to accept</span>';
console.log("terms: " + invite.terms[i] + " -- " + invite.sigs.length + " vs " + (i+1));
      if (invite.terms[i] === "on accept" && invite.sigs.length >= (i+1)) {
console.log("terms met: " + invite.sigs.length);
	if (invite.sigs[i] !== "") {
console.log("and sigs not null");
          status = '<span class="saito-primary-color saito-primary">accepted</span>';
        }
      }
      participants += `${SaitoUser(app, invite.adds[i], status) }`;
      added++;
    }
    while (added < invite.num) {
      participants += `${SaitoUser(app, "open slot", "anyone can join")} `;
      added++;
    }

    //
    // controls
    //
    let controls = `
             <div class="invites-invitation-controls" id="invites-invitation-controls-${invite.invite_id}">
               <div id="invites-invitation-join-${invite.invite_id}" class="invites-invitation-join saito-button-secondary small" data-id="${invite.invite_id}">join</div>
               <div id="invites-invitation-accept-${invite.invite_id}" class="invites-invitation-accept saito-button-secondary small" data-id="${invite.invite_id}">accept</div>
               <div id="invites-invitation-cancel-${invite.invite_id}" class="invites-invitation-cancel saito-button-secondary small" data-id="${invite.invite_id}>cancel</div>
             </div>
    `;


    let html = `

      <div class="tweet invite-${invite.invite_id}" data-id="${invite.invite_id}">

        <div class="tweet-notice"></div>

        <div class="tweet-header">
	  ${SaitoUser(app, invite.adds[0], userline)}
    	</div>
  
        <div class="tweet-body">
          <div class="tweet-sidebar"></div>
          <div class="tweet-main">
            <div class="tweet-text">
              ${tweet_text} 
	      ${participants}
	    </div>
            <div class="tweet-controls">
	      ${controls}
            </div>
          </div>
        </div>

      </div>

    `;

    return html;

}

