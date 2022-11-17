module.exports = JoinLeagueTemplate = (app, mod, league) => {

	let game = league.game.toLowerCase();

	let info_html = `<span class="saito-tooltip-box"></span>`;
	let html = 	`
    	<div class="league-join-overlay-box">



    	<div class="league-join-info-box">
    		<div class="saito-module " data-payload="">
		      <div class="saito-module-image-box">
		         <div class="saito-module-image" style="background-image: url('/${game}/img/arcade/arcade.jpg')"></div>
		      </div>
		      <div class="saito-module-details-box">
		        <div class="saito-module-title">${league.name} ${info_html}</div>
		        <div class="saito-module-description">
		        	
		        	<p>${app.browser.stripHtml(league.description)}</p>
		        </div>
		      </div>  
		    </div>

		</div>

		<div class="league-join-controls">
    	    <input type="text" placeholder="Enter your email...">
				<button class="saito-button-secondary league-join-btn" id="league-join-btn" data-cmd="join" data-league-id="">JOIN LEAGUE</button> 
		</div>


<!--
    		<div class="saito-table league-join-table">
	          <div class="saito-table-body" id="league-table-ranking-body">
	            
	          	<div class="saito-table-row">
	          		<div>League Name</div>
	          		<div> ${league.name}</div>
	          	</div>

	          	<div class="saito-table-row">
	          		<div>League Game</div>
	          		<div> ${league.game}</div>
	          	</div>

	          	<div class="saito-table-row">
	          		<div>Type</div>
	          		<div> ${league.type}</div>
	          	</div>

	          	<div class="saito-table-row">
	          		<div>Players</div>
	          		<div> ${league.playerCnt}</div>
	          	</div>

	          	<div class="saito-table-row">
	          		<div>League Info</div>
	          		<div> ${app.browser.stripHtml(league.description)}</div>
	          	</div>

	          </div>
	        </div>

-->



        </div>
   	`;
 
   	return html;
};
