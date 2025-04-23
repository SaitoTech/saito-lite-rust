class SettlersPlayer {

  //Select the person to steal from
  playerMoveBandit(player, hexId) {
    let settlers_self = this;
    this.halted = 1;
    //Find adjacent cities and launch into stealing mechanism
    let thievingTargets = [];

    for (let city of this.game.state.cities) {
      if (city.neighbours.includes(hexId)) {
        if (city.player != player)
          if (!thievingTargets.includes(city.player)) thievingTargets.push(city.player);
      }
    }

    if (thievingTargets.length > 0) {
      let robPlayer = (victim) => {
        let potentialLoot = settlers_self.game.state.players[victim - 1].resources;
        if (potentialLoot.length > 0) {
          let loot = potentialLoot[Math.floor(Math.random() * potentialLoot.length)];
          settlers_self.addMove(`steal_card\t${player}\t${victim}\t${loot}`);
        } else settlers_self.addMove(`steal_card\t${player}\t${victim}\tnothing`);
        settlers_self.endTurn();
      };

      if (thievingTargets.length > 1) {
        let html =
          '<div class="status-header"><span id="status-content">steal from which Player:</span></div>';
        html += `<div class="status-text-menu"> <ul>`;
        for (let i = 0; i < this.game.players.length; i++) {
          if (thievingTargets.includes(i + 1)) {
            html += `<li class="textchoice steal-player-choice" id="${i + 1}">${
              settlers_self.game.playerNames[i]
            } (${settlers_self.game.state.players[i].resources.length} cards)</li>`;
          }
        }
        html += "</ul></div>";
        this.hud.updateStatus(html);

        //Select a player to steal from
        $(".textchoice").off();
        $(".textchoice").on("click", function () {
          $(".textchoice").off();
          let victim = $(this).attr("id");
          robPlayer(victim);
        });
      } else {
        robPlayer(thievingTargets[0]);
      }
    } else {
      //No one to steal from
      settlers_self.addMove(`steal_card\t${player}\t0\tnothing`);
      settlers_self.endTurn();
    }
  }

  //
  // when 7 is rolled or Soldier Played
  // Select the target spot
  //
  playerPlayBandit() {

    let xpos = 0;
    let ypos = 0;

    this.updateStatus(`MOVE the <span class="to-upper">${this.b.name}</span>:`);
    $(".option").css("visibility", "hidden");
    let settlers_self = this;
    $(".sector-container").addClass("rhover");
    $(".sector-container").off();
    $('.sector-container').on('mousedown', function (e) {
      xpos = e.clientX;
      ypos = e.clientY;
    });
    $('.sector-container').on('mouseup', function (e) {
      if (Math.abs(xpos-e.clientX) > 4) { return; }
      if (Math.abs(ypos-e.clientY) > 4) { return; }
      $(".sector-container").off();
      $(".sector-container").removeClass("rhover");
      let slot = $(this).attr("id");
      settlers_self.addMove(`move_bandit\t${settlers_self.game.player}\t${slot}`);
      settlers_self.endTurn();
    });
    $(".bandit").removeClass("rhover");
    $(".bandit").off(); //Don't select bandit tile
  }

  canPlayerBuildTown(player) {
    if (!this.game.state.hasRolled || this.game.state.playerTurn !== this.game.player) return false;
    if (this.game.state.players[player - 1].towns == 0) return false;
    if (this.returnCitySlotsAdjacentToPlayerRoads(this.game.player).length == 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[1]);
  }

  playerBuildTown(player, canBackUp = 0) {
    let settlers_self = this;
    let existing_cities = 0;
    this.halted = 1;
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
      if (existing_cities == 1) {
        this.hud.updateStatus(
          `<div class="player-notice">YOUR TURN: place your second ${this.c1.name}</div>`
        );
      } else {
        this.hud.updateStatus(
          `<div class="player-notice">YOUR TURN: place your first ${this.c1.name}</div>`
        );
      }

      $(".city.empty").addClass("chover");
      //$('.city').css('z-index', 9999999);
      $(".city.empty").off();

      $(`.city.empty[data-score="15"]`).addClass("noselect");
      $(`.city.empty[data-score="14"]`).addClass("noselect");
      //$('.city.noselect').removeClass("empty");


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

        if ($(this).hasClass("noselect")){
          salert("This space is too valuable for an initial placement");
          return;
        }


        $(".city.empty").css("background-color", "");
        //Confirm this move
        let slot = $(this).attr("id");
        settlers_self.confirmPlacement(slot, settlers_self.c1.name, () => {
          $(".city.empty").removeClass("chover");
          $(".city.empty").off();
          settlers_self.game.state.placedCity = slot;
          //settlers_self.buildCity(settlers_self.game.player, slot);
          if (existing_cities == 1)
            settlers_self.addMove(
              `secondcity\t${settlers_self.game.player}\t${slot.replace("city_", "")}`
            );
          settlers_self.addMove(`build_city\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    } else {
      /* During game, must build roads to open up board for new settlements*/
      this.updateStatus(`you may build a ${this.c1.name}...`);
      if (canBackUp) {
        this.updateControls(`<i class="fa-solid fa-xmark"></i>`);
          document.getElementById("rolldice").onclick = (e) => {
            //Make sure the confirm popup goes away
            $(".action").off();
            $(".popup-confirm-menu").remove();
            $(".rhover").off();
            $(".rhover").removeClass("rhover");

            settlers_self.addMove(`undo_build\t${settlers_self.game.player}\t1`);
            settlers_self.endTurn();
          }
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
        $(".rhover").css("background-color", "");
        settlers_self.confirmPlacement(slot, settlers_self.c1.name, () => {
          $(".rhover").off();
          $(".rhover").removeClass("rhover");

          //settlers_self.buildCity(settlers_self.game.player, slot);
          settlers_self.addMove(`build_city\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    }
  }

  canPlayerBuildRoad(player) {
    if (!this.game.state.hasRolled || this.game.state.playerTurn !== this.game.player) return false;
    return this.doesPlayerHaveResources(player, this.priceList[0]);
  }

  playerBuildRoad(player, canBackUp = false) {
    let settlers_self = this;
    this.halted = 1;

    if (this.game.state.placedCity) {
      this.hud.updateStatus(`<div class="player-notice">YOUR TURN: place a connecting ${this.r.name}</diiv>`);

      let newRoads = this.hexgrid.edgesFromVertex(this.game.state.placedCity.replace("city_", ""));
      for (let road of newRoads) {
        $(`#road_${road}`).addClass("new");
      }
      $(".road.new").addClass("rhover");

      $(".road.new").off();
      $(".road.new").on("click", function () {
        let slot = $(this).attr("id");
        $(".road.empty").css("background-color", "");
        settlers_self.confirmPlacement(slot, settlers_self.r.name, () => {
          $(".road.new").off();
          $(".road.new").removeAttr("style");
          $(".rhover").removeClass("rhover");
          $(".road.new").removeClass("new");

          settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    } else {
      this.updateStatus(`you may build a ${this.r.name}...`);
      if (canBackUp) {
        this.updateControls(`<i class="fa-solid fa-xmark"></i>`);
        document.getElementById("rolldice").onclick = (e) => {
          //Make sure the confirm popup goes away
          $(".action").off();
          $(".popup-confirm-menu").remove();
          $(".road.empty").off();
          $(".rhover").removeClass("rhover");
          $(".road.empty").removeAttr("style");

          settlers_self.addMove(`undo_build\t${settlers_self.game.player}\t0`);
          settlers_self.endTurn();
        }
      }

      /*Normal game play, can play road anywhere empty connected to my possessions*/
      $(".road.empty").addClass("rhover");

      $(".road.empty").off();
      $(".road.empty").on("click", function () {
        let slot = $(this).attr("id");
        $(".road.empty").removeAttr("style");
        settlers_self.confirmPlacement(slot, settlers_self.r.name, () => {
          $(".road.empty").off();
          $(".rhover").removeClass("rhover");
          $(".road.empty").removeAttr("style");
          settlers_self.addMove(`build_road\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    }
  }

  canPlayerBuildCity(player) {
    if (!this.game.state.hasRolled || this.game.state.playerTurn !== this.game.player) return false;
    let availableSlot = false;
    for (let i of this.game.state.cities) {
      if (i.player == player && i.level == 1) availableSlot = true;
    }
    if (!availableSlot) return false;
    if (this.game.state.players[player - 1].cities == 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[2]);
  }

  playerBuildCity(player, canBackUp = 0) {
    this.halted = 1;
    this.updateStatus(`click on a ${this.c1.name} to upgrade it to a ${this.c2.name}...`);
    if (canBackUp) {
      this.updateControls(`<i class="fa-solid fa-xmark"></i>`);
      document.getElementById("rolldice").onclick = (e) => {
        //Make sure the confirm popup goes away
        $(".action").off();
        $(".popup-confirm-menu").remove();
        //Disable board event selection
        $(".chover").off();
        $(".chover").removeClass("chover");

        settlers_self.addMove(`undo_build\t${settlers_self.game.player}\t2`);
        settlers_self.endTurn();
      }
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
//>>>>>>>>>>>>>>>>>
      let slot = $(this).attr("id");
      $(".chover").removeAttr("style");

      $(this).css("border-color", "yellow");
      settlers_self.confirmPlacement(slot, settlers_self.c2.name, () => {
        $(".chover").removeAttr("style");
        $(".chover").off();
        $(".chover").removeClass("chover");
        for (let i = 0; i < settlers_self.game.state.cities.length; i++) {
          if (
            slot == settlers_self.game.state.cities[i].slot &&
            settlers_self.game.state.cities[i].level == 1
          ) {
            settlers_self.addMove(`upgrade_city\t${settlers_self.game.player}\t${slot}`);
            settlers_self.endTurn();
            return;
          }
        }
        //Something went wrong, try again
        console.warn("Unexpected error in upgrading a city");
        settlers_self.playerBuildCity(player);

        });
    });
  }

  /*
    Main function to let player carry out their turn...
    */
  playerPlayMove() {
    let can_do_something = false;

    if (this.canPlayerTradeWithBank()){
      can_do_something = true;
      $("#bank").addClass("enabled");
    }else{
      $("#bank").removeClass("enabled");
    }
    
    if (this.canPlayerPlayCard()) {
      can_do_something = true;
      $("#playcard").addClass("enabled");
    }else{
      $("#playcard").removeClass("enabled");
    }
    
    
    if (this.canPlayerBuildRoad(this.game.player) ||
      this.canPlayerBuildTown(this.game.player) ||
      this.canPlayerBuildCity(this.game.player) ||
      this.canPlayerBuyCard(this.game.player)){
      can_do_something = true;
      $("#spend").addClass("enabled");
    }else{
      $("#spend").removeClass("enabled");
    }

    $(".controls .option").css("visibility", "visible");

    $("#rolldice").html(`<i class="fa-solid fa-forward"></i>`);
    $("#rolldice").addClass("enabled");

    //
    // auto-end my turn if I cannot do anything
    //
    if (can_do_something != true) {
        this.addMove("end_turn\t" + this.game.player); //End turn deletes the previous move (player_actions)
        this.addMove("ACKNOWLEDGE\tyou cannot do anything - end turn\t" + this.game.player);
        this.endTurn();
      return;
    }

    //
    // Set timer to auto-end my turn if I take too long
    // 
    if (this.turn_limit){
      this.setShotClock("#rolldice", this.turn_limit, false);
    }

    let statushtml = "YOUR TURN:";
    this.updateStatus(`${statushtml}`);

    document.getElementById("rolldice").onclick = (e) => {
        e.currentTarget.onclick = null;
        this.addMove("end_turn\t" + this.game.player);
        this.endTurn();
    }
  }


  canPlayerTradeWithBank() {
    let minForTrade = this.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    if (!this.game.state.canTrade) {
      return false;
    }

    if (!this.game.state.hasRolled || this.game.state.playerTurn !== this.game.player) return false;

    for (let resource of this.returnResources()) {
      if (this.countResource(this.game.player, resource) >= minForTrade[resource]) return true;
    }
    return false;
  }


  canPlayerBuyCard(player) {
    //No more cards in deck (No reshuffling in this game)
    if (!this.game.state.hasRolled || this.game.state.playerTurn !== this.game.player) return false;
    if (this.game.deck[0].crypt.length === 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[3]);
  }

  canPlayerPlayCard(onlyKnights = false) {
    if (this.game.state.bandit) {
      return false;
    }
    if (this.game.state.playerTurn !== this.game.player) {
      console.log("not my turn");
      return false;
    }
    
    console.log(this.game.state.players[this.game.player-1].devcards);
    
    if (onlyKnights){
      for (let c of this.game.state.players[this.game.player-1].devcards){
        let card = this.game.deck[0].cards[c];
        console.log(card);
        if (card.action == 1){
          return true;
        }
      }
    }else{
      if (this.game.state.players[this.game.player - 1].devcards.length > 0) {
        return this.game.state.canPlayCard; 
      }
    }
    
    return false;
  }
}

module.exports = SettlersPlayer;
