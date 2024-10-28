module.exports  = (app, mod, league) => {
	let game = league.game.toLowerCase();

	let name = app.keychain.returnIdentifierByPublicKey(mod.publicKey, true);
	if (name == mod.publicKey) {
		name = 'Anonymous Player';
	}

	let html = `
	   <div class="league-join-overlay-box">
        <img src="/${game}/img/arcade/arcade.jpg" />
	`;

	/*let html = `
     <div class="league-join-overlay-box">
            <div class="join-overlay-header">
          <div class="game-image" style="background-image: url('/${game}/img/arcade/arcade.jpg')"></div>
          <div class="title-box">
            <div class="title">${league.name}</div>
            <div class="description">${league.game} League</div>
               ${app.browser.returnAddressHTML(league.admin)}
          </div>
        </div>
        <div class="league-join-info">

        `;
  */

	if (league.rank >= 0) {
		return (
			html +
			`
	        <div class="title-box">
		    	<div class="title">League Joined</div>
			</div>
			<div class="league-join-info">
				<p>Note: Make sure you get in touch with the league admin, so you can get some games scheduled</p>
			</div>
	  	  	<div class="league-join-controls">
	  	  		<div class="saito-overlay-form-alt-opt" style="text-decoration:unset;">Redirecting to League View in <span id="countdown">5</span>s...</div>
				<div id="gonow" class="saito-overlay-form-alt-opt">Redirect now</div>
			</div>
	    </div>
	   `
		);
	} else {
		html += `
		    <div class="title-box">
		    	<div class="title">${league.name}</div>
			</div>
			<div class="league-join-info">
				<p>Click below to join this ${league.game} league as <span class="address">"${name}"</span>. If you already have an account, please login before joining.</p>
			</div>
	  	  	<div class="league-join-controls">
				<div class="saito-overlay-form-alt-opt">or login to account</div>
	        	<button type="button" class="saito-button-primary fat" id="league-join-btn" data-id="${league.id}">JOIN LEAGUE</button>    
	      	</div>
	    </div>

	   `;
	}

	return html;
};
