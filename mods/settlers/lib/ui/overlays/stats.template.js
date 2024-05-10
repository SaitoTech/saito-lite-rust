module.exports = SettlersStatsOverlayTemplate = (stats, winner) => {
	let players_count = stats.mod.game.state.players.length;

	let highest_count = stats.mod.game.stats.dice[2];
	// get highest count
	for (let i = 2; i <= 12; i++) {
		if (stats.mod.game.stats.dice[i] > highest_count) {
			highest_count = stats.mod.game.stats.dice[i];
		}
	}

	let player_count = stats.mod.game.state.players.length;
	let max_bar_height = player_count >= 3 ? 10 : 12;

	// height for 1 count;
	let base_height = max_bar_height / highest_count;

	let html = `
      <div class="settlers-stats-overlay saitoa">
      	<div class="stats-header">
      		<div class="overlay-tab active-tab" id="overview-tab">Overview</div>
      		<div class="overlay-tab" id="details-tab">Detailed History</div>
      	</div>
      	<div class="overlay-page active-page" id="overview-page">
      `;

	if (winner) {
		html += `<h1>Game Over:<br>${winner} wins!</h1>`;
	} 


	//
	//Scoring
	//
	html += `<div class="settlers-state-container">
						 <div class="settlers-stats-row">
             	<div class="settlers-stats-player">Scoring</div>
              <div class="settlers-stats-vp" title="Village">
                <img src="/settlers/img/icons/village.png">
              </div>
              <div class="settlers-stats-vp title="City">
              	<img src="/settlers/img/icons/city.png">
              	<div class="settlers-stats-multiplier">&times;2</div>
              </div>
							<div class="settlers-stats-vp title="Victory Point Card">
								${stats.mod.vp.img}
							</div>
							<div class="settlers-stats-vp" title="Longest Road">`;
	if (stats.mod.game.state.longestRoad.player == 0){
		html += `${stats.mod.longest.svg}
							<div class="settlers-stats-vp-count">${stats.mod.longest.min}</div>
							<div class="settlers-stats-multiplier">+${stats.mod.longest.value}</div>`;
	}

	html +=		`</div>
							<div class="settlers-stats-vp" title="Largest Army">`;
	if (stats.mod.game.state.largestArmy.player == 0){
		html += `${stats.mod.s.img}
						<div class="settlers-stats-vp-count">3</div>
						<div class="settlers-stats-multiplier">+2</div>
		`;
	}
		
								 
	html +=			`</div>
						<div></div>
						</div>`;


  for (let i = 0; i < stats.mod.game.players.length; i++) {
		let numVil = 0;
		let numCity = 0;

		for (let j = 0; j < stats.mod.game.state.cities.length; j++) {
			if (stats.mod.game.state.cities[j].player === i + 1) {
				if (stats.mod.game.state.cities[j].level == 1) {
					numVil++;
				} else {
					numCity++;
				}
			}
		}

		html += `
		 <div class="settlers-stats-row">
      	<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>
				<div class="settlers-stat-num">${numVil}</div>`;

		if (numCity > 0){
			html += `<div class="settlers-stat-num">${numCity}</div>`;
		}else{
			html += `<div class="settlers-stat-num"></div>`;
		}
		
		if (stats.mod.game.state.players[i].vpc > 0) {
			html += `<div class="settlers-stat-num">${stats.mod.game.state.players[i].vpc}</div>`;
		}	else {
			html += `<div class="settlers-stat-num"></div>`;
		}	
  
  	html += `<div class="settlers-stat-num">${stats.mod.game.state.players[i].road}</div>`;

  	if (stats.mod.game.state.players[i].knights > 0){
  		html += `<div class="settlers-stat-num">${stats.mod.game.state.players[i].knights}</div>`;
  	}else{
  		html += `<div class="settlers-stat-num"></div>`;
  	}


	  html += `<div class="settlers-stat-num">${stats.mod.game.state.players[i].vp}</div></div>`;
  }

  html += "<hr></div>";

	//
	//Production Log
	//
	html += `<div class="settlers-state-container">`;

	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player">Production</div>`;
	for (let r in stats.mod.game.stats.production) {
		html += `	<div class="settlers-stats-card">
								<img src="/settlers/img/cards/${r}.png">
							</div>
		`;
	}

	html += `<div></div></div>`;

	for (let i = 0; i < stats.mod.game.players.length; i++) {
			let total = 0;
			html += `<div class="settlers-stats-row">
								<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>`;
	
			for (let r in stats.mod.game.stats.production) {
				total += stats.mod.game.stats.production[r][i];
					if (stats.mod.game.stats.production[r][i] > 0){
						html += `<div class="settlers-stat-num">${stats.mod.game.stats.production[r][i]}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total}</div></div>`;	
	}	

	html += `<hr></div>`;	

	//
	// Losses
	//
	html += `<div class="settlers-state-container">`;
	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player">Losses</div>`;
	for (let r in stats.mod.game.stats.production) {
		html += `	<div class="settlers-stats-card">
								<img src="/settlers/img/cards/${r}.png">
							</div>
		`;
	}

	html += `<div></div></div>`;

	for (let i = 0; i < stats.mod.game.players.length; i++) {
			let total = 0;
			html += `<div class="settlers-stats-row">
								<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>`;
	
			for (let r in stats.mod.game.stats.production) {
				let sum = stats.mod.game.stats.robbed[r][i] + stats.mod.game.stats.discarded[r][i]; 
				total += sum;
					if (sum > 0){
						html += `<div class="settlers-stat-num">-${sum}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total > 0? `-${total}` : ""}</div></div>`;	
	}	

	html += `</div>`;	


	html += `</div>
		<div class="overlay-page" id="details-page">`


		//Fucking Dice
		html += `<div class="settlers-state-container">
<!--                  <div class="settlers-stats-player">Dice Rolls</div> -->
        `;

		html += `<div class="settlers-dice-histogram">`;
		for (let i = 2; i <= 12; i++) {
			let bar_height = base_height * stats.mod.game.stats.dice[i];
			html += `  <div class="settlers-dice-bar dice-${i} ${
				stats.mod.game.stats.dice[i] > 0
					? 'has_been_rolled'
					: 'never_rolled'
			}" data-dice-rolls="${i}" style="height:${bar_height}rem;">
                      <div class="settlers-dice-count">${
							stats.mod.game.stats.dice[i]
						}</div>`;

			for (let j = 0; j < players_count; j++) {
				let player_bar_height =
					base_height * stats.mod.game.stats.dicePlayer[i][j];
				html += `<div class="settlers-dice-count-player p${stats.mod.game.colors[j]}" style="height:${player_bar_height}rem;"></div>`;
			}

			html += '</div>';
		}
		html += `</div>`;

		html += `<div class="settlers-dice-numbers">`;
		for (let i = 2; i <= 12; i++) {
			html += `<div class="settlers-dice-number">${i}</div>`;
		}
		html += `</div>
                </div>`;


    html += `<div class="settlers-hist-container hide-scrollbar">
    	<div class="settlers-hist-row">
    		<div></div>`;

   	for (let i = 0; i < stats.mod.game.players.length; i++) {
    	html += `<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>`;
		}

		html += "</div>";

		for (let j = stats.mod.game.stats.history.length - 1; j >= 0; j--){
			html += `<div class="settlers-hist-row">
						<div class="roll">
							<span>${j+1}: </span>
							<span>${stats.mod.game.stats.history[j].roll}</span>
						</div>`;

			for (let i = 1; i <= stats.mod.game.players.length; i++) {
				html += `<div class="hist-cards">`;
				if (stats.mod.game.stats.history[j]?.harvest[i]){
					let res = stats.mod.game.stats.history[j].harvest[i].sort();
					for (let r of res){
						html += `<div class="settlers-stats-card">
												<img src="/settlers/img/cards/${r}.png">
											</div>`
					}
				}
				if (stats.mod.game.stats.history[j]?.bandit[i]){
					let res = stats.mod.game.stats.history[j].bandit[i].sort();
					for (let r of res){
						html += `<div class="settlers-stats-card no-vp">
												<img src="/settlers/img/cards/${r}.png">
											</div>`
					}
				}
				html += "</div>";				
			}
			html += "</div>";
		}



	html += 	`</div>`;

	return html + '</div>';
};
