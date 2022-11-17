module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();

	let info_html = `<span class="saito-tooltip-box"></span>`;
	let html = 	`
    	<div class="league-join-overlay-box">

    		<img src="/poker/img/arcade/arcade.jpg">
    		<div class="title-box">
			<div class="title">${league.name}</div> ${info_html}
		</div>
    		<div class="league-join-controls">

		    <p class="league-join-email-note">Joining a league requires an email address</p>
    
		    <input type="text" placeholder="Enter your email...">
		<button class="saito-button-primary small league-join-btn" id="league-join-btn" data-cmd="join" data-league-id="">JOIN LEAGUE</button> 
		</div>

        <div>

   	`;
 
   	return html;
};
