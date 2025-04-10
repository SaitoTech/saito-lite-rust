module.exports = (stats, winner) => {
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
      <div class="settlers-stats-overlay saitoa`

    if (winner) {
		//html += ` winner`;
	} 
	  
	html +=  `">
      	<div class="stats-header">
      		<div class="overlay-tab active-tab" id="overview-tab">Overview</div>
      		<div class="overlay-tab" id="resource1-tab">Res. I</div>
      		<div class="overlay-tab" id="resource2-tab">Res. II</div>
      		<div class="overlay-tab" id="timeline-tab">Timeline</div>
      	</div>
      	<div class="overlay-page active-page" id="overview-page">
      `;

	if (winner) {
		html += `<h1>${winner} wins!</h1>`;
	} 


		//Fucking Dice
		html += `<div class="settlers-state-container">
<!--                  <div class="settlers-stats-player">Dice Rolls</div> -->
        `;

		html += `<div class="settlers-dice-histogram" title="number of times each number has been rolled">`;
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

		html += `<div class="settlers-dice-numbers" title="dice roll">`;
		for (let i = 2; i <= 12; i++) {
			html += `<div class="settlers-dice-number">${i}</div>`;
		}
		html += `</div><div class="settlers-dice-numbers" title="rolls since number last came up">`;
		for (let i = 2; i <= 12; i++) {
			if (stats.mod.game.stats.famine[i] !== undefined){
				html += `<div class="settlers-number">${stats.mod.game.stats.famine[i]}</div>`;	
			}else{
				html += `<div class="settlers-number"></div>`;	
			}
		}

		html += `</div><hr></div>`;



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
							<div class="settlers-stats-vp" title="Victory Point Card">
								${stats.mod.vp.img}
							</div>
							<div class="settlers-stats-vp" title="Longest Road">
								${stats.mod.longest.icon}
								<div class="settlers-stats-vp-count">${Math.max(stats.mod.longest.min, stats.mod.game.state.longestRoad.size)}</div>
								<div class="settlers-stats-multiplier">+${stats.mod.longest.value}</div>
							</div>
							<div class="settlers-stats-vp" title="Largest Army">
								${stats.mod.s.img}
								<div class="settlers-stats-vp-count">${Math.max(3, stats.mod.game.state.largestArmy.size)}</div>
								<div class="settlers-stats-multiplier">+${stats.mod.largest.value}</div>
							</div>
							<div></div>
						</div>
		`;
	
	
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
  
  	if (stats.mod.game.state.longestRoad.player == i+1 ){
  		html += `<div class="settlers-stat-num"><i class="fa-solid fa-check"></i></div>`;	

  	}else{
  		html += `<div class="settlers-stat-num"></div>`;	
  	}

		if (stats.mod.game.state.largestArmy.player == i+1){
  		html += `<div class="settlers-stat-num"><i class="fa-solid fa-check"></i></div>`;	
		}else{
  		html += `<div class="settlers-stat-num"></div>`;	
		}

	  html += `<div class="settlers-stat-num">${stats.mod.game.state.players[i].vp}</div></div>`;
  }

  html += `<hr></div> <div class="settlers-state-container">
			    	<div class="settlers-hist-row">
			    		<div></div>`;

 	for (let i = 0; i < stats.mod.game.players.length; i++) {
  	html += `<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>`;
	}

	html += "</div>";

	let player_array = Array(stats.mod.game.players.length);
	player_array.fill(0);
	for (let j = 0; j < stats.mod.game.stats.history.length; j++){
		for (let i of stats.mod.game.stats.history[j].threatened){
			player_array[i-1]++;
		}
	}

  html += `<div class="settlers-hist-row">
  	<div class="settlers-stats-vp title="Rolls blocked by Bandit/Robber">
	  	<img src="/settlers/img/icons/bandit.png">
	  	<div class="settlers-stats-vp-count">%</div>
  	</div>`;
  for (let i of player_array){
  	html += `<div class="settlers-stat-num">${Math.round(1000*i/stats.mod.game.stats.history.length)/10 || "0"}</div>`;
  }

  html += `</div>`;

  html += `<div class="settlers-hist-row">
  	<div class="settlers-stats-vp title="Times moved Bandit/Robber">
	  	<img src="/settlers/img/icons/bandit.png">
	  	<div class="settlers-stats-vp-count">-></div>
  	</div>`;
  for (let i of stats.mod.game.stats.move_bandit){
  	html += `<div class="settlers-stat-num">${i}</div>`;
  }

  html += `</div></div></div>`;

	//
	//Production Log
	//

	html += `<div class="overlay-page" id="resource1-page">`;	

	html += `<div class="settlers-state-container">`;

	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Resources produced by dice rolls">Production</div>`;
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
	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Cards discarded or stolen by robber">Stolen</div>`;
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
				let sum = stats.mod.game.stats.robbed[r][i]; 
				total += sum;
					if (sum > 0){
						html += `<div class="settlers-stat-num">-${sum}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total > 0? `-${total}` : ""}</div></div>`;	
	}	

	html += "<hr></div>";

	//
	// Non-production
	//
	html += `<div class="settlers-state-container">`;
	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Resources blocked by presence of bandit">Blocked</div>`;
	for (let r in stats.mod.game.stats.production) {
		html += `	<div class="settlers-stats-card no-vp">
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
					if (stats.mod.game.stats.blocked[r][i] > 0){
						total += stats.mod.game.stats.blocked[r][i];
						html += `<div class="settlers-stat-num">${stats.mod.game.stats.blocked[r][i]}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total > 0? `${total}` : ""}</div></div>`;	
	}	

	html += "</div></div>";

//
// Page 2
//
	html += `<div class="overlay-page" id="resource2-page">`;	

	html += `<div class="settlers-state-container">`;

	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Resources discarded on 7">Discarded</div>`;
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
				let sum = stats.mod.game.stats.discarded[r][i]; 
				total += sum;
					if (sum > 0){
						html += `<div class="settlers-stat-num">-${sum}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total > 0? `${total}` : ""}</div></div>`;	
	}	

	html += `<hr></div>`;	

	//
	// Trades, pt 1
	//
	html += `<div class="settlers-state-container">`;
	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Cards traded to bank/port">Traded out</div>`;
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
					if (stats.mod.game.stats.banked[r][i] > 0){
						total += stats.mod.game.stats.banked[r][i];
						html += `<div class="settlers-stat-num">${stats.mod.game.stats.banked[r][i]}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}

		html += `<div class="settlers-stat-num">${total > 0? `-${total}` : ""}</div></div>`;	
	}	

	html += "<hr></div>";

	//
	// Trades, pt 2
	//
	html += `<div class="settlers-state-container">`;
	html += ` <div class="settlers-stats-row"><div class="settlers-stats-player hover-hint" title="Cards received from bank/port">Traded in</div>`;
	for (let r in stats.mod.game.stats.production) {
		html += `	<div class="settlers-stats-card no-vp">
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
					if (stats.mod.game.stats.traded[r][i] > 0){
						total += stats.mod.game.stats.traded[r][i];
						html += `<div class="settlers-stat-num">${stats.mod.game.stats.traded[r][i]}</div>`;
					}else{
						html += `<div class="settlers-stat-num"></div>`;
					}
			}
		html += `<div class="settlers-stat-num">${total > 0? `${total}` : ""}</div></div>`;	
	}	

	html += "</div>";


// Timeline

	html += `</div>
		<div class="overlay-page" id="timeline-page">`;

    html += `<div class="settlers-hist-container hide-scrollbar">
    	<div class="settlers-hist-row">
    		<div class="settlers-timeline-turn-lables"><div>Turn</div><div>Roll</div></div>`;

   	for (let i = 0; i < stats.mod.game.players.length; i++) {
    	html += `<div class="settlers-stats-player p${stats.mod.game.colors[i]}">${stats.mod.game.playerNames[i]}</div>`;
		}

		html += "</div>";


		for (let j = stats.mod.game.stats.history.length - 1; j >= 0; j--){
			html += `<div class="settlers-hist-row${stats.mod.game.stats.history[j].roll == 7 ? " robber" :""}">
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
