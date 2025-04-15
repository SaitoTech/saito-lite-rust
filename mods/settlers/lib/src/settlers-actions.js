class SettlersActions {
  //
  // OVERRIDE THIS FUNCTION FROM THE PARENT GAME LIBRARY TO CHANGE THE ACKNOWLEDGE TEXT TO CONTINUE
  // and override the callback
  //
  playerAcknowledgeNotice(msg, mycallback) {
    let html = `<i class="fa-solid fa-forward"></i>`;
    try {

      this.updateStatusWithOptions(`<div class="player-notice">${msg}</div>`, html);

      document.getElementById("rolldice").onclick = async (e) => {
        e.currentTarget.onclick = null;
        this.clearShotClock();
        this.updateControls();
        this.game.queue.splice(this.game.queue.length - 1, 1);
        this.restartQueue();
      }

      if (this.loadGamePreference("settlers_play_mode") !== 0 || this.turn_limit) {
        this.setShotClock("#rolldice", 2500);  
      }

    } catch (err) {
      console.error("Error with ACKWNOLEDGE notice!: " + err);
    }

    this.halted = 1;
    this.saveGame(this.game.id);

    return 0;
  }

  //
  // Award resources for dice roll
  //
  collectHarvest(value, player_who_rolled) {

    let notice = "";
    let poor_harvest = true;

    let collection = {};
    let blocked = {};

    for (let city of this.game.state.cities) {
      let player = city.player;

      for (let neighboringHex of city.neighbours) {
        if (this.game.state.hexes[neighboringHex].value == value) {
          let resource = this.game.state.hexes[neighboringHex].resource;

          if (this.game.state.hexes[neighboringHex].robber && player !== this.game.state.robinhood) {
            if (!blocked[player]){
              blocked[player] = [];
            }

            blocked[player].push(resource);
            this.game.stats.blocked[resource][player-1]++;

            if (city.level == 2){
              blocked[player].push(resource);
              this.game.stats.blocked[resource][player-1]++;
            }

          } else {
            if (!collection[player]){
              collection[player] = [];
            }

            collection[player].push(resource);

            if (this.game.player == player) {
              notice += this.formatResource(resource);
              poor_harvest = false;
            }

            this.game.state.players[player - 1].resources.push(resource);
            this.game.stats.production[resource][player - 1]++;
            this.animateHarvest(player, resource, neighboringHex);

            //
            //Double Resources for Upgraded City
            //
            if (city.level == 2) {
              this.game.state.players[player - 1].resources.push(resource);
              this.game.stats.production[resource][player - 1]++;
              this.animateHarvest(player, resource, neighboringHex);

              collection[player].push(resource);

              if (this.game.player == player) {
                notice += this.formatResource(resource);
              }
            }
          }
        }
      }
    }

    this.game.stats.history.push({
      roll: value,
      harvest: collection,
      bandit: blocked,
      threatened: this.game.state.threatened.slice(),
    });

    let firstMsg = (this.game.player == player_who_rolled)  ? "you" : this.game.playerNames[player_who_rolled - 1];
    firstMsg += ` rolled <span class='die_value'>${value}</span>`;

    for (let player in collection){
      let logMsg = `${this.formatPlayer(player)} gains`;
      collection[player].sort();
      for (let resource of collection[player]){
        logMsg += this.formatResource(resource);
      }
      this.updateLog(logMsg);
    }

    if (Object.keys(collection).length == 0) {
      this.updateLog("nobody collects any resources.");
    }

    if (poor_harvest) {
      this.updateStatus(`${firstMsg}: ${this.randomMsg()}`, 1);
    } else {
      this.updateStatus(
        `<div class="player-notice"><span>${firstMsg}! you gain: </span><div class="hud-status-card-list">${notice}</div></div>`, 1);
    }

    if (this.animationSequence.length > 0){
      this.runAnimationQueue(250);
      return 0;
    }else{
      return 1;
    }
  }


  buildCity(player, slot) {
    // remove adjacent slots
    let ad = this.returnAdjacentCitySlots(slot);
    for (let i = 0; i < ad.length; i++) {
      let d = "#" + ad[i];
      try {
        $(d).remove();
      } catch (err) {}
    }

    //Put City on GUI Board
    let divname = "#" + slot;
    let owner = "p" + this.game.colors[player - 1];

    $(divname).removeClass("empty");
    $(this.c1.svg).hide().appendTo(divname).fadeIn(1200);
    $(divname).addClass(owner);

    let blocks_me = false;
    let newRoads = this.hexgrid.edgesFromVertex(slot.replace("city_", ""));
    if (this.game.player == player) {
      //Enable player to put roads on adjacent edges
      for (let road of newRoads) {
        //console.log("Add ghost road from city");
        this.addRoadToGameboard(road.substring(2), road[0]);
      }
    } else {
      //Check if new city blocks other players from expanding their roads
      for (let road of newRoads) {
        //console.log("road: ",road);
        for (let i = 0; i < this.game.state.roads.length; i++) {
          if (this.game.state.roads[i].slot == "road_" + road) {
            //console.log("exists");
            if (this.game.state.roads[i].player == this.game.player) {
              //console.log("is mine");
              blocks_me = true;
            }
            break;
          }
        }
      }
    }

    //Save City to Internal Game Logic
    //Stop if we already saved the Village
    for (let i = 0; i < this.game.state.cities.length; i++) {
      if (this.game.state.cities[i].slot == slot) {
        return;
      }
    }

    this.game.state.players[player - 1].towns--;

    //Check if the city is a port
    for (let p in this.game.state.ports) {
      let porttowns = this.hexgrid.verticesFromEdge(p);
      for (let t of porttowns) {
        if ("city_" + t == slot) {
          this.game.state.players[player - 1].ports.push(this.game.state.ports[p]);
          //console.log(`Player ${player} has a ${this.game.state.ports[p]} port`);
        }
      }
    }

    //Let's just store a list of hex-ids that the city borders
    let neighbours = this.hexgrid.hexesFromVertex(slot.replace("city_", "")); //this.returnAdjacentHexes(slot);
    this.game.state.cities.push({
      player: player,
      slot: slot,
      neighbours: neighbours,
      level: 1,
    });

    if (blocks_me) {
      console.log("undo ghost roads");
      this.displayBoard();
    }

    if (this.game.player == player){
      this.game.state.last_city = slot;
    }
  }

  /*
  Update internal game logic to mark road as built and change class in DOM for display
  */
  buildRoad(player, slot) {
    let divname = "#" + slot;
    let owner = "p" + this.game.colors[player - 1];

    //Check if road exists in DOM and update status
    if (!document.querySelector(divname)) {
      let roadInfo = slot.split("_");
      this.addRoadToGameboard(roadInfo[2] + "_" + roadInfo[3], roadInfo[1]);
    }

    $(divname).removeClass("empty").addClass(owner);

    //Add adjacent road slots
    if (this.game.player == player) {
      let v1 = this.hexgrid.verticesFromEdge(slot.replace("road_", ""));
      for (let road of this.hexgrid.adjacentEdges(slot.replace("road_", ""))) {
        //console.log("road: ",road);
        let v2 = this.hexgrid.verticesFromEdge(road);
        let intersection = v2.filter(function (n) {
          return v1.indexOf(n) !== -1;
        });
        //console.log(v1, v2, intersection);
        let block_me = false;
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot == "city_" + intersection[0]) {
            if (this.game.state.cities[i].player !== this.game.player) {
              block_me = true;
            }
            break;
          }
        }
        if (!block_me) {
          //console.log("city_"+intersection[0]+" clear, Add ghost road from road");
          this.addRoadToGameboard(road.substring(2), road[0]);
        }
      }
    }

  }

  
  /*
    Every time a knight played, need to check if this makes a new largest army
  */
  checkLargestArmy(player) {
    let vpChange = false;
    if (this.game.state.largestArmy.player > 0) {
      //Someone already has it
      if (this.game.state.largestArmy.player != player) {
        //Only care if a diffeent player
        if (this.game.state.players[player - 1].knights > this.game.state.largestArmy.size) {
          this.game.state.largestArmy.player = player;
          this.game.state.largestArmy.size = this.game.state.players[player - 1].knights;
          vpChange = true;
        }
      } else {
        //Increase army size
        this.game.state.largestArmy.size = this.game.state.players[player - 1].knights;
      }
    } else {
      //Open to claim
      if (this.game.state.players[player - 1].knights >= 3) {
        this.game.state.largestArmy.player = player;
        this.game.state.largestArmy.size = this.game.state.players[player - 1].knights;
        vpChange = true;
      }
    }

    if (vpChange){
      this.updateLog(`${this.formatPlayer(player)} claims the LARGEST ARMY`);
      this.game.queue.push(`ACKNOWLEDGE\t${this.game.playerNames[player-1]} forms the largest army`);
    }
  }

  /*
  Given a city (vertex) slot w/ or w/o the city_ prefix, determine who owns a city there
  or return 0 if empty
  */
  isCityAt(slot) {
    if (!slot.includes("city_")) slot = "city_" + slot;

    for (let city of this.game.state.cities) if (city.slot == slot) return city.player;
    return 0;
  }

  /*
    A down and dirty recursive algorthm to find a player's longest contiguous road
  */
  checkLongestRoad(player) {
    //Recursive search function

    let continuousRoad = function (settlers_self, currentPath, availableRoads) {
      let best = currentPath;
      if (availableRoads.length == 0) return best;

      let returnedBest,
        cityCheck,
        potTemp,
        verts = [];
      //Look in both directions
      if (currentPath.length === 1) verts = settlers_self.hexgrid.verticesFromEdge(currentPath[0]);
      else
        verts.push(
          settlers_self.hexgrid.directedEdge(
            currentPath[currentPath.length - 2],
            currentPath[currentPath.length - 1]
          )
        );

      for (let v of verts) {
        cityCheck = settlers_self.isCityAt(v);
        if (cityCheck == player || cityCheck == 0) {
          potTemp = settlers_self.hexgrid.edgesFromVertex(v);
          for (let potRoad of potTemp) {
            if (availableRoads.includes(potRoad)) {
              let newPath = currentPath.concat(potRoad);
              let remainder = [...availableRoads];
              remainder.splice(remainder.indexOf(potRoad), 1);
              returnedBest = continuousRoad(settlers_self, newPath, remainder);
              if (returnedBest.length > best.length) best = returnedBest;
            }
          }
        }
      }
      return best;
    };

    //Determine which roads belong to player
    let playerSegments = [];
    for (let road of this.game.state.roads) {
      if (road.player == player) playerSegments.push(road.slot.replace("road_", ""));
    }
    //Starting with each, find maximal continguous path
    let longest = [];
    //console.log(`Player ${player}: ${playerSegments}`);
    for (let i = 0; i < playerSegments.length; i++) {
      let remainder = [...playerSegments];
      remainder.splice(i, 1);
      let bestPath = continuousRoad(this, Array(playerSegments[i]), remainder);
      if (bestPath.length > longest.length) longest = bestPath;
    }

    if (longest.length > this.game.state.players[player - 1].road){
      this.game.state.players[player - 1].road = longest.length;
    }
    
    //Check if longest path is good enough to claim VP prize
    if (longest.length >= this.longest.min) {
      if (this.game.state.longestRoad.player > 0) {
        //Someone already has it
        if (longest.length > this.game.state.longestRoad.size) {
          if (this.game.state.longestRoad.player != player) {
            //Only care if a different player
            this.highlightRoad(
              player,
              longest,
              `claimed the ${this.longest.name} from ${
                this.formatPlayer(this.game.state.longestRoad.player)
              } with ${longest.length} segments!`
            );
            this.game.state.longestRoad.player = player;
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
            this.game.queue.push(`ACKNOWLEDGE\t${this.game.playerNames[player - 1]} claimed the longest road ${this.longest.icon}`);
          } else {
            //Increase size
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
            this.updateLog(
              `${this.formatPlayer(player)} extended the ${this.longest.name} to ${
                longest.length
              } segments.`
            );
          }
          return 1;
        }
      } else {
        //Open to claim
        this.highlightRoad(
          player,
          longest,
          `claimed the ${this.longest.name} with ${longest.length} segments.`
        );

        this.game.queue.push(`ACKNOWLEDGE\t${this.game.playerNames[player - 1]} claimed the longest road ${this.longest.icon}`);
        this.game.state.longestRoad.player = player;
        this.game.state.longestRoad.size = longest.length;
        this.game.state.longestRoad.path = longest;
        return 1;
      }
    }
    return 0;
  }

  countResource(player, resource) {
    let ct = 0;
    for (let i of this.game.state.players[player - 1].resources) {
      if (i == resource) {
        ct++;
      }
    }
    return ct;
  }

  /*
   *  Functions for trading
   *
   */

  //Convert Resource Object to readable string
  wishListToString(stuff) {
    let offer = "";
    for (let resource in stuff) {
      if (stuff[resource] > 0) {
        if (stuff[resource] > 1) {
          offer += ` and ${stuff[resource]} x ${resource}`;
        } else {
          offer += ` and ${resource}`;
        }
      }
    }
    offer = offer.length > 0 ? offer.substring(5) : "<em>nothing</em>";
    return offer;
  }

  wishListToImage(stuff) {
    let offer = "";
    for (let resource in stuff) {
      for (let i = 0; i < stuff[resource]; i++) {
        offer += `<img class="icon" src="${this.returnCardImage(resource)}"/>`;
      }
    }
    return offer;
  }

  /*
  Short circuit the simultaneous moves from an open offer trade to give player control of the game again
  */
  clearTrading() {
    this.game.state.tradingOpen = false; //Flag to prevent incoming trades
    //Hack the confirms to clear the queue
    for (let i = 0; i < this.game.confirms_needed.length; i++) {
      if (this.game.confirms_needed[i]) {
        this.game.confirms_needed[i] = 0;
        if (this.game.player == i + 1) {
          this.overlay.close();
        }
      }
    }
  }

  clearAdvert() {
    this.addMove("clear_advert\t" + this.game.player);
    this.endTurn();
  }

  /* 
  Create an object saying what the exchange rate for each resource is
  */
  analyzePorts() {
    let resources = this.returnResources();
    let tradeCost = {};
    let minForTrade = 4;
    //console.log(this.game.state.players[this.game.player-1].ports);

    for (let i of this.game.state.players[this.game.player - 1].ports) {
      if (i == "any") {
        //3:1 portt
        minForTrade = 3;
      } else {
        //2:1 resource port
        tradeCost[i] = 2;
      }
    }
    //Fill in exchange rates
    for (let r of resources) {
      if (!tradeCost[r]) {
        tradeCost[r] = minForTrade;
      }
    }

    return tradeCost;
  }

  confirmPlacement(slot, piece, callback) {
    let cm = this.loadGamePreference("settlers_confirm_moves");
    if (cm != null) {
      this.confirm_moves = cm;
    }

    if (this.confirm_moves == 0) {
      callback();
      return;
    }

    $(`#${slot}`).css("background-color", "yellow");
    let settlers_self = this;
    let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">Place ${piece} here?</div>
            <div class="action" id="confirm">yes</div>
            <div class="action" id="stopasking">yes, stop asking</div>
          </div>`;

    let left = $(`#${slot}`).offset().left + 50;
    let top = $(`#${slot}`).offset().top + 20;

    $(".popup-confirm-menu").remove();
    $("body").append(html);

    if (left + 200 < window.innerWidth){
      $(".popup-confirm-menu").css({
        position: "absolute",
        top: top,
        left: left,
      });
    }else{
      $(".popup-confirm-menu").css({
        position: "absolute",
        top: top,
        right: 0,
      });
    }

    $(".action").off();
    $(".action").on("click", function () {
      $("#" + slot).css("background-color", "");
      let confirmation = $(this).attr("id");

      $(".action").off();
      $(".popup-confirm-menu").remove();
      if (confirmation == "stopasking") {
        settlers_self.confirm_moves = 0;
        settlers_self.saveGamePreference("settlers_confirm_moves", 0);
        callback();
      }
      if (confirmation == "confirm") {
        callback();
      }
    });

  }
}

module.exports = SettlersActions;
