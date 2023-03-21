module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();
	let pubKey = app.wallet.returnPublicKey();
	let key = app.keychain.returnKey({ publickey : pubKey });
	let user_email = key.email || "";

	console.log(JSON.parse(JSON.stringify(league)));

	let html = `
	   <div class="league-join-overlay-box">
        <img src="/${game}/img/arcade/arcade.jpg" />
        <div class="title-box">
		       <div class="title">${league.name}</div>
		       <div class="description">${league.description}</div>
		    </div>
		    <div class="league-join-controls">
						`;

  if (league.rank) {

	  return html+`
	        <p>You've joined this league</p>  
	        <p>Create a game at <a href="/arcade">Arcade</a> , or join the conversation at <a href="/redsquare">Redsquare</a></p>
	      </div>
	    </div>

	   `;	  
  	
	} else {

		if (user_email){
			html+= `<p>Note: joining the league will share your email (${user_email}) with the admin</p>`;
		}

	  return html + `
	        <button type="button" class="saito-button-primary fat" id="league-join-btn" data-id="${league.id}">JOIN LEAGUE</button>    
	      </div>
	    </div>

	   `;

	}

};

