const SaitoUser = require('./../../../../lib/saito/ui/templates/saito-user.template');

module.exports = (app, mod, tx) => {
	let txmsg = {};
	try {
		txmsg = tx.returnMessage();
	} catch (err) {
		txmsg = tx.msg;
	}
	let invite = txmsg.invite;

	//
	// is invite accepted
	//
	let is_invite_accepted = true;
	if (invite.adds.length > invite.sigs.length) {
		is_invite_accepted = false;
	}
	for (let i = 0; i < invite.adds.length; i++) {
		if (invite.sigs[i] == '') {
			is_invite_accepted = false;
		}
	}

	//
	// text
	//
	let tweet_text = invite.title;
	if (invite.description) {
		tweet_text += '<p></p>';
		tweet_text += invite.description;
		tweet_text += '<p></p>';
	}

	//
	// userline
	//
	let d = new Date(invite.datetime);
	let sd = app.browser.formatDate(d.getTime());

	let userline = `has created an invitation for <span style="color:darkred;font-weight:bold;font-size:1.75rem;">${sd.month} ${sd.day} ${sd.year} ${sd.hours}:${sd.minutes}</span>`;

	//
	// participants
	//
	let participants = '';
	let added = 0;
	for (let i = 0; i < invite.adds.length; i++) {
		let status =
			'<span class="saito-primary-color saito-primary">yet to accept</span>';
		if (invite.terms[i] === 'on accept' && invite.sigs.length >= i + 1) {
			if (invite.sigs[i] !== '') {
				status =
					'<span class="saito-primary-color saito-primary">accepted</span>';
			}
		}
		participants += `${SaitoUser(app, invite.adds[i], status)}`;
		added++;
	}
	while (added < invite.num) {
		participants += `${SaitoUser(app, 'open slot', 'anyone can join')} `;
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

	let html;

	if (is_invite_accepted) {
		html = `
        <div class="tweet invite-${invite.invite_id}" data-id="${
	invite.invite_id
}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
  	    ${SaitoUser(app, invite.adds[0], userline)}
    	  </div>
          <div class="tweet-body">
            <div class="tweet-sidebar"></div>
            <div class="tweet-main">
              <div class="tweet-text">
	        <div style="margin-top:1.5rem;margin-bottom:1.5rem;font-size:2rem;font-weight:bold;">
                  ACCEPTED - ${tweet_text} 
	        </div>
	        <div style="">
	        </div>
	        <div style="">
	          ${participants}
	        </div>
	      </div>
            </div>
          </div>
        </div>
      `;
	} else {
		html = `
        <div class="tweet invite-${invite.invite_id}" data-id="${
	invite.invite_id
}">
          <div class="tweet-notice"></div>
          <div class="tweet-header">
  	    ${SaitoUser(app, invite.adds[0], userline)}
    	  </div>
          <div class="tweet-body">
            <div class="tweet-sidebar"></div>
            <div class="tweet-main">
              <div class="tweet-text">
	        <div style="margin-top:1.5rem;margin-bottom:1.5rem;font-size:2rem;font-weight:bold;">
                  ${tweet_text} 
	        </div>
	        <div style="">
	          ${participants}
	        </div>
	      </div>
              <div class="tweet-controls">
	        ${controls}
              </div>
            </div>
          </div>
        </div>
    `;
	}

	return html;
};
