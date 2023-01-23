

module.exports = LeagueAdvancedOptionsTemplate = () => {
	let html = `
	<div class="league_options_overlay">
		<div class="overlay-title">Advanced League Options</div>

		<div class="overlay-input">   
	      <div class="label">
		      <label for="limit_players">Limit League Size:</label>
		      <input type="checkbox" name="limit_players" id="limit_players"/>
		  </div>
		  <div id="max_player_option" class="overlay-input" style="display:none">
		  	<label for="max_players">Max Players in League:</label>
	       	<input id="max_players" type="number" value="0" min="0" max="500"/>
		  </div>
	    </div>

	    <div class="overlay-input">
	        <div class="label">
	        	<label for="need_approval">Require Approval to Join:</label>
	        	<input type="checkbox" name="need_approval"/>
	        </div>
	    </div>

	    <div class="overlay-input">
		    <div class="label">
	        	<label for="exclusive">League Exclusivity:</label>
	        	<div class="tip">
	        		<i class="fa fa-question-circle" aria-hidden="true"></i>
	        		<div class="tiptext">Suppose you and a friend are both in two leagues covering the same game. If you play a game and those leagues are inclusive, both will update their stats. If a league is exclusive, only games created with the imprimatur of league will count towards that league. This is useful for tournaments where you want to distinguish official games from unofficial games.</div>
	        	</div>
	        </div>
		    <select id="exclusive">
		       <option value="inclusive" selected>Count all valid matches</option>
		       <option value="exclusive">Only count official matches</option>
		    </select>
	    </div>

	    <div class="overlay-input">
	        <div class="label">
	        	<label for="ranking">Ranking Algorithm:</label>
	        	<div class="tip">
	        		<i class="fa fa-question-circle" aria-hidden="true"></i>
	        		<div class="tiptext">EXP: players gain experience for playing games, ELO: within a pool of players, apply the ELO algorithm to discover the player's skill ranking</div>
	        	</div>
	        </div>
    	    <select id="ranking">
	        	<option value="exp">EXP</option>
        		<option value="elo">ELO</option>
      	    </select>
      	    <div id="starting_score_option" class="label" style="display:none;">
	        	<label for="starting_score">ELO starting score:</label>
	        	<input id="starting_score" type="number" value="0" min="0" max="2000" step="50" />
	        </div>
      	</div>

      	<div class="overlay-input">
      		<div class="label">
		      <label for="limit_season">Limit League Season:</label>
		      <input type="checkbox" name="limit_season" id="limit_season"/>
		  	</div>
	    </div>            
	    <div id="season_option" class="overlay-input" style="display:none;">
            <div class="gridme">
	            <div class="column">
	              <div class="label"><label for="startdate">Start:</label><div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">Games played before this date won't count towards League rankings, and players will no longer be able to join the league after this date (unless you check the option below)</div></div></div>
	              <input type="date" id="startdate" name="startdate">
	            </div>
	            <div class="column">
	              <div class="label"><label for="enddate">End:</label><div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">Games played after this date won't count towards League rankings</div></div></div>
	              <input type="date" id="enddate" name="enddate">
	            </div>
	        </div>
  	        <div class="label">
		        <label for="lateregister">Allow users to join the League after the start date</label>
	          	<input type="checkbox" name="lateregister" id="lateregister">
	        </div>
      	</div>

      	<div class="label">
      		<label for="fixedoptions">Preset league match game options</label>
      		<div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">Preselecting options for the league does two things. One, it makes it faster to create league games because league members can create a game invite with one-click. Two, it marks your league as exclusive, so that only league games will affect the leaderboard scores. In other words, even if a league player creates a game invite with the exact same options and plays against a fellow league member, that game will not count towards this league.</div></div>
      		<input type="checkbox" name="fixedoptions" id="fixedoptions">
      		<div class="secretbutton" id="selectoptions">Select Options</div>
      	</div>

		<div id="league-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button saito-button-primary small">Accept</div>
	</div>

	`;


	return html;	
}