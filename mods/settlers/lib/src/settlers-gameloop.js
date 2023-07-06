const { ModuleResolutionKind } = require("typescript");

class SettlersGameloop {

  /*
   * Core Game Logic
   * Commands: init, generate_map, winner
   */
  handleGameLoop() {

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
        for (let i = this.game.players.length; i > 0; i--) { this.game.queue.push(`play\t${i}`); }
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

        let winner = parseInt(mv[1]);
        this.game.queue = [];

        this.updateLog(`${this.game.playerNames[winner]} wins!`);

        this.stats_overlay.render();
        $(".rules-overlay h1").text(`Game Over: ${this.game.playerNames[winner]} wins!`);

        this.endGame(this.game.players[winner]);

        return 0;
      }

      /* Development Cards */

      if (mv[0] == "buy_card") {

        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        this.updateLog(`${this.game.playerNames[player - 1]} bought a ${this.card.name} card`);
        this.game.state.canTrade = false;

        //this player will update their devcard count on next turn
        if (player != this.game.player) {
          this.game.state.players[player - 1].devcards++; //Add card for display
        } else {
          this.boughtCard = true; //So we display dev cards on next refresh

          let lastcard = this.game.deck[0].cards[this.game.deck[0].hand[this.game.deck[0].hand.length - 1]];

          let html = `<span class="tip">${lastcard.card}
                        <div class="tiptext">${this.rules[lastcard.action]}</div>
                      </span>`;

          this.updateStatus(`<div class="persistent"><span>You bought a ${html}</span></div>`);

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
        this.game.state.players[player - 1].devcards--; //Remove card (for display)

        this.updateLog(
          `${this.game.playerNames[player - 1]} played ${cardname} to gain 1 victory point`
        );
        return 1;
      }

      //Declare Road building
      if (mv[0] == "road_building") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(`${this.game.playerNames[player - 1]} played ${cardname}`);
        return 1;
      }

      //Knight
      if (mv[0] == "play_knight") {
        let player = parseInt(mv[1]);
        let cardname = mv[2];
        this.game.queue.splice(qe, 1);

        this.updateLog(`${this.game.playerNames[player - 1]} played a ${cardname}!`);
        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        //Update Army!
        this.game.state.players[player - 1].knights++;
        this.checkLargestArmy(player);

        //Move Bandit
        if (this.game.player == player) {
          this.playerPlayBandit();
        } else {
          this.updateStatus(
            `<div class="tbd">Waiting for ${this.game.playerNames[player - 1]} to move the ${this.b.name}...</div>`
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

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(`${this.game.playerNames[player - 1]} played ${cardname}.`);
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
              this.displayModal(cardname, `${this.game.playerNames[player - 1]} stole all your ${resource}`);
            }
          }
        }
        //Award to Player
        for (let i = 0; i < lootCt; i++)
          this.game.state.players[player - 1].resources.push(resource);

        this.game.state.players[player - 1].devcards--; //Remove card (for display)
        this.updateLog(
          `${this.game.playerNames[player - 1]} played ${cardname} for ${resource}, collecting ${lootCt}.`
        );
        return 1;
      }

      /* Building Actions */
      if (mv[0] == "undo_build") {
        this.game.queue.splice(qe, 1);
        let last_mv = this.game.queue.pop();
        while (last_mv.split("\t")[0] == "spend_resource") {
          console.log(last_mv);
          last_mv = this.game.queue.pop();
        }
        this.game.queue.push(last_mv);
        return 1;
      }

      // remove a resource from players stockpile
      if (mv[0] == "spend_resource") {
        let player = parseInt(mv[1]);
        let resource = mv[2]; //string name: "ore", "brick", etc

        let target =
          this.game.state.players[player - 1].resources.indexOf(resource);
        if (target >= 0) {
          this.game.state.players[player - 1].resources.splice(target, 1);
        } else {
          console.log(
            "Resource not found...",
            resource,
            this.game.state.players[player - 1]
          );
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
            let newRoads = this.hexgrid.edgesFromVertex(this.game.state.last_city.replace("city_", ""));
            for (let road of newRoads) {
              console.log("road: ", road);
              this.addRoadToGameboard(road.substring(2), road[0]);
            }
          }

          let canbackup = parseInt(mv[3]) || 0;
          this.playerBuildRoad(mv[1], canbackup);

        } else {
          this.updateStatus(
            `<div class="tbd">${this.game.playerNames[player - 1]} is building a ${this.r.name}...</div>`
          );
        }
        return 0;
      }

      //Notify other players of where new road was built
      if (mv[0] == "build_road") {
        let player = parseInt(mv[1]);
        let slot = mv[2];
        this.game.queue.splice(qe, 1);

        this.buildRoad(player, slot);
        this.updateLog(`${this.game.playerNames[player - 1]} builds ${this.r.name}`);
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
          } catch (err) { }
          this.game.state.welcome = 1;
        }

        if (this.game.player == player) {
          this.playerBuildTown(mv[1], parseInt(mv[2]));
        } else {
          this.updateStatus(
            `<div class="tbd">${this.game.playerNames[player - 1]} is building a ${this.c1.name}...</div>`
          );
        }

        return 0; // halt game until next move received
      }

      //Get resources from adjacent tiles of second settlement during game set up
      if (mv[0] == "secondcity") {
        let player = parseInt(mv[1]);
        let city = mv[2];
        this.game.queue.splice(qe, 1);

        let logMsg = `${this.game.playerNames[player - 1]} gains `;
        for (let hextile of this.hexgrid.hexesFromVertex(city)) {
          let bounty = this.game.state.hexes[hextile].resource;
          if (bounty !== this.returnNullResource()) { //DESERT ATTACK
            logMsg += bounty + ", ";
            this.game.state.players[player - 1].resources.push(bounty);
            this.game.stats.production[bounty][player - 1]++; //Initial starting stats  
          }
        }
        logMsg = logMsg.substring(0, logMsg.length - 2) + ".";
        this.updateLog(logMsg);
        return 1;
      }

      //Allow other players to update board status
      if (mv[0] == "build_city") {
        let player = parseInt(mv[1]);
        let slot = mv[2];

        this.game.queue.splice(qe, 1);

        if (this.game.player != player) {
          this.buildCity(player, slot);
        } else {
          this.game.state.last_city = slot;
        }

        this.updateLog(`${this.game.playerNames[player - 1]} builds ${this.c1.name}`);

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
            if (adj_road_owners[owner] > 1 && owner != player && owner == this.game.state.longestRoad.player) {
              this.updateLog(`New ${this.c1.name} bisects longest road, recalculating next longest road`);
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
            `<div class="tbd">${this.game.playerNames[player - 1]} is upgrading to a ${this.c2.name}...</div>`
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
          `${this.game.playerNames[player - 1]} upgraded a ${this.c1.name} to a ${this.c2.name}`
        );
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot === slot) {
            this.game.state.cities[i].level = 2;
            //Player exchanges city for town
            this.game.state.players[player - 1].cities--;
            this.game.state.players[player - 1].towns++;
            let divname = "#" + slot;
            $(divname).html(this.c2.svg);
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

  if (stuff_on_offer == null) { return; } 
  if (stuff_in_return == null) { return; } 

console.log("RECEIVED OFFER: ");
console.log("RECEIVED OFFER: " + JSON.stringify(stuff_on_offer));
console.log("RECEIVED OFFER: " + JSON.stringify(stuff_in_return));

        if (this.game.player == receiving_player) {
          this.game.state.ads[offering_player - 1].offer = stuff_on_offer;
          this.game.state.ads[offering_player - 1].ask = stuff_in_return;
          this.game.state.ads[offering_player - 1].ad = false;
          this.updateLog(`${this.game.playerNames[offering_player - 1]} sent a trade offer to ${this.game.playerNames[receiving_player - 1]}.`);
          this.displayPlayers();
        } else {
          this.game.state.ads[offering_player - 1].offer = stuff_on_offer;
          this.game.state.ads[offering_player - 1].ask = stuff_in_return;
          this.game.state.ads[offering_player - 1].ad = true;
          this.updateLog(`${this.game.playerNames[offering_player - 1]} sent a public trade offer.`);
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
            `<div class='persistent'>${this.game.playerNames[accepting_player - 1]} accepted your offer</div>`
          );
        }
        if (this.game.player == accepting_player) {
          this.updateStatus(
            `<div class='persistent'>You completed a trade with ${this.game.playerNames[offering_player - 1]}.</div>`
          );
        }
        if (
          this.game.player !== accepting_player &&
          this.game.player !== offering_player
        ) {
          this.updateStatus(
            `<div class="persistent">${this.game.playerNames[offering_player - 1]} and ${this.game.playerNames[accepting_player - 1]} completed a trade.</div>`
          );
        }

        //Offering Player
        for (let i in tradeOut) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeOut[i]; j++) {
            //Ignores zeros
            this.game.queue.push(
              "spend_resource\t" + offering_player + "\t" + i
            ); //Just easier to do this in the queue
            this.game.state.players[accepting_player - 1].resources.push(i);
          }
        }
        for (let i in tradeIn) {
          //i is resource name, offer[i]
          for (let j = 0; j < tradeIn[i]; j++) {
            this.game.queue.push(
              "spend_resource\t" + accepting_player + "\t" + i
            ); //Just easier to do this in the queue
            this.game.state.players[offering_player - 1].resources.push(i);
          }
        }
        this.updateLog(
          `${this.game.playerNames[offering_player - 1]} and ${this.game.playerNames[accepting_player - 1]} completed a trade.`
        );

        console.log(JSON.parse(JSON.stringify(this.game.state.ads)));

  return 1;

      }

      if (mv[0] === "reject_offer") {
        let refusing_player = parseInt(mv[1]);
        let offering_player = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);

        this.game.confirms_needed[refusing_player - 1] = 0; //Manually resolve
        if (this.game.player == offering_player) {
          this.updateStatus(
            "<div class='persistent'>Your offer has been rejected</div>"
          );
        }
        if (this.game.player == refusing_player) {
          this.updateStatus(
            `<div class='persistent'>You reject ${this.game.playerNames[offering_player - 1]}'s trade.</div>`
          );
        }
        this.updateLog(
          `${this.game.playerNames[refusing_player - 1]} turned down a trade offer from ${this.game.playerNames[offering_player - 1]}.`
        );

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
          this.updateStatus(
            "<div class='persistent'>Your trade is completed</div>"
          );
        } else {
          this.updateStatus(
            `<div class='persistent'>${this.game.playerNames[player - 1]} traded with the bank</div>`
          );
        }
        for (let i = 0; i < outCount; i++) {
          this.game.queue.push(
            "spend_resource\t" + player + "\t" + outResource
          );
        }
        for (let j = 0; j < inCount; j++) {
          //Should always be 1
          this.game.state.players[player - 1].resources.push(inResource);
        }
        this.updateLog(`${this.game.playerNames[player - 1]} traded with the bank.`);

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

          /*
          We put a lag in passing the length of the hand to the state.devcards
          so that we can know that the last card in the hand is "new" and unable to be played until their next turn 
          */
          this.game.state.players[player - 1].devcards =
            this.game.deck[0].hand.length;

          //Messaging to User
          let html = `<div class="tbd"><div class="pcb"></div>YOUR TURN:`;
          html += `<ul>`;
          html += `<li class="option flashme" id="rolldice">roll dice</li>`;
          if (settlers_self.canPlayerPlayCard()) {
            html += `<li class="option" id="playcard">play card</li>`;
          }
          html += `</ul>`;
          html += `</div>`;

          console.log("running UPDATE STATUS");
          this.updateStatus(html);

          //
          // Flash to be like "hey it's your move"
          //
          if (this.is_sleeping) {
            this.currently_active_player = player;
            $(".flashme").addClass("flash");
            this.is_sleeping = false; //If player plays a knight first, we don't need to flash again when we bounce back to this state  
          }

          //Or, choose menu option
          $(".option").off();
          $(".option").on("click", function () {

            settlers_self.updateStatus("sending move...");
            $(this).addClass("disabled");

            let choice = $(this).attr("id");
            if (choice === "rolldice") {
              settlers_self.addMove("roll\t" + player);
              settlers_self.endTurn();
            }
            if (choice === "playcard") {
                settlers_self.dev_card.render();
 //             settlers_self.playerPlayCard();
            }
          });
        } else {
          this.updateStatus(
            `<div class="tbd">${this.game.playerNames[player - 1]} rolling dice...</div>`
          );
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
        let roll = d1 + d2;
        this.updateLog(`${this.game.playerNames[player - 1]} rolled: ${roll}`);
        this.game.stats.dice[roll]++; //Keep count of the rolls

        // board animation
        this.animateDiceRoll(roll);

        //Regardless of outcome, player gets a turn
        this.game.queue.push(`player_actions\t${player}`);
        this.game.queue.push("enable_trading"); //Enable trading after resolving bandit

        //Next Step depends on Dice outcome
        if (roll == 7) {
          this.game.queue.push("play_bandit\t" + player);

          //Manage discarding before bandit comes into play
          let playersToDiscard = [];
          for (let i = 0; i < this.game.state.players.length; i++) {
            if (this.game.state.players[i].resources.length > 7) {
              playersToDiscard.push(i + 1);
            }
          }

          if (playersToDiscard.length > 0) {
            this.resetConfirmsNeeded(playersToDiscard);
            this.game.queue.push(
              "NOTIFY\tAll players have finished discarding"
            );
            this.game.queue.push(
              "discard\t" + JSON.stringify(playersToDiscard)
            ); //One queue move all the players
          }
        } else {
          this.game.queue.push(`collect_harvest\t${roll}`);
        }
        return 1;
      }

      if (mv[0] == "enable_trading") {
        this.game.queue.splice(qe, 1);
        this.game.state.canTrade = true; //Toggles false when the player builds or buys
        return 1;
      }

      //
      // gain resources if dice are !7
      //
      if (mv[0] == "collect_harvest") {
        let roll = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        this.collectHarvest(roll);
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
    idx++;
          if (this.game.confirms_needed[i - 1] == 1) {
            if (idx > 1) { discardString += ", "; }
            discardString += `${this.game.playerNames[i - 1]}`;
            confirmsNeeded++;
            if (this.game.player == parseInt(i)) {
              this.addMove("RESOLVE\t" + this.app.wallet.returnPublicKey());
              this.discard.discardString = discardString;
              this.discard.render();
              amIPlaying = true;
            }
          }
        }

        this.game.queue.push(
          `NOTIFY\t${discardString} must discard half their hand.`
        );

        // if (!amIPlaying) {
        //   this.updateStatus(
        //     `waiting for ${discardString} to discard`
        //   );
        // }

        if (confirmsNeeded == 0) {
          this.game.queue.splice(qe, 1);
          return 1;
        }
        return 0;
      }

      //Player Chooses where to put bandit
      if (mv[0] == "play_bandit") {
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);

        //Move Bandit
        if (this.game.player == player) {
          this.playerPlayBandit();
        } else {
          this.updateStatus(
            `<div class="tbd">${this.game.playerNames[player - 1]} moving the ${this.b.name}...</div>`
          );
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
          this.game.state.hexes[hexId].value +
          "->" +
          this.game.state.hexes[hexId].resource;
        this.updateLog(
          `${this.game.playerNames[player - 1]} moved the ${this.b.name} to ${hexName}`
        );

        if (this.game.player === player) {
          this.playerMoveBandit(player, hexId);
        } else {
          this.updateStatus(
            `<div class="tbd">Waiting for ${this.game.playerNames[player - 1]} to choose the ${this.b.name}'s victim...</div>`
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

        if (victim > 0 && loot != "nothing") { //victim 0 means nobody
          this.game.queue.push("spend_resource\t" + victim + "\t" + loot);
          this.game.state.players[thief - 1].resources.push(loot);
        }

        if (this.game.player === thief) {
          let x = `<div class="card tinycard"><img src="${this.returnCardImage(loot)}" /></div>`;
          this.updateStatus(`<div class="persistent">You stole ${(loot == "nothing") ? "nothing" : x }</div>`);
        }
        if (this.game.player === victim) {
          let x = `<div class="card tinycard"><img src="${this.returnCardImage(loot)}" /></div>`;
          this.updateStatus(`<div class="persistent">${this.game.playerNames[thief - 1]} stole ${(loot == "nothing") ? "nothing" : x } from you</div>`);
        }

        let victim_name = (victim > 0) ? `${this.game.playerNames[victim - 1]}` : "nobody";
        this.updateLog(`${this.game.playerNames[thief - 1]} stole ${loot} from ${victim_name}`);
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
            `<div class="tbd">${this.game.playerNames[player - 1]} is taking their turn.</div>`
          );
        }
        return 0;
      }

      if (mv[0] == "end_turn") {
        this.game.state.canPlayCard = this.game.deck[0].hand.length > 0;
        this.game.state.canTrade = false;
        this.game.queue.splice(qe - 1, 2);
        this.is_sleeping = true;
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
