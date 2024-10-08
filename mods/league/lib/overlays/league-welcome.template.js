module.exports  = (app, league) => {
	let html = `
	   <div class="league-join-overlay-box email-box">
        <div class="title-box">
		    	<div class="title">${league.name}</div>
		    	<div>Send a message to <span class="admin-name" title="${app.keychain.returnIdentifierByPublicKey(
		league.admin,
		true
	)}">the league admin</span> with your name and contact info</div>
				</div>`;
	if (!app.keychain.hasSharedSecret(league.admin)) {
		html += `<div class="warning">Warning: this message will be unencrypted</div>`;
	}
	html += `<textarea rows="8" class="email-to-admin text-input" id="email-to-admin" cols="60">
I'm excited about playing in the league. 

Please message or email me at: 


Sincerely,
	<YOUR NAME>
		</textarea>

  	  	<div class="league-email-controls">
        	<button type="button" class="saito-button-primary fat" id="league-email-btn" data-id="${league.id}">SUBMIT</button>    
      	</div>

      </div>

	`;

	return html;
};
