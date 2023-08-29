  
  
  //
  // utility function to convert sector32 to 3_2 or whatever
  //
  convertSectorToSectorname(sectorN) {

    for (let i in this.game.board) {
      if (this.game.board[i].tile == sectorN) {
	return i;
      }
    }

    return "";

  }  


  convertPlanetIdentifierToSector(planet_identifier) {

    for (let i in this.game.board) {
      let sector = this.game.board[i].tile;
      let this_sector = this.game.sectors[sector];

      for (let z = 0; z < this_sector.planets.length; z++) {
	if (this_sector.planets[z] == planet_identifier) { return sector; }
      }
    }

    return null;

  }


  returnPlanetIdxOfPlanetIdentifierInSector(planet_identifier, sector) {

    let sys = this.returnSectorAndPlanets(sector);
    for (let i = 0; i < sys.p.length; i++) {
      for (let z in this.game.planets) {
	if (z == planet_identifier) {
          if (sys.p[i] == this.game.planets[z]) { return i; }
	}
      }
    }

    return -1;

  }


  
  
  /////////////////////////
  // Return Turn Tracker //
  /////////////////////////
  returnPlayerTurnTracker() {
    let tracker = {};
    tracker.activate_system = 0;
    tracker.production = 0;
    tracker.invasion = 0;
    tracker.action_card = 0;
    tracker.trade = 0;
    tracker.action = 0;
    return tracker;
  };
  
  
  
  ///////////////////////
  // Imperium Specific //
  ///////////////////////
  endTurn(nextTarget = 0) {

    for (let i = this.rmoves.length - 1; i >= 0; i--) {
      this.moves.push(this.rmoves[i]);
    }

    if (nextTarget != 0) {
      extra.target = nextTarget;
    }
  
    this.game.turn = this.moves;
    this.moves = [];
    this.rmoves = [];
    this.sendGameMoveTransaction("game", {});

    this.updateStatus("Waiting for information from peers....");
  
  };

  
  sendGameOverTransaction(winner, method) {
    this.game.over = 1;
  
    if (this.active_browser == 1) {
      salert("The Game is Over!");
    }
  };
  
  
  
  resetConfirmsNeeded(num) {

    this.game.confirms_needed   = num;
    this.game.confirms_received = 0;
    this.game.confirms_players  = [];
    this.game.tmp_confirms_received = 0;
    this.game.tmp_confirms_players  = [];

    // if confirms in the number of players, we set them all as active
    if (this.game.confirms_needed == this.game.state.players_info.length) {
      for (let i = 1; i <= this.game.state.players_info.length; i++) {
	this.setPlayerActive(i);
      }
    }

  }


  returnAdvancedOptions() {

    let player_upper_limit = this.maxPlayers;
    try {
      player_upper_limit = document.querySelector('.game-wizard-players-select').value;
    } catch (err) {}

    let html = `

      <div style="padding:40px;width:85vw;max-height:90vh;overflow-y:scroll;display:grid;grid-template-columns: 200px auto">

        <div style="top:0;left:0;margin-right: 20px;">

            <label for="game_length ">Game Length:</label>
            <select name="game_length">
              <option value="4">4 VP</option>
              <option value="6">6 VP</option>
              <option value="8" selected>8 VP</option>
              <option value="10">10 VP</option>
              <option value="12">12 VP</option>
              <option value="14">14 VP</option>
            </select>

        </div>
        <div>

    `;

    for (let i = 1; i <= player_upper_limit; i++) {
      html += `
            <label for="player${i}" class="game-players-options game-players-options-${i}p">Player ${i}:</label>
            <select name="player${i}" id="game-players-select-${i}p" class="game-players-options game-players-options-${i}p">
              <option value="random" default>random</option>
              <option value="faction1" default>Sol Federation</option>
              <option value="faction2">Universities of Jol Nar</option>
              <option value="faction3">XXcha Kingdom</option>
              <option value="faction4">Sardakk N'Orr</option>
              <option value="faction5">Brotherhood of Yin</option>
              <option value="faction6">Yssaril Tribes</option>
              <option value="faction7">Embers of Muaat</option>
              <option value="faction8">Emirates of Hacan</option>
            </select>
      `;
    }


    html += `
        </div>
      </div>
    `;

    return html;
  }

