module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();
	let pubKey = app.wallet.returnPublicKey();
	let key = app.keychain.returnKey({ publickey : pubKey });
	let user_email = key.email || "";

	console.log(JSON.parse(JSON.stringify(league)));

	/*let html = `
	   <div class="league-join-overlay-box">
        <img src="/${game}/img/arcade/arcade.jpg" />
        <div class="title-box">
		    <div class="title">${league.name}</div>
		    <div class="description">${league.description}</div>
		</div>
		<div class="league-join-controls">
	`;*/

	let html = `
	   <div class="league-join-overlay-box">
      	  	<div class="join-overlay-header">
		  		<div class="game-image" style="background-image: url('/${game}/img/arcade/arcade.jpg')"></div>
		  		<div class="title-box">
			  		<div class="title">${league.name}</div>
			  		<div class="description">${league.status} ${league.game} League</div>
 	    		  	${app.browser.returnAddressHTML(league.admin)}
		  		</div>
	  		</div>
	  		<div class="league-join-info">
  	
	  		`;


  	if (league.rank >= 0) {

	  	return html + `
	        <p><em>Success!</em> You are currently unranked out of ${league.players.length} players.</p>  
	        <p>Create a game at <a href="/arcade">Arcade</a> , or join the conversation at <a href="/redsquare">Redsquare</a></p>
	    </div>
	    </div>
	   `;	  
  	
	} else {

		html += `<p>${league.description}</p>
			<div class="saito-overlay-subform">
				<div class="saito-overlay-form-alt-opt">login/recover</div>
				<div class="league-join-username">join the league as <span class="address">${app.keychain.returnIdentifierByPublicKey(pubKey, true)}</span></div>`;
		if (user_email){
			html+=
			`<input type="checkbox" class="saito-overlay-subform-checkbox" checked />
			<div class="saito-overlay-subform-text">i agree to share my email (${user_email}) with the league admin</div>`;
		}
		html += "</div>";

	  return html + `
	  	  <div class="league-join-controls">
	        <button type="button" class="saito-button-primary fat" id="league-join-btn" data-id="${league.id}">JOIN LEAGUE</button>    
	      </div>
	    </div>

	   `;

	}

};

