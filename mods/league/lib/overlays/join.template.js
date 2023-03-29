module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();
	let pubKey = app.wallet.returnPublicKey();
	let key = app.keychain.returnKey({ publickey : pubKey });
	let user_email = key.email || "";

	let name = app.keychain.returnIdentifierByPublicKey(pubKey, true);
	if (name == pubKey){
		name = "Anonymous Player";
	}

	console.log(JSON.parse(JSON.stringify(league)));

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

	  	return html + `
	        <div class="title-box">
		    	<div class="title">League Joined</div>
			</div>
	    </div>
	   `;	  
  	
	} else {

		html += `
		    <div class="title-box">
		    	<div class="title">${league.name}</div>
			</div>
			<div class="league-join-info">
				<div class="league-join-username"><div>Welcome:</div><div class="address">${name}!</div></div>
			</div>
	  	  	<div class="league-join-controls">
				<div class="saito-overlay-form-alt-opt">login/recover</div>
	        	<button type="button" class="saito-button-primary fat" id="league-join-btn" data-id="${league.id}">JOIN LEAGUE</button>    
	      	</div>
	    </div>

	   `;

	}

	return html;

};

