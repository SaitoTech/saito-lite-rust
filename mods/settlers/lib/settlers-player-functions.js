  /*
    Functions for Player interacting with the board
  */

class SettlersLibrary1 {

 playerBuildCity(player, canBackUp = 0) {

    let settlers_self = this;
    let existing_cities = 0;
    for (let i = 0; i < this.game.state.cities.length; i++) {
      if (this.game.state.cities[i].player == this.game.player) {
        existing_cities++;
      }
    }
    let xpos, ypos;
    $(".flash").removeClass("flash");
    /*
    Everyone starts with 2 settlements and can be placed anywhere on island
    */
    if (existing_cities < 2) {

      if (existing_cities == 1){
        this.updateStatus(`<div class="flashme tbd">YOUR TURN: place ${this.skin.c1.name}...</div>`);
      }else{
        this.updateStatus(`<div class="flashme tbd">YOUR TURN: place ${this.skin.c1.name}...</div>`);
      }
      $(".flashme").addClass("flash");


      $(".city.empty").addClass("chover");
      //$('.city').css('z-index', 9999999);
      $(".city.empty").off();
        
      $(".city.empty").on("mousedown", function (e) {
        xpos = e.clientX;
        ypos = e.clientY;
      });
      //Create as menu on the game board to input word from a tile in horizontal or vertical direction
      $(".city.empty").on("mouseup", function (e) {
          if (Math.abs(xpos - e.clientX) > 4) {
            return;
          }
          if (Math.abs(ypos - e.clientY) > 4) {
            return;
          }
          $(".city.empty").css("background-color", "");   
          //Confirm this move
          let slot = $(this).attr("id");
          settlers_self.confirmPlacement(slot, settlers_self.skin.c1.name, ()=>{
            $(".city.empty").removeClass("chover");
            $(".city.empty").off();
              settlers_self.game.state.placedCity = slot;
              settlers_self.buildCity(settlers_self.game.player, slot);
              if (existing_cities == 1)
                settlers_self.addMove(
                  `secondcity\t${settlers_self.game.player}\t${slot.replace(
                    "city_",
                    ""
                  )}`
                );
              settlers_self.addMove(
                `build_city\t${settlers_self.game.player}\t${slot}`
              );
              settlers_self.endTurn();
          });
        
      });
      
    } else {
      /* During game, must build roads to open up board for new settlements*/
      if (canBackUp){
        this.updateStatus(`<div class="tbd">You may build a ${this.skin.c1.name}...</div><ul><li class="undo">don't build ${this.skin.c1.name}</li></ul>`);
        $(".undo").on("click",function(){
          //Make sure the confirm popup goes away
          $(".action").off();
          $(".popup-confirm-menu").remove();
          $(".rhover").off();
          $(".rhover").removeClass("rhover");

          settlers_self.addMove("undo_build");
          settlers_self.endTurn();
        });
      }else{
        this.updateStatus(`<div class="tbd">You may build a ${this.skin.c1.name}...</div>`);  
      }
      
      let building_options = this.returnCitySlotsAdjacentToPlayerRoads(this.game.player);
      for (let i = 0; i < building_options.length; i++) {
        console.log(building_options[i]);
        let divname = "#" + building_options[i];
        $(divname).addClass("rhover");
      }
        
        $(".rhover").off();
        $(".rhover").on("mousedown", function (e) {
          xpos = e.clientX;
          ypos = e.clientY;
        });

        $(".rhover").on("mouseup", function (e) {
          if (Math.abs(xpos - e.clientX) > 4) {
            return;
          }
          if (Math.abs(ypos - e.clientY) > 4) {
            return;
          }
  
          let slot = $(this).attr("id");
          settlers_self.confirmPlacement(slot, settlers_self.skin.c1.name, ()=>{
            $(".rhover").off();
            $(".rhover").removeClass("rhover");

            settlers_self.buildCity(settlers_self.game.player, slot);
            settlers_self.addMove(`build_city\t${settlers_self.game.player}\t${slot}`);
            settlers_self.endTurn();
          })
        });
      
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

  playerUpgradeCity(player, canBackUp = 0) {
    
    if (canBackUp){
      this.updateStatus(`<div class="tbd">Click on a ${this.skin.c1.name} to upgrade it to a ${this.skin.c2.name}...</div><ul><li class="undo">don't build ${this.skin.c2.name}</li></ul>`);
      $(".undo").on("click",function(){
        //Make sure the confirm popup goes away
        $(".action").off();
        $(".popup-confirm-menu").remove();
        //Disable board event selection
        $(".chover").off();
        $(".chover").removeClass("chover");

        settlers_self.addMove("undo_build");
        settlers_self.endTurn();
      });
    }else{
      this.updateStatus(`<div class="tbd">Click on a ${this.skin.c1.name} to upgrade it to a ${this.skin.c2.name}...</div>`);  
    }

    let settlers_self = this;
    //let selector = `.city.p${this.game.colors[player-1]}`;
    //Manually go through available player's cities because DOM doesn't have convenient selector
    for (let c of settlers_self.game.state.cities) {
      if (c.level === 1 && c.player === player) {
        $("#" + c.slot).addClass("chover");
      }
    }

    //$(selector).addClass('chover');
    $(".chover").off();
    $(".chover").on("click", function () {
      $(".chover").off();
      $(".chover").removeClass("chover");

      let slot = $(this).attr("id");

      for (let i = 0; i < settlers_self.game.state.cities.length; i++) {
        if (
          slot == settlers_self.game.state.cities[i].slot &&
          settlers_self.game.state.cities[i].level == 1
        ) {
          settlers_self.addMove(
            `upgrade_city\t${settlers_self.game.player}\t${slot}`
          );
          settlers_self.endTurn();
          return;
        }
      }
      //Something went wrong, try again
      settlers_self.playerUpgradeCity(player);
    });
  }

  /*
    Allows player to click a road 
  */
  
  playerBuildRoad(player, canBackUp = false) {
 
   let settlers_self = this;

    if (this.game.state.placedCity) {
      this.updateStatus(
        `<div class="tbd">YOUR TURN: place a ${this.skin.r.name}...</div>`
      );

      /*Initial placing of settlements and roads, road must connect to settlement just placed
        Use a "new" class tag to restrict scope
        This is literally just a fix for the second road in the initial placement
      */
      let newRoads = this.hexgrid.edgesFromVertex(
        this.game.state.placedCity.replace("city_", "")
      );
      for (let road of newRoads) {
        $(`#road_${road}`).addClass("new");
      }
      $(".road.new").addClass("rhover");

      
      $(".road.new").off();
      $(".road.new").on("click", function () {
        let slot = $(this).attr("id");
        settlers_self.confirmPlacement(slot, settlers_self.skin.r.name, ()=>{
          $(".road.new").off();
          $(".road.new").removeAttr("style");
          $(".rhover").removeClass("rhover");
          $(".road.new").removeClass("new");
        
          settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    } else {
      if (canBackUp){
        this.updateStatus(`<div class="tbd">You may build a ${this.skin.r.name}...</div><ul><li class="undo">don't build ${this.skin.r.name}</li></ul>`);
        $(".undo").on("click",function(){
          //Make sure the confirm popup goes away
          $(".action").off();
          $(".undo").off();
          $(".popup-confirm-menu").remove();
          $(".road.empty").off();
          $(".rhover").removeClass("rhover");
          $(".road.empty").removeAttr("style");

          settlers_self.addMove(`undo_build`);
          settlers_self.endTurn();
        });

      } else{
        this.updateStatus(`<div class="tbd">You may build a ${this.skin.r.name}...</div>`);
      }

      /*Normal game play, can play road anywhere empty connected to my possessions*/
      $(".road.empty").addClass("rhover");
      
      $(".road.empty").off();
      $(".road.empty").on("click", function () {
        let slot = $(this).attr("id");
        settlers_self.confirmPlacement(slot, settlers_self.skin.r.name, ()=>{
          $(".road.empty").off();
          $(".rhover").removeClass("rhover");
          $(".road.empty").removeAttr("style");
          settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
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
  Main function to let player carry out their turn...
  */

  playerPlayMove() {
    let settlers_self = this;
    let html = "";

    //console.log("RES: " + JSON.stringify(this.game.state.players[this.game.player - 1].resources));

    html += "<ul>";

    if (settlers_self.canPlayerBankTrade()){
      html += '<li class="option" id="bank">bank</li>';  
    }
    

    if (settlers_self.canPlayerPlayCard()) {
      html += `<li class="option" id="playcard">play card</li>`;
    }
    if (
      settlers_self.canPlayerBuildRoad(settlers_self.game.player) ||
      settlers_self.canPlayerBuildTown(settlers_self.game.player) ||
      settlers_self.canPlayerBuildCity(settlers_self.game.player) ||
      settlers_self.canPlayerBuyCard(settlers_self.game.player)
    ) {
      html += `<li class="option" id="spend">spend resources</li>`;
    } else {
      //html += `<li class="option noselect" id="nospend">spend resources</li>`;
    }

    html += `<li class="option" id="pass">pass dice</li>`;
    html += "</ul>";

    settlers_self.updateStatus(settlers_self.getLastNotice() + html);

    $(".option").off();
    $(".option").on("click", function () {
      let id = $(this).attr("id");
      /*
      Player should be able to continue to take actions until they end their turn
      */
      if (id === "pass") {
        settlers_self.addMove("end_turn\t" + settlers_self.game.player);
        settlers_self.endTurn();
        return;
      }
      if (id === "bank"){
        settlers_self.bankTrade();
        return;
      }
      if (id === "playcard") {
        settlers_self.playerPlayCard();
        return;
      }
      if (id == "spend") {
        settlers_self.playerBuild();
        return;
      }
      if (id == "nospend") {
        //Show a tool tip to remind players of what resources they need to build what
      }

      //console.log("Unexpected selection for player move:",id);
    });
  }
}

module.exports = SettlersLibrary1;