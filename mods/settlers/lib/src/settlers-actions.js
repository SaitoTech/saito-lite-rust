
class SettlersActions {

    //
    // Award resources for dice roll
    //
    async collectHarvest(value) {
        let logMsg = "";
        let notice = "";
        let poor_harvest = true;
        for (let city of this.game.state.cities) {
            let player = city.player;

            for (let neighboringHex of city.neighbours) {
                if (
                    this.game.state.hexes[neighboringHex].value == value &&
                    !this.game.state.hexes[neighboringHex].robber
                ) {
                    let resource = this.game.state.hexes[neighboringHex].resource;
                    logMsg += `${this.game.playerNames[player - 1]} gains ${resource}`;
                    if (this.game.player == player) {
                      notice += `<div class="card tiny"><img src="${this.returnCardImage(resource)}" /></div>`;
                      poor_harvest = false;
                    }
                    this.game.state.players[player - 1].resources.push(resource);
                    this.game.stats.production[resource][player - 1]++;
                    //Double Resources for Upgraded City
                    if (city.level == 2) {
                        this.game.state.players[player - 1].resources.push(resource);
                        this.game.stats.production[resource][player - 1]++;
                        logMsg += " x2";
                        if (this.game.player == player) {
                            notice += `<div class="card tiny"><img src="${this.returnCardImage(resource)}" /></div>`;
                        }
                    }
                    logMsg += "; ";
                }
            }
        }
        if (poor_harvest == true) { notice = "&nbsp; a poor harvest"; }
        logMsg = logMsg.substr(0, logMsg.length - 2);
        if (logMsg) {
            this.updateLog(logMsg);
        } else {
            this.updateLog("no-one collects any resources.");
        }
        if (notice) {
            await this.updateStatus(
                `<div class="persistent alignme"><span style="margin-right:0.5rem">You acquired: </span>${notice}</div>`
            );
        }
    }


   /*
    Every player should have in deck[2] and deck[3] the board tiles and tokens in the same order
    */
    generateMap() {
console.log("GENERATING MAP");
console.log(JSON.stringify(this.game.deck));
        let tileCt = 0;
        let tokenCt = 0;
        let tile, resourceName, token;
console.log("POOL 1");
        for (let hex of this.hexgrid.hexes) {
            tile = this.game.pool[0].hand[tileCt++];
            resourceName = this.game.deck[1].cards[tile].resource;
console.log("res: " + resourceName);
            if (resourceName != this.returnNullResource()) {
                let temp = this.game.pool[1].hand[tokenCt++];
                token = this.game.deck[2].cards[temp].value;
            } else {
                token = 0;
            }
            this.game.state.hexes[hex] = {
                resource: resourceName,
                value: token,
                img: this.game.deck[1].cards[tile].img,
                neighbours: [],
                robber: false,
            };
            if (resourceName == this.returnNullResource())
                this.game.state.hexes[hex].robber = true;
            if (token) this.addSectorValueToGameboard(hex, token);
        }
console.log("DONE GENERATING MAP");
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
    let classname = "p" + this.game.colors[player-1];

    $(divname).addClass(classname);
    $(divname).removeClass("empty");
    $(divname).html(this.c1.svg);

    let blocks_me = false;
    let newRoads = this.hexgrid.edgesFromVertex(slot.replace("city_", ""));
    if (this.game.player == player) {
      //Enable player to put roads on adjacent edges
      for (let road of newRoads) {
        //console.log("Add ghost road from city");
        this.addRoadToGameboard(road.substring(2), road[0]);
      }
    }else{
      //Check if new city blocks other players from expanding their roads    
      for (let road of newRoads) {
        //console.log("road: ",road);
        for (let i = 0; i < this.game.state.roads.length; i++){
          if (this.game.state.roads[i].slot == "road_"+road){
            //console.log("exists");
            if (this.game.state.roads[i].player == this.game.player){
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
          this.game.state.players[player - 1].ports.push(
            this.game.state.ports[p]
          );
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
  
    if (blocks_me){
      console.log("undo ghost roads");
      this.displayBoard();
    }

  }

  /*
  Update internal game logic to mark road as built and change class in DOM for display
  */
  buildRoad(player, slot) {
    let divname = "#" + slot;
    let owner = "p" + this.game.colors[player-1];

    //Check if road exists in DOM and update status
    if (!document.querySelector(divname)) {
      let roadInfo = slot.split("_");
      this.addRoadToGameboard(roadInfo[2] + "_" + roadInfo[3], roadInfo[1]);
    }
    $(divname).addClass(owner);
    $(divname).removeClass("empty");
    //console.log(`Build road at ${slot} for Player ${player}`);
    //Add adjacent road slots
    if (this.game.player == player) {
      let v1 = this.hexgrid.verticesFromEdge(slot.replace("road_", ""));
      for (let road of this.hexgrid.adjacentEdges(slot.replace("road_", ""))) {
        //console.log("road: ",road);
        let v2 = this.hexgrid.verticesFromEdge(road);
        let intersection = v2.filter(function(n){return v1.indexOf(n) !== -1;});
        //console.log(v1, v2, intersection);
        let block_me = false;
        for (let i = 0; i < this.game.state.cities.length; i++) {
          if (this.game.state.cities[i].slot == "city_"+intersection[0]) {
            if(this.game.state.cities[i].player !== this.game.player){
              block_me = true;
            }
            break;
          }
        }
        if (!block_me){
          //console.log("city_"+intersection[0]+" clear, Add ghost road from road");
          this.addRoadToGameboard(road.substring(2), road[0]);  
        }
      }
    }

    /* Store road in game state if not already*/
    for (let i = 0; i < this.game.state.roads.length; i++) {
      if (this.game.state.roads[i].slot == slot) {
        return;
      }
    }
    this.game.state.roads.push({ player: player, slot: slot });
  }



  /*
    Recursively let player select two resources, then push them to game queue to share selection
  */
  playYearOfPlenty(player, cardname) {
    if (this.game.player != player) return;
    //Pick something to get
    let settlers_self = this;
    let remaining = 2;
    let resourceList = this.returnResources();
    let cardsToGain = [];

    //Player recursively selects all the resources they want to get rid of
    let gainResource = function (settlers_self) {
      let html = `<div class='tbd'>Select Resources (Can get ${remaining}): <ul class="horizontal_list">`;
      for (let i of resourceList) {
        html += `<li id="${i}" class="iconoption option"><div class="tip"><img class="icon" src="${this.returnCardImage(i)}" /></div></li>`;
      }
      html += "</ul>";
      html += "</div>";
      settlers_self.displayCardfan();
      settlers_self.updateStatus(html, 1);
      

      $(".option").off();
      $(".option").on("click", function () {
        console.log("clicked on option 8");
        let res = $(this).attr("id");
        cardsToGain.push(res);
        remaining--;
        if (remaining <= 0) {
          settlers_self.addMove(
            `year_of_plenty\t${player}\t${cardname}\t${JSON.stringify(
              cardsToGain
            )}`
          );
          settlers_self.endTurn();
          return 0;
        } else {
          gainResource(settlers_self);
        }
      });
    };
    gainResource(settlers_self);
  }

  /*
    Let player choose a resource, then issue selection to game queue
  */
  playMonopoly(player, cardname) {
    if (this.game.player != player) return;
    //Pick something to get
    let settlers_self = this;
    let resourceList = this.returnResources();

    //Player recursively selects all the resources they want to get rid of
    let html = `<div class='tbd'>Select Desired Resource: <ul class="horizontal_list">`;
    for (let i of resourceList) {
      html += `<li id="${i}" class="iconoption option"><div class="tip"><img class="icon" src="${settlers_self.returnCardImage(i)}" /></div></li>`;
    }
    html += "</ul>";
    html += "</div>";

    settlers_self.updateStatus(html, 1);
    settlers_self.displayCardfan();
    $(".option").off();
    $(".option").on("click", function () {
      console.log("clicked on option 9");
      let res = $(this).attr("id");
      settlers_self.addMove(`monopoly\t${player}\t${cardname}\t${res}`);
      settlers_self.endTurn();
      return 0;
    });
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
        if (
          this.game.state.players[player - 1].knights >
          this.game.state.largestArmy.size
        ) {
          this.game.state.largestArmy.player = player;
          this.game.state.largestArmy.size =
            this.game.state.players[player - 1].knights;
          vpChange = true;
        }
      } else {
        //Increase army size
        this.game.state.largestArmy.size =
          this.game.state.players[player - 1].knights;
      }
    } else {
      //Open to claim
      if (this.game.state.players[player - 1].knights >= 3) {
        this.game.state.largestArmy.player = player;
        this.game.state.largestArmy.size =
          this.game.state.players[player - 1].knights;
        vpChange = true;
      }
    }
    //if (vpChange) this.updateScore(); //Maybe not necessary?
  }

  /*
  Given a city (vertex) slot w/ or w/o the city_ prefix, determine who owns a city there
  or return 0 if empty
  */
  isCityAt(slot) {
    if (!slot.includes("city_")) slot = "city_" + slot;

    for (let city of this.game.state.cities)
      if (city.slot == slot) return city.player;
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
      if (currentPath.length === 1)
        verts = settlers_self.hexgrid.verticesFromEdge(currentPath[0]);
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
      if (road.player == player)
        playerSegments.push(road.slot.replace("road_", ""));
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

    //Check if longest path is good enough to claim VP prize
    if (longest.length >= 5) {
      if (this.game.state.longestRoad.player > 0) {
        //Someone already has it
        if (longest.length > this.game.state.longestRoad.size) {
          if (this.game.state.longestRoad.player != player) {
            //Only care if a diffeent player
            this.highlightRoad(
              player,
              longest,
              `claimed the ${this.longest.name} from ${this.game.playerNames[this.game.state.longestRoad.player-1]} with ${longest.length} segments!`
            );
            this.game.state.longestRoad.player = player;
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
          } else {
            //Increase size
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
            this.updateLog(
              `${this.game.playerNames[player-1]} extended the ${this.longest.name} to ${longest.length} segments.`
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
          this.overlay.hide();
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


  /*
  So we sometimes want a status update message to persist through the next update status 
  (so player has a chance to read it if we are rapidly knocking moves of the queue)
  Important messages are marked with "persistent"
  */
  getLastNotice(preserveLonger = false) {
    if (document.querySelector(".status .persistent")) {
      let nodes = document.querySelectorAll(".status .persistent");
      return `<div class="${preserveLonger ? "persistent" : "player-notice"}">${
        nodes[nodes.length - 1].innerHTML
      }</div>`;
    }
    return "";
  }


  updateStatus(str, hide_info = 0) {

    try {

      if (this.lock_interface == 1) {
  //
  // 
  //
  this.setHudHeight();
        return;
      }

      this.game.status = str;

      if (this.browser_active == 1) {
        let status_obj = document.querySelector(".hud-body .status");
        if (this.game.players.includes(this.publicKey)) {
          status_obj.innerHTML = str;
          $(".status").disableSelection();
        }
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }

    //
    //
    //
    if (this.hud.user_dragged == 0) {
      this.setHudHeight();
    }
  }

  //
  // this affixes HUD to bottom of screen...
  //
  setHudHeight() {
    let hud = document.querySelector(".hud");
    if (hud) {
      hud.style.bottom = "24px";
      hud.style.height = "auto";
      hud.style.top = "unset";
    }
  }

  confirmPlacement(slot, piece, callback){

    let cm = this.loadGamePreference("settlers_confirm_moves");
    if (cm != null) { this.confirm_moves = cm; }

    if (this.confirm_moves == 0){
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
    $(".popup-confirm-menu").css({
      position: "absolute",
          top: top,
          left: left,
      });

    $(".action").off();
    $(".action").on("click", function () {
      $("#"+slot).css("background-color", "");
      let confirmation = $(this).attr("id");
      
      $(".action").off();
      $(".popup-confirm-menu").remove();
      if (confirmation == "stopasking"){
        settlers_self.confirm_moves = 0;
  settlers_self.saveGamePreference("settlers_confirm_moves", 0);
        callback();
      }
      if (confirmation == "confirm"){
        callback();
      }
    });

    $('input:checkbox').change(function() {
      if ($(this).is(':checked')) {
        settlers_self.confirm_moves = 0;
  settlers_self.saveGamePreference("settlers_confirm_moves", 0);
      }else{
        settlers_self.confirm_moves = 1;
  settlers_self.saveGamePreference("settlers_confirm_moves", 1);
      }
    });
  }

}

module.exports = SettlersActions;
