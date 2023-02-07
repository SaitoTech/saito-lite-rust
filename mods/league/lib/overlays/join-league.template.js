module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();
	let pubKey = app.wallet.returnPublicKey();
	let user_email = app.keychain.returnEmail(pubKey);

	let info_html = `<span class="saito-tooltip-box"></span>`;
	let html = 	`
    	<div class="league-join-overlay-box">
    		<img src="/${game}/img/arcade/arcade.jpg">
    		<div class="title-box">
			<div class="title">${league.name}</div> ${info_html}
		</div>
    		<div class="league-join-controls">
    	`;

    	if (typeof league.myRank != "undefined" && league.myRank > 0) {

		html += `	<p class="league-join-email-note">You've joined this league</p>  
				<p class="league-join-email-note">Challenge other players at <a href="/arcade">Arcade</a> , <a href="/redsquare">Redsquare</a><a> </a></p>
		`;	    	
	} else {

		html += `<form id="league-join-form" data-league-id="${league.id}">`;
		if (user_email == '') {
			html += `
			<p class="league-join-email-note">joining a league requires an email address</p>    
			<input id="join-league-user-email" onfocus="this.placeholder=''" type="email" required placeholder="email address">`;
		} else {
			html += `<p class="league-join-email-note">Joining will share your email address with admin</p>
			<input id="join-league-user-email" type="hidden" value="${user_email}">
			`;
		}

		html += `
			<button type="submit" class="saito-button-primary fat league-join-btn" id="league-join-btn" data-cmd="join" >JOIN LEAGUE</button> 
			</form>
		`;

	}

	html += `
	    
	    </div>
        </div>
   	`;
 
   	return html;
};

