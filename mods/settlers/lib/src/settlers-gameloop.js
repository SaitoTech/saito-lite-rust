const { ModuleResolutionKind } = require("typescript");

class SettlersGameloop {
  /*
   * Core Game Logic
   * Commands: init, generate_map, winner
   */
  async handleGameLoop() {
    let settlers_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      //
      // catch win condition
      //
      this.displayPlayers(); //Is it enough to update the player huds each iteration, board doesn't get redrawn at all?

      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");

      //console.log("QUEUE: " + this.game.queue);

      if (mv[0] == "init") {
        this.game.queue.splice(qe, 1);
        this.game.state.placedCity = null; //We are in game play mode, not initial set up
        this.game.state.lastroll = [0, 0];
        this.game.queue.push("round");
        //
        // what does this do and why is it not in an init function?
        //
        // initX()
        //
        $(".dark").css("background-color", "unset");
        return 1;
      }

      if (mv[0] == "round") {
        for (let i = this.game.players.length; i > 0; i--) {
          this.game.queue.push(`play\t${i}`);
        }
        return 1;
      }

      if (mv[0] == "generate_map") {
        console.log("Building the map");
        this.game.queue.splice(qe, 1);
        this.generateMap();
        this.addPortsToGameboard();
        if (this.browser_active && this.game.player == 0) {
          this.displayBoard();
        }
        //
        // we should not be running this ahead of READY
        // because it creates information in generateMap
        // that disappears,
        //
        this.saveGame(this.game.id);
        return 1;
      }

      if (mv[0] == "winner") {
        // 0-index
        let winner = parseInt(mv[1]);
        this.game.queue = [];
        this.game.canProcess = true;

        this.updateLog(`${this.formatPlayer(winner+1)} is ${this.winState} and wins the game!`);
        this.stats_overlay.render(this.game.playerNames[winner]);

        if (this.gameOverCallback){
          this.gameOverCallback();  
        }else{
          this.sendGameOverTransaction(this.game.players[winner]);
        }

        return 0;
      }

      /* Development Cards */

      if (mv[0] == "buy_card") {
        // 1-index
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        this.updateLog(`${this.formatPlayer(player)} bought a ${this.card.name} card`);
        this.game.state.canTrade = false;

        //the player will update their devcard count on next turn
        if (player != this.game.player) {
          this.game.state.players[player - 1].devcards.push("x"); //Add card for display
          this.updateStatus(`<div class="persistent player-notice">${this.game.playerNames[player - 1]} bought a ${this.card.name} card</div>`);
        } else {

          document.querySelector(".hud-body .mobile .cards").classList.remove("hidden");

          let lastcard = this.game.deck[0].cards[this.game.deck[0].hand[this.game.deck[0].hand.length - 1]];

          let html = `<span class="tip">${lastcard.card}
                        <div class="tiptext">${this.rules[lastcard.action]}</div>
                      </span>`;

          console.log("Current status: " + this.game.state.canPlayCard);
          if (lastcard.action == 0 && this.game.state.canPlayCard == null){
            this.game.state.players[player-1].devcards.push(this.game.deck[0].hand.pop());
            this.game.state.canPlayCard = true;
          }

          this.updateStatus(`<div class="persistent player-notice"><span>You bought ${html}</span></div>`);
        }
        return 1;
      }

      //Declare Victory point card
      if (mv[0] == "vp") {
        let player = parseInt(mv[1]);
        let cardname = mv[2]; //Maybe we want custom icons for each VPC?
        this.game.queue.splice(qe, 1);

        //Score gets recounted a lot, so we save the number of VP cards
        this.game.state.players[player - 1].vpc++; //Number of victory point cards for the player
        if (player != this.game.player){
          this.game.state.players[player - 1].devcards.pop(); //Remove card (for display)  
        }
        
        this.updateLog(
          `${this.formatPlayer(player)} played ${cardname} to gain 1 victory point`
        );

        this.updateStatus(
          `<div class="persistent player-notice">${this.game.playerNames[player - 1]} played ${cardname} to gain 1 victory point</div>`
        );

        return 1;
      }

      //Declare Road building
      if (mv[0] == "road_building") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        if (player != this.game.player){
          this.game.state.players[player - 1].devcards.pop(); //Remove card (for display)  
        }
        this.updateLog(`${this.formatPlayer(player)} played ${cardname}`);
        return 1;
      }

      //Knight
      if (mv[0] == "play_knight") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        this.updateLog(`${this.formatPlayer(player)} played a ${cardname}!`);
        if (player != this.game.player){
          this.game.state.players[player - 1].devcards.pop(); //Remove card (for display)  
        }
        //Update Army!
        this.game.state.players[player - 1].knights++;
        this.checkLargestArmy(player);

        //Move Bandit
        if (this.game.player == player) {
          this.playerPlayBandit();
        } else {
          this.updateStatus(
            `<div class="player-notice">${
              this.game.playerNames[player - 1]
            } played a ${cardname} and is moving the ${this.b.name}...</div>`
          );
        }
        return 0;
      }

      if (mv[0] == "year_of_plenty") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        let resources = JSON.parse(mv[3]); //The two resources the player picked

        this.game.queue.splice(qe, 1);

        for (let j of resources) {
          //Should always be 2
          this.game.state.players[player - 1].resources.push(j);
        }

        if (player != this.game.player){
          this.game.state.players[player - 1].devcards.pop(); //Remove card (for display)  
        }
        this.updateLog(`${this.formatPlayer(player)} played ${cardname}.`);
        return 1;
      }

      if (mv[0] == "monopoly") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        let resource = mv[3];
        this.game.queue.splice(qe, 1);
        let lootCt = 0;
        //Collect all instances of the resource
        for (let i = 0; i < this.game.state.players.length; i++) {
          if (player != i + 1) {
            let am_i_a_victim = false;
            for (let j = 0; j < this.game.state.players[i].resources.length; j++) {
              if (this.game.state.players[i].resources[j] == resource) {
                am_i_a_victim = true;
                lootCt++;
                this.game.state.players[i].resources.splice(j, 1);
                j--;
              }
            }
            if (am_i_a_victim && this.game.player == i + 1) {
              this.game.queue.push(`ACKNOWLEDGE\t${this.game.playerNames[player - 1]} stole all your ${resource}`);
            }else if (this.game.player == i + 1){
              this.updateStatus(`<div class="player-notice">${this.game.playerNames[player - 1]} played ${cardname} for ${resource}</div>`);
            }
          }
        }
        //Award to Player
        for (let i = 0; i < lootCt; i++)
          this.game.state.players[player - 1].resources.push(resource);

        if (this.game.player == player){
          this.updateStatus(`<div class="persistent player-notice">You collected ${lootCt} ${this.formatResource(resource)}</div>`);  
        }else{
          this.game.state.players[player - 1].devcards.pop(); //Remove card (for display)  
        }
        
        this.updateLog(
          `${
            this.formatPlayer(player)
          } played ${cardname} for ${this.formatResource(resource)}, collecting ${lootCt}.`
        );
        return 1;
      }

      /* Building Actions */
      if (mv[0] == "undo_build") {
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let purchase = parseInt(mv[2]);

        let key = this.r.name;
        if (purchase == 1){
          key = this.c1.name;
        }
        if (purchase == 2){
          key = this.c2.name;
        }
        this.updateLog(`${this.formatPlayer(player)} decided against building a ${key}`);

        let cost = this.priceList[purchase];
        for (let resource of cost) {
          this.game.state.players[player-1].resources.push(resource);  
        }

        return 1;
      }

      // remove a resource from players stockpile
      if (mv[0] == "spend_resource") {
        let player = parseInt(mv[1]);
        let resource = mv[2]; //string name: "ore", "brick", etc

        let target = this.game.state.players[player - 1].resources.indexOf(resource);
        if (target >= 0) {
          this.game.state.players[player - 1].resources.splice(target, 1);
        } else {
          console.log("Resource not found...", resource, this.game.state.players[player - 1]);
        }

        // Bandit discards 
        if (this.game.state.bandit){
          this.game.stats.discarded[resource][player - 1]++;
        }

        this.game.queue.splice(qe, 1);

        return 1;
      }

      // Build a road, let player pick where to build a road
      if (mv[0] == "player_build_road") {
        let player = parseInt(mv[1]);

        this.game.queue.splice(qe, 1);
        this.game.state.canTrade = false;
        if (this.game.player == player) {
          if (mv[2] == 1) {
            console.log("Last Placed City: " + this.game.state.last_city);
            let newRoads = this.hexgrid.edgesFromVertex(
              this.game.state.last_city.replace("city_", "")
            );
            for (let road of newRoads) {
              console.log("road: ", road);
              this.addRoadToGameboard(road.substring(2), road[0]);
            }
          }

          let canbackup = parseInt(mv[3]) || 0;
          this.playerBuildRoad(mv[1], canbackup);
        } else {
          this.updateStatus(
            `<div class="player-notice">${this.game.playerNames[player - 1]} is building a ${
              this.r.name
            }...</div>`
          );
        }
        return 0;
      }

      //Notify other players of where new road was built
      if (mv[0] == "build_road") {
        let player = parseInt(mv[1]);
        let slot = mv[2];
        this.game.queue.splice(qe, 1);

        console.log("Receive build road");

        this.game.state.roads.push({ player: player, slot: slot });

        let roadInfo = slot.split("_");
        this.addRoadToGameboard(roadInfo[2] + "_" + roadInfo[3], roadInfo[1]);

        //
        // This is kind of ridiculous, animation won't show up without a slight delay
        // but making buildroad async "breaks" caravan in that I won't unlock the new 
        // road options before the game queue continues
        //
        if (this.game.player == player){
          this.buildRoad(player, slot);  
        }else{
          setTimeout(()=> { this.buildRoad(player, slot); }, 100);
        }
        
        this.updateLog(`${this.formatPlayer(player)} built a ${this.r.name}`);
        if (this.checkLongestRoad(player)) {
          console.log("Longest Road:", this.game.state.longestRoad.path);
        }

        return 1;
      }

      // Build a town
      // Let player make selection, other players wait
      if (mv[0] == "player_build_city") {
        let player = parseInt(mv[1]);

        this.currently_active_player = player;

        this.game.queue.splice(qe, 1);
        this.game.state.canTrade = false;

        //For the beginning of the game only...
        if (this.game.state.welcome == 0 && this.browser_active) {
          try {
            this.welcome_overlay.render();
          } catch (err) {}
          this.game.state.welcome = 1;
        }

        if (this.game.player == player) {
          this.playerBuildTown(mv[1], parseInt(mv[2]));
        } else {
          this.updateStatus(
            `<div class="player-notice">${this.game.playerNames[player - 1]} is building a ${
              this.c1.name
            }...</div>`
          );
        }

        return 0; // halt game until next move received
      }

      //Get resources from adjacent tiles of second settlement during game set up
      if (mv[0] == "secondcity") {
        let player = parseInt(mv[1]);
        let city = mv[2];
        this.game.queue.splice(qe, 1);

        let logMsg = `${this.formatPlayer(player)} gains `;
        for (let hextile of this.hexgrid.hexesFromVertex(city)) {
          let bounty = this.game.state.hexes[hextile].resource;
          if (bounty !== this.returnNullResource()) {
            //DESERT ATTACK
            logMsg += this.formatResource(bounty);
            this.game.state.players[player - 1].resources.push(bounty);
            this.game.stats.production[bounty][player - 1]++; //Initial starting stats
            this.animateHarvest(player, bounty, hextile);
          }
        }
        this.runAnimationQueue();
        this.updateLog(logMsg);
        return 0;
      }

      //Allow other players to update board status
      if (mv[0] == "build_city") {
        let player = parseInt(mv[1]);
        let slot = mv[2];

        this.game.queue.splice(qe, 1);

        if (this.game.player != player) {
          this.buildCity(player, slot);
        }

        this.updateLog(`${this.formatPlayer(player)} built a ${this.c1.name}`);

        //Check for edge case where the new city splits a (longest) road
        let adj_road_owners = {};
        let newRoads = this.hexgrid.edgesFromVertex(slot.replace("city_", ""));
        let bisect = -1;
        for (let road of newRoads) {
          //Check if adjacent edge is a built road and if so, who owns it
          for (let i = 0; i < this.game.state.roads.length; i++) {
            if (this.game.state.roads[i].slot == "road_" + road) {
              if (!adj_road_owners[this.game.state.roads[i].player]) {
                adj_road_owners[this.game.state.roads[i].player] = 0;
              }
              adj_road_owners[this.game.state.roads[i].player]++;
            }
          }
          //Check if adjacent edge is part of longest road path (alternate method)
          if (this.game.state.longestRoad.path.includes(road)) {
            bisect++;
          }
        }
        if (bisect == 1) {
          for (let owner in adj_road_owners) {
            //If new town borders a road of the player with the longest road, recheck board to find longest road
            if (
              adj_road_owners[owner] > 1 &&
              owner != player &&
              owner == this.game.state.longestRoad.player
            ) {
              this.updateLog(
                `New ${this.c1.name} bisects longest road, recalculating next longest road`
              );
              this.game.state.longestRoad.player = 0; //unset longest road
              //Check the person who had the longest road first so they have priority (in event of ties)
              this.checkLongestRoad(owner);
              //Check everyone else if they have a longer road now
              for (let i = 1; i <= this.game.players.length; i++) {
                if (i !== owner) {
                  this.checkLongestRoad(i);
                }
              }
            }
          }
        }

        return 1;
      }

      //
      // Upgrade town to city
      // pause game for player to chose
      //
      if (mv[0] == "player_upgrade_city") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.game.state.canTrade = false;
        if (this.game.player == player) {
          this.playerBuildCity(player, 1);
        } else {
          this.updateStatus(
            `<div class="player-notice">${this.game.playerNames[player - 1]} is upgrading to a ${
              this.c2.name
            }...</div>`
          );
        }

        return 0; // halt game until next move received
      }

      //
      // upgrade town to city, propagate change in DOM
      //
      if (mv[0] == "upgrade_city") {
        let player = parseInt(mv[1]);
        let slot = mv[2];
        this.game.queue.splice(qe, 1);

        this.updateLog(
          `${this.formatPlayer(player)} upgraded a ${this.c1.name} to a ${this.c2.name}`
        );
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot === slot) {
            this.game.state.cities[i].level = 2;
            //Player exchanges city for town
            this.game.state.players[player - 1].cities--;
            this.game.state.players[player - 1].towns++;
            let divname = "#" + slot;

            $(divname).children('img').eq(0).fadeOut(400, "linear", ()=> {
              $(divname).html("");  
              $(this.c2.svg).hide().delay(600).appendTo(divname).fadeIn(1200);

            });
            
            $(divname).addClass(`p${this.game.colors[player - 1]}`);
            return 1;
          }
        }
        //console.log("Upgrade city failed...",slot,this.game.state.cities);

        return 1;
      }

      /* Trading Actions */

      //
      // trade advertisement
      //
      if (mv[0] == "advertisement") {
        let offering_player = parseInt(mv[1]);
        let stuff_on_offer = JSON.parse(mv[2]);
        let stuff_in_return = JSON.parse(mv[3]);
        this.game.queue.splice(qe, 1);

        this.game.state.ads[offering_player - 1].offer = stuff_on_offer;
        this.game.state.ads[offering_player - 1].ask = stuff_in_return;
        this.game.state.ads[offering_player - 1].ad = true;
        this.displayPlayers();
      }

      if (mv[0] == "clear_advert") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        console.log("CLEAR ADVERT for player:" + player);

        this.game.state.ads[player - 1].offer = null;
        this.game.state.ads[player - 1].ask = null;
        this.displayPlayers();
      }
      //
      // Player A has offered another player a trade
      //
      if (mv[0] === "offer") {
        let offering_player = parseInt(mv[1]);
        let receiving_player = parseInt(mv[2]);
        let stuff_on_offer = JSON.parse(mv[3]);
        let stuff_in_return = JSON.parse(mv[4]);
        this.game.queue.splice(qe, 1);

        if (stuff_on_offer == null) {
          return;
        }
        if (stuff_in_return == null) {
          return;
        }

        console.log("RECEIVED OFFER: ");
        console.log("RECEIVED OFFER: " + JSON.stringify(stuff_on_offer));
        console.log("RECEIVED OFFER: " + JSON.stringify(stuff_in_return));

        if (this.game.player == receiving_player) {
          this.game.state.ads[offering_player - 1].offer = stuff_on_offer;
          this.game.state.ads[offering_player - 1].ask = stuff_in_return;
          this.game.state.ads[offering_player - 1].ad = false;
          this.updateLog(`${this.formatPlayer(offering_player)} sent a trade offer to ${this.formatPlayer(receiving_player)}.`);
          this.displayPlayers();
        } else {
          this.game.state.ads[offering_player - 1].offer = stuff_on_offer;
          this.game.state.ads[offering_player - 1].ask = stuff_in_return;
          this.game.state.ads[offering_player - 1].ad = true;
          this.updateLog(
            `${this.formatPlayer(offering_player)} sent a public trade offer.`
          );
        }

        this.displayPlayers();

        return 1;
      }

      /*
        * Because we add and subtract resources through different methods, there is a lag in the UI where it looks like you only gained,
        the loss of resources doesn't come until later... It's because these is ....
        * This does not validate trading (no checking whether player has resource to give)
      */
      if (mv[0] === "accept_offer") {
        let accepting_player = parseInt(mv[1]);
        let offering_player = parseInt(mv[2]);
        let tradeOut = JSON.parse(mv[3]);
        let tradeIn = JSON.parse(mv[4]);
        this.game.queue.splice(qe, 1);

        // let offering player know
        if (this.game.player == offering_player) {
          this.updateStatus(
            `<div class='persistent player-notice'>${
              this.game.playerNames[accepting_player - 1]
            } accepted your offer</div>`
          );
        }
        if (this.game.player == accepting_player) {
          this.updateStatus(
            `<div class='persistent player-notice'>You completed a trade with ${
              this.game.playerNames[offering_player - 1]
            }.</div>`
          );
        }
        if (this.game.player !== accepting_player && this.game.player !== offering_player) {
          this.updateStatus(
            `<div class="persistent player-notice">${this.game.playerNames[offering_player - 1]} and ${
              this.game.playerNames[accepting_player - 1]
            } completed a trade.</div>`
          );
        }

        //Offering Player
        for (let i in tradeOut) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeOut[i]; j++) {
            //Ignores zeros
            this.game.queue.push("spend_resource\t" + offering_player + "\t" + i); //Just easier to do this in the queue
            this.game.state.players[accepting_player - 1].resources.push(i);
          }
        }
        for (let i in tradeIn) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeIn[i]; j++) {
            this.game.queue.push("spend_resource\t" + accepting_player + "\t" + i); //Just easier to do this in the queue
            this.game.state.players[offering_player - 1].resources.push(i);
          }
        }
        this.updateLog(`${this.formatPlayer(offering_player)} and ${this.formatPlayer(accepting_player)} completed a trade.`);

        console.log(JSON.parse(JSON.stringify(this.game.state.ads)));

        return 1;
      }

      if (mv[0] === "reject_offer") {
        let refusing_player = parseInt(mv[1]);
        let offering_player = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);

        this.game.confirms_needed[refusing_player - 1] = 0; //Manually resolve
        if (this.game.player == offering_player) {
          this.updateStatus("<div class='persistent player-notice'>Your offer has been rejected</div>");
        }
        if (this.game.player == refusing_player) {
          this.updateStatus(
            `<div class='persistent player-notice'>You reject ${
              this.game.playerNames[offering_player - 1]
            }'s trade.</div>`
          );
        }
        this.updateLog(
          `${this.formatPlayer(refusing_player)} turned down a trade offer from ${
            this.formatPlayer(offering_player)}.`);

        console.log(JSON.parse(JSON.stringify(this.game.state.ads)));

        return 1;
      }

      /*
      Execute trade with bank
      */
      if (mv[0] === "bank") {
        let player = parseInt(mv[1]);
        let outCount = parseInt(mv[2]);
        let outResource = mv[3];
        let inCount = parseInt(mv[4]);
        let inResource = mv[5];
        this.game.queue.splice(qe, 1);

        // let offering player know
        if (this.game.player == player) {
          this.updateStatus("<div class='persistent player-notice'>Your trade is completed</div>");
        } else {
          this.updateStatus(
            `<div class='persistent player-notice'>${
              this.game.playerNames[player - 1]
            } traded with the bank</div>`
          );
        }
        for (let i = 0; i < outCount; i++) {
          this.game.queue.push("spend_resource\t" + player + "\t" + outResource);
        }
        for (let j = 0; j < inCount; j++) {
          //Should always be 1
          this.game.state.players[player - 1].resources.push(inResource);
        }
        this.updateLog(`${this.formatPlayer(player)} traded ${outCount}x${this.formatResource(outResource)}<span> with the bank for </span>${this.formatResource(inResource)}.`);

        return 1;
      }

      /*
        General Game Mechanics
      */
      //
      // player turn begins by rolling the dice (or playing dev card if available)
      //
      if (mv[0] == "play") {
        let player = parseInt(mv[1]);

        this.game.state.playerTurn = player;

        if (this.game.player == player) {
          //Messaging to User
          let statushtml = `<div class="player-notice">YOUR TURN:</div>`;
          let controlshtml = `<ul>`;
          
          controlshtml += `<li class="option" id="rolldice">roll dice</li>`;
          controlshtml += `</ul>`;

          this.updateStatus(statushtml);
          this.updateControls(controlshtml);

          if (this.turn_limit){
            this.clock.startClock(this.turn_limit);
            this.sleep_timer = setTimeout(()=> {
              $("#rolldice").click();
            }, this.turn_limit);
          }

          // **********************************************************
          // > To DO rewrite this if we like the new dev card interface
          // **********************************************************
          
          //Or, choose menu option
          $(".option").off();
          $(".option").on("click", function () {
            $(this).addClass("disabled");

            let choice = $(this).attr("id");
            if (choice === "rolldice") {
              settlers_self.updateStatus('rolling...');
              settlers_self.updateControls('');
              settlers_self.addMove("roll\t" + player);
              settlers_self.endTurn();
            }
            //if (choice === "playcard") {
            //  settlers_self.dev_card.render();
            // }
          });
        } else {
          this.updateStatus(
            `<div class="player-notice">${this.game.playerNames[player - 1]} rolling dice...</div>`
          );
          this.updateControls("");
        }
        //this.game.queue.splice(qe, 1);
        return 0;
      }

      // Roll the dice
      //
      if (mv[0] == "roll") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe - 1, 2);

        // everyone rolls the dice
        let d1 = this.rollDice(6);
        let d2 = this.rollDice(6);
        this.game.state.lastroll = [d1, d2];
        this.game.state.lastroll.sort();
        let roll = d1 + d2;
        this.updateLog(`${this.formatPlayer(player)} rolled: ${this.returnDiceImage(this.game.state.lastroll[1])}${this.returnDiceImage(this.game.state.lastroll[0])}`);
        this.game.stats.dice[roll]++; //Keep count of the rolls
        this.game.stats.dicePlayer[roll][player-1]++;

        // board animation
        this.animateDiceRoll(roll);

        //this.updateControls("");

        //Regardless of outcome, player gets a turn
        this.game.queue.push(`player_actions\t${player}`);
        this.game.queue.push("enable_trading"); //Enable trading after resolving bandit

        //Next Step depends on Dice outcome
        if (roll == 7) {
          this.game.state.bandit = true;
          this.game.queue.push("roll_bandit\t" + player);

          let record = {
            roll: 7,
            harvest: {},
            bandit: {},
            threatened: this.game.state.threatened.slice(),
          }
          this.game.stats.history.push(record);
          
          //Manage discarding before bandit comes into play
          let playersToDiscard = [];
          for (let i = 0; i < this.game.state.players.length; i++) {
            if (this.game.state.players[i].resources.length > 7) {
              playersToDiscard.push(i + 1);
            }
          }

          if (playersToDiscard.length > 0) {
            this.resetConfirmsNeeded(playersToDiscard);
            this.game.queue.push("NOTIFY\tAll players have finished discarding");
            this.game.queue.push("discard\t" + JSON.stringify(playersToDiscard)); //One queue move all the players
          }
          return 1;

        } else {
          //
          // Will return 0 if there is an animation to display
          //
          return this.collectHarvest(roll, player);
        }
      }

      if (mv[0] == "enable_trading") {
        this.game.queue.splice(qe, 1);
        this.game.state.bandit = false;
        this.game.state.canTrade = true; //Toggles false when the player builds or buys
        this.game.state.hasRolled = true;
        return 1;
      }

  
      /*
      Each player checks if they are on the toGo list, and if so must discard cards
      Otherwise, they just hang out...
      */
      if (mv[0] == "discard") {
        let playersToGo = JSON.parse(mv[1]);
        //this.game.queue.splice(qe, 1); //Try not splicing

        let discardString = "";
        let confirmsNeeded = 0;
        let amIPlaying = false;

        let idx = 0;
        for (let i of playersToGo) {
          i = parseInt(i);
          idx++;
          if (this.game.confirms_needed[i - 1] == 1) {
            if (idx > 1) {
              discardString += ", ";
            }
            discardString += `${this.game.playerNames[i - 1]}`;
            confirmsNeeded++;
            if (this.game.player == i) {
              this.addMove("RESOLVE\t" + this.publicKey);
              this.discard.discardString = discardString;
              this.discard.render();
              amIPlaying = true;
            }
          }
        }

        this.game.queue.push(`NOTIFY\t${discardString} must discard half their hand.`);

        if (!amIPlaying) {
         this.updateStatus(
           `waiting for ${discardString} to discard`
         );
        }

        if (confirmsNeeded == 0) {
          this.game.queue.splice(qe, 1);
          return 1;
        }
        return 0;
      }

      //Player Chooses where to put bandit
      if (mv[0] == "roll_bandit") {
        let player_who_rolled = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        let player = player_who_rolled;
        if (this.game.players.length == 2){
          if (this.game.state.players[player_who_rolled-1].vp > this.game.state.players[2 - player_who_rolled].vp + 1){
            player = 3 - player_who_rolled;
          }
        }

        //Move Bandit
        if (this.game.player == player) {
          this.playerPlayBandit();
        } else {
          if (player == player_who_rolled){
            this.updateStatus(
              `<div class="player-notice">${this.game.playerNames[player - 1]} moving the ${
                this.b.name
              }...</div>`
            );
          }else{
            this.updateStatus(
              `<div class="player-notice">Robin Hood is on the loose, ${this.game.playerNames[player - 1]} is moving him...</div>`
            );
          }
        }
        return 0;
      }

      // Update DOM for new Bandit Location and player picks card to steal
      if (mv[0] == "move_bandit") {
        let player = parseInt(mv[1]);
        let hex = mv[2]; //Id of the sector_value
        this.game.queue.splice(qe, 1);

        //Move Bandit in DOM
        $(".bandit").removeClass("bandit");
        $("#" + hex).addClass("bandit");
        let temp = hex.split("_"); // sector_value_3_3
        let hexId = temp[2] + "_" + temp[3];

        //Move Bandit in Game Logic
        for (let h in this.game.state.hexes) {
          this.game.state.hexes[h].robber = h === hexId;
        }
        let hexName =
          this.game.state.hexes[hexId].value + "->" + this.game.state.hexes[hexId].resource;
        this.updateLog(
          `${this.formatPlayer(player)} moved the ${this.b.name} to ${hexName}`
        );


        this.game.state.threatened = [];

        for (let city of this.game.state.cities) {
          if (city.neighbours.includes(hexId)) {
            if (!this.game.state.threatened.includes(city.player)) {
              this.game.state.threatened.push(city.player);
            }
          }
        }

        console.log("Bandit moved:", JSON.stringify(this.game.state.threatened));

        if (this.game.player === player) {
          this.playerMoveBandit(player, hexId);
        } else {
          this.updateStatus(
            `<div class="player-notice">Waiting for ${
              this.game.playerNames[player - 1]
            } to choose the ${this.b.name}'s victim...</div>`
          );
        }

        return 0;
      }

      //Move resources for bandit theft
      if (mv[0] == "steal_card") {
        let thief = parseInt(mv[1]);
        let victim = parseInt(mv[2]);
        let loot = mv[3];
        this.game.queue.splice(qe, 1);

        if (victim > 0 && loot != "nothing") {
          //victim 0 means nobody
          this.game.queue.push("spend_resource\t" + victim + "\t" + loot);
          this.game.state.players[thief - 1].resources.push(loot);

          //Adjust bandit stats
          this.game.stats.robbed[loot][victim - 1]++;
          // The spend_resource to remove from hand will count twice when we roll a 7 but not on a knight
          if (this.game.state.bandit) {
            this.game.stats.discarded[loot][victim - 1]--;  

          }
        }

        if (this.game.state.bandit){
          let record = this.game.stats.history.pop();
          if (loot == "nothing"){
            record.harvest[thief] = [];
          }else{
            record.harvest[thief] = [loot];
          }
          this.game.stats.history.push(record);
        }

        let x = (loot == "nothing") ? "nothing" : this.formatResource(loot);

        if (this.game.player === thief) {
          this.updateStatus(
            `<div class="persistent player-notice">You stole ${x}</div>`
          );
        }
        if (this.game.player === victim) {
          if (loot == "nothing") {
            this.updateStatus(
              `<div class="persistent player-notice"><span>${
                this.game.playerNames[thief - 1]
              } stole nothing from you</span></div>`
            );
          } else {
            this.updateStatus(
              `<div class="persistent player-notice"><span>${
                this.game.playerNames[thief - 1]
              } stole your</span>${this.formatResource(loot)}</div>`
            );
          }
        }

        let victim_name = victim > 0 ? `${this.formatPlayer(victim)}` : "<span>nobody</span>";
        this.updateLog(`${this.formatPlayer(thief)} stole ${x}<span> from </span>${victim_name}`);
        return 1;
      }

      //
      // Main, repeating part of player turn
      // Do NOT splice from queue, Keep bouncing back here until the player chooses to pass the dice on
      if (mv[0] == "player_actions") {
        let player = parseInt(mv[1]);

        if (player == this.game.player) {
          this.playerPlayMove();
        } else {
          this.updateStatus(
            this.getLastNotice() +
              `<div class="player-notice">${
                this.game.playerNames[player - 1]
              } is taking their turn.</div>`
          );
        }
        return 0;
      }

      if (mv[0] == "end_turn") {
        this.game.state.canPlayCard = null;

        /*
        We put a lag in passing the length of the hand to the state.devcards
        so that we can know that the last card in the hand is "new" and unable to be played until their next turn 
        */
        while (this.game.deck[0].hand.length > 0){
          this.game.state.players[this.game.player - 1].devcards.push(this.game.deck[0].hand.pop());  
        }

        // Only set initial flag to true at end of opponents turn, because we loop back to "play"
        // when playing a knight and don't want to allow multiple knights before the roll
        if (this.game.state.players[this.game.player - 1].devcards.length > 0) {
          this.game.state.canPlayCard = true;
        }

        this.game.state.hasRolled = false;
        this.game.state.canTrade = false;
        this.game.queue.splice(qe - 1, 2);
        let divname = `.sector_value:not(.bandit)`;
        $(divname).attr("style", "");
        $(".rolled").removeClass("rolled");
        return 1;
      }
    }
    return 1;
  }
}

module.exports = SettlersGameloop;
