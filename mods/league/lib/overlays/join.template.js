module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();
	let pubKey = app.wallet.returnPublicKey();
	let key = app.keychain.returnKey({ publickey : pubKey });
	let user_email = key.email || "";

	let info_html = `<span class="saito-tooltip-box"></span>`;

    	if (typeof league.myRank != "undefined" && league.myRank > 0) {

	  return `

    	    <div class="league-join-overlay-box">
    	      <img src="/${game}/img/arcade/arcade.jpg" />
    	      <div class="title-box">
	        <div class="title">${league.name}</div> ${info_html}
	      </div>
    	      <div class="league-join-controls">
	        <p class="league-join-email-note">You've joined this league</p>  
	        <p class="league-join-email-note">Challenge other players at <a href="/arcade">Arcade</a> , <a href="/redsquare">Redsquare</a><a> </a></p>
	      </div>
	    </div>

	   `;	  
  	
	} else {


	  return `

    	    <div class="league-join-overlay-box">
    	      <img src="/${game}/img/arcade/arcade.jpg" />
    	      <div class="title-box">
	        <div class="title">${league.name}</div> ${info_html}
	      </div>
    	      <div class="league-join-controls">
                <p class="league-join-email-note">joining a league shares your email address with the league admin, and enables email/password account login</p>
		<form id="league-join-form" name="league-join-form" data-form-id="${league.id}">
                  <div class="saito-login-overlay-field">
                    <input type="text" id="saito-login-email" class="saito-login-email" placeholder="email@domain.com" value="${user_email}" />
                  </div>

                  <div class="saito-login-overlay-field">
                    <input type="text" id="saito-login-password" class="saito-login-password" placeholder="password" value="" />
                  </div>

   	          <button type="submit" class="saito-button-primary fat league-join-btn" id="league-join-btn" data-cmd="join" >JOIN LEAGUE</button> 
	        </form>
	      </div>
	    </div>

	   `;

	}

};

