
  /*
    Functions for basic actions
  */

    class SettlersActions {


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
    $(divname).html(this.skin.c1.svg);

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


  returnResourceHTML(resource){
    return `<div class="tip">
            <img class="icon" src="${this.skin.resourceCard(resource)}">
            </div>`;
  }

  visualizeCost(purchase) {
    let html = "";
    if (purchase < 0 || purchase > 3) return "";
    let cost = this.skin.priceList[purchase];
    for (let resource of cost) {
      //html += `<img class="icon" src="${this.skin.resourceIcon(resource)}">`;
      html += this.returnResourceHTML(resource);
    }
    return html;
  }

  /*
  Overwrite standard card imaging function to hijack the game-cardbox and have it show
  building costs "help" card
  */
  returnCardImage(card){
    if (card == "construction-costs"){
      let html = `<div class="construction-costs saitoa">
              <div class="h2">Building Costs</div>
              <div class="table">
              <div class="tip token p${this.game.colors[this.game.player-1]}"><svg viewbox="0 0 200 200"><polygon points="0,175 175,0, 200,25 25,200"/></svg>
                <div class="tiptext">${this.skin.r.name}: Longest road worth 2 VP</div></div>
                  <div class="cost">${this.visualizeCost(0)}</div>
                <div class="tip token p${this.game.colors[this.game.player-1]}">${this.skin.c1.svg}<div class="tiptext">${this.skin.c1.name}: 1 VP</div></div>
                    <div class="cost">${this.visualizeCost(1)}</div>
                    <div class="tip token p${this.game.colors[this.game.player-1]}">${this.skin.c2.svg}<div class="tiptext">${this.skin.c2.name}: 2 VP</div></div>
                    <div class="cost">${this.visualizeCost(2)}</div>
                <div class="tip token"><svg viewbox="0 0 200 200"><polygon points="25,0 175,0, 175,200 25,200"/>
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="132px" fill="red">?</text></svg>
                <div class="tiptext">${this.skin.card.name} card: Largest army worth 2 VP</div></div><div class="cost">${this.visualizeCost(3)}</div>
              </div>
              <div class="message">The first player to reach ${this.game.options.game_length} VP wins!</div>
              </div>`;
      return html;
    }else{
      return "";
    }
  }


  /*
    Given a resource cost and player, check if they meet the minimum
    requirement = ["res1","res2"...]
  */
  doesPlayerHaveResources(player, requirement) {
    let myBank = this.game.state.players[player - 1].resources.slice();
    for (let x of requirement) {
      let ind = myBank.indexOf(x);
      if (ind >= 0) myBank.splice(ind, 1);
      else return false;
    }
    return true;
  }

  hasVPCards() {
    for (let i = 0; i < this.game.deck[0].hand.length; i++) {
      let cardname = this.game.deck[0].cards[this.game.deck[0].hand[i]].card;
      if (!this.skin.isActionCard(cardname)) return true;
    }
    return false;
  }


  /*
    Recursively let player select two resources, then push them to game queue to share selection
  */
  playYearOfPlenty(player, cardname) {
    if (this.game.player != player) return;
    //Pick something to get
    let settlers_self = this;
    let remaining = 2;
    let resourceList = this.skin.resourceArray();
    let cardsToGain = [];

    //Player recursively selects all the resources they want to get rid of
    let gainResource = function (settlers_self) {
      let html = `<div class='tbd'>Select Resources (Can get ${remaining}): <ul class="horizontal_list">`;
      for (let i of resourceList) {
        html += `<li id="${i}" class="iconoption option">${settlers_self.returnResourceHTML(i)}</li>`;
      }
      html += "</ul>";
      html += "</div>";
      settlers_self.displayCardfan();
      settlers_self.updateStatus(html, 1);

      $(".option").off();
      $(".option").on("click", function () {
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
    let resourceList = this.skin.resourceArray();

    //Player recursively selects all the resources they want to get rid of
    let html = `<div class='tbd'>Select Desired Resource: <ul class="horizontal_list">`;
    for (let i of resourceList) {
      html += `<li id="${i}" class="iconoption option">${settlers_self.returnResourceHTML(i)}</li>`;
    }
    html += "</ul>";
    html += "</div>";

    settlers_self.updateStatus(html, 1);
    settlers_self.displayCardfan();
    $(".option").off();
    $(".option").on("click", function () {
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
    if (vpChange) this.updateScore(); //Maybe not necessary?
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
              `claimed the ${this.skin.longest.name} from ${this.game.playerNames[this.game.state.longestRoad.player-1]} with ${longest.length} segments!`
            );
            this.game.state.longestRoad.player = player;
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
          } else {
            //Increase size
            this.game.state.longestRoad.size = longest.length;
            this.game.state.longestRoad.path = longest;
            this.updateLog(
              `${this.game.playerNames[player-1]} extended the ${this.skin.longest.name} to ${longest.length} segments.`
            );
          }
          return 1;
        }
      } else {
        //Open to claim
        this.highlightRoad(
          player,
          longest,
          `claimed the ${this.skin.longest.name} with ${longest.length} segments.`
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
    for (let i of this.game.state.players[player - 1].resources)
      if (i == resource) ct++;
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
        offer += `<img class="icon" src="${this.skin.resourceIcon(resource)}"/><div class="tiptext">${resource}</div>`;
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



  /*<><><><><><><>
  Broadcast offer to trade to all players
  This just makes an advertisement accessible through game menu to any player at any time (even if not eligible to trade)
  and there is no game mechanic to go directly into accepting or rejecting the trade
  @param tradeType (integer) the player number of the targeted player, 0 for all players, -1 for advertisement
  */
  showTradeOverlay(tradeType = -1, i_should_give, i_should_accept) {
    let settlers_self = this;

    let my_resources = {};
    let resources = settlers_self.skin.resourceArray();
    let offer_resources = settlers_self.skin.resourceObject();
    let receive_resources = settlers_self.skin.resourceObject();

    offer_resources = Object.assign(offer_resources, i_should_give);
    receive_resources = Object.assign(receive_resources, i_should_accept);

    //Convert the players array of resources into a compact object {wheat:1, wood:2,...}
    for (let resource of resources) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) my_resources[resource] = temp;
    }

    let updateOverlay = function (settlers_self, resList, myRes, offering, receiving) {
      let resource_cnt = 0;
      let can_afford = true;

      let html = `
          <div class="trade_overlay saitoa" id="trade_overlay">
            <div class="h1 trade_overlay_title">Trade with ${settlers_self.game.playerNames[tradeType-1]}</div>
            <div class="h2">You will accept</div>
            <div class="trade_overlay_offers">`;
      for (let i = 0; i < resList.length; i++){
        resource_cnt += receiving[resList[i]];
        html += `<div id="want_${i}" class="trade_area select">
                  <div>${resList[i]}</div>
                  <div class="offer_icons" id="want_${resList[i]}">`;
        if (receiving[resList[i]]>0){
          html += `<img id="${resList[i]}" class="icon receive" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
        }
        if (receiving[resList[i]]>1){
          html += `<div class="icon_multiplier">x${receiving[resList[i]]}</div>`;
        }
         html +=  `</div></div>`;
      }

      html += `</div>
            <div class="h2">You will give</div>
            <div class="trade_overlay_offers">`;

      for (let i = 0; i < resList.length; i++) {
        resource_cnt += offering[resList[i]];
        console.log(resList[i], offering[resList[i]], myRes[resList[i]]);
        if (offering[resList[i]] > (myRes[resList[i]] || 0)){
          can_afford = false;
        }
        html += `<div id="offer_${i}" class="trade_area ${(myRes[resList[i]])?"select":"noselect"}">
                 <div class="tip"><span>${resList[i]}</span>
                 <div class="tiptext">${(myRes[resList[i]])?myRes[resList[i]]:0} total</div></div>
                 <div class="offer_icons" id="offer_${resList[i]}">`;
          if (offering[resList[i]]>0){
            html += `<img id="${resList[i]}" class="icon offer" src="${settlers_self.skin.resourceIcon(resList[i])}"/>`;
          }
          if (offering[resList[i]]>1){
            html += `<div class="icon_multiplier">x${offering[resList[i]]}</div>`;
          }
          html += `</div></div>`;
      }

      html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button${(can_afford && resource_cnt>0)?"":" noselect"}">Submit Offer</div>
          </div></div>`;

      settlers_self.overlay.closebox = true;
      settlers_self.overlay.show(html);
      $(".trade_area.select > div:first-child").off();
      $(".trade_area.select > div:first-child").on("click", function () {
        //Update Offer
        let item = $(this).parent().attr("id");
        let temp = item.split("_");
        let resInd = parseInt(temp[1]);
        if (temp[0] == "want") {
          receiving[resList[resInd]]++;
        } else {
          if (offering[resList[resInd]] < myRes[resList[resInd]]) {
            offering[resList[resInd]]++;
          }
        }
        ///Update DOM
        updateOverlay(settlers_self, resList, myRes, offering, receiving);
      });
      $(".icon").off();
      $(".icon").on("click", function(e){
        let res = $(this).attr("id");
        if ($(this).hasClass("offer")){
          offering[res]--;
        }else{
          receiving[res]--;
        }
        e.stopPropagation();
        updateOverlay(settlers_self, resList, myRes, offering, receiving);
      });
      $(".trade_overlay_reset_button").off();
      $(".trade_overlay_reset_button").on("click", function () {
        updateOverlay(
          settlers_self,
          resList,
          myRes,
          settlers_self.skin.resourceObject(),
          settlers_self.skin.resourceObject()
        );
      });
      $(".trade_overlay_broadcast_button").off();
      $(".trade_overlay_broadcast_button").on("click", function () {
        if ($(this).hasClass("noselect")) { return; }
        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
        settlers_self.addMove(
            `offer\t${settlers_self.game.player}\t
            ${tradeType}\t${JSON.stringify(offering)}\t
            ${JSON.stringify(receiving)}`);
        settlers_self.overlay.hide();
        settlers_self.overlay.closebox = false;
        settlers_self.endTurn();
      });
    };

    //Start the display and selection process
    updateOverlay(
      settlers_self,
      resources,
      my_resources,
      offer_resources,
      receive_resources
    );
  }

  /*
  Alternate UI for advertizing your wants and needs
  */
  showResourceOverlay() {
    let settlers_self = this;
    let myRes = {};
    let resources = settlers_self.skin.resourceArray();

    //Convert the players array of resources into a compact object {wheat:1, wood:2,...}
    for (let resource of resources) {
      let temp = settlers_self.countResource(
        settlers_self.game.player,
        resource
      );
      if (temp > 0) myRes[resource] = temp;
    }

    let html = `<div class="trade_overlay saitoa" id="trade_overlay">
            <div>
              <div class="h1 trade_overlay_title">Advertise Trade</div>
              <p>You may share information about your resources with the other players, telling them which resources you may be interested in trading. It will be up to them to initiate a trade offer on their. This should facilitate trading without interrupting game play.</p>
            </div>
            <div class="h2">You Want:</div>
            <div class="trade_overlay_offers">`;
    for (let i = 0; i < resources.length; i++)
      html += `<div id="want_${i}" class="trade_area select tip"><img class="icon" src="${this.skin.resourceIcon(
        resources[i]
      )}"/><div class="tiptext">${resources[i]}</div></div>`;

    html += `</div><div class="h2">You Offer:</div><div class="trade_overlay_offers">`;

    for (let i = 0; i < resources.length; i++) {
      if (myRes[resources[i]])
        html += `<div id="offer_${i}" class="trade_area select tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have ${myRes[resources[i]]} ${resources[i]} available</div></div>`;
      else
        html += `<div id="offer_${i}" class="trade_area noselect tip"><img class="icon" src="${this.skin.resourceIcon(
          resources[i]
        )}"/><div class="tiptext">You have no ${resources[i]} to offer</div></div>`;
    }

    html += `</div><div class="trade_overlay_buttons">
            <div class="trade_overlay_button saito-button-primary trade_overlay_reset_button">Reset</div>
            <div class="trade_overlay_button saito-button-primary trade_overlay_broadcast_button noselect">Broadcast Offer</div>
          </div></div>`;

    this.overlay.closebox = true;
    this.overlay.show(html);

    $(".trade_area.select").on("click", function () {
      $(this).toggleClass("selected");
      if (document.querySelector(".trade_area.selected")){
        $(".trade_overlay_broadcast_button").removeClass("noselect");
      }else{
        $(".trade_overlay_broadcast_button").addClass("noselect");
      }
    });

    $(".trade_overlay_reset_button").on("click", function () {
      $(".trade_area.select").removeClass("selected");
    });

    $(".trade_overlay_broadcast_button").on("click", function () {
      if ($(this).hasClass("noselect")){
        return;
      }
      let offering = {};
      let receiving = {};
      let divs = document.querySelectorAll(".selected");
      for (let i = 0; i < divs.length; i++) {
        let id = divs[i].id;
        let temp = id.split("_");
        let resInd = parseInt(temp[1]);
        //console.log(id,resources[resInd]);
        if (temp[0] == "want") {
          receiving[resources[resInd]] = 1;
        } else {
          offering[resources[resInd]] = 1;
        }
      }
      /*
          //Lazy way
          settlers_self.addMove(`advertisement\t${settlers_self.game.player}\t${JSON.stringify(offering)}\t${JSON.stringify(receiving)}`);
          settlers_self.endTurn();
          settlers_self.overlay.hide();
          */
      //Old way
      let old_turn = settlers_self.game.turn;
      //console.log(settlers_self.game.turn);
      let cmd = `advertisement\t${settlers_self.game.player}\t${JSON.stringify(
        offering
      )}\t${JSON.stringify(receiving)}`;
      settlers_self.game.turn = [];
      settlers_self.game.turn.push(cmd);
      settlers_self.sendMessage("game", {}, function () {
        settlers_self.game.turn = old_turn;
      });
      settlers_self.overlay.hide();
      settlers_self.overlay.closebox = false;

    });
  }


  /* 
  Create an object saying what the exchange rate for each resource is
  */
  analyzePorts() {
    let resources = this.skin.resourceArray();
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


  /***********
   *
   * Game animations
   *
   ***********/
  /*
  Briefly animate the longest road and update log if there is a change in ownership
  */
  highlightRoad(player, road, msg) {
    this.updateLog(`${this.game.playerNames[player-1]} ${msg}`);
    for (let segment of road) {
      let selector = "#road_" + segment;
      let div = document.querySelector(selector);
      if (div) div.classList.add("roadhighlight");
      //else  console.log("Null selector?",selector);
    }

    let divname = ".roadhighlight";

    $(divname)
      .css("background", "#FFF")
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css("background", "#FFF").dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr("style").removeClass("roadhighlight").dequeue();
      });
  }

  /*
  Flashes tiles activated by dice roll
  */
  animateDiceRoll(roll) {
    //console.log("Dice Animated: " + roll);
    $(".rolled").removeClass("rolled");
    $(".sector_value:not(.bandit)").attr("style","");
    let divname = ".sv" + roll + ":not(.bandit)";
    $(divname).addClass("rolled")
      .css("color", "#000")
      .css("background", "#FFF6")
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#FFF").css("background", "#0004").dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css("color", "#000").css("background", "#FFF6").dequeue();
      });
      /*.delay(800)
      .queue(function () {
        $(this).removeAttr("style").dequeue();
      });*/
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


  updatePlayerBox(str, hide_info = 0) {
    try {
      if (hide_info == 0) {
        this.playerbox.showInfo();
      } else {
        this.playerbox.hideInfo();
      }

      if (this.lock_interface == 1) {
        return;
      }

      this.game.status = str;

      if (this.browser_active == 1) {
        let status_obj = document.querySelector(".player-box.me .status");
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
          status_obj.innerHTML = str;
          $(".player-box.me .status").disableSelection();
        }
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }
  }

  updateStatus(str, hide_info = 0) {

    try {
//      if (hide_info == 0) {
//        this.playerbox.showInfo();
//      } else {
//        this.playerbox.hideInfo();
//      }

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
        if (this.game.players.includes(this.app.wallet.returnPublicKey())) {
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
<!--            <div class="action" id="cancel">no</div> -->
            <div class="action" id="stopasking">yes, stop asking</div>
<!--            <div class="confirm_check"><input type="checkbox" name="dontshowme" value="true"/> don't ask again </div>-->
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
        callback();
      }
      if (confirmation == "confirm"){
        callback();
      }
    });

    $('input:checkbox').change(function() {
      if ($(this).is(':checked')) {
        settlers_self.confirm_moves = 0;
      }else{
        settlers_self.confirm_moves = 1;
      }
    });
  }

}

module.exports = SettlersActions;