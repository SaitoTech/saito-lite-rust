class SettlersPlayer {
  //Select the person to steal from
  playerMoveBandit(player, hexId) {
    let settlers_self = this;
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
          '<div class="status-header"><span id="status-content">Steal from which Player:</span></div>';
        html += `<div class="status-text-menu"> <ul>`;
        for (let i = 0; i < this.game.players.length; i++) {
          if (thievingTargets.includes(i + 1)) {
            html += `<li class="textchoice steal-player-choice" id="${i + 1}">${
              settlers_self.game.playerNames[i]
            } (${settlers_self.game.state.players[i].resources.length} cards)</li>`;
          }
        }
        html += "</ul></div>";
        this.updateStatus(html, 1);

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
    this.updateStatus(`<div class="player-notice"><span>Move the ${this.b.name}</span></div>`);
    let settlers_self = this;
    $(".sector-container").addClass("rhover");
    $(".sector-container").off();
    $(".sector-container").on("click", function () {
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
    if (this.game.state.players[player - 1].towns == 0) return false;
    if (this.returnCitySlotsAdjacentToPlayerRoads(this.game.player).length == 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[1]);
  }

  playerBuildTown(player, canBackUp = 0) {
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
      if (existing_cities == 1) {
        this.hud.updateStatus(
          `<div class="flashme player-notice"><span>YOUR TURN: place your second ${this.c1.name}</span></div>`
        );
        this.setHudHeight();
      } else {
        this.hud.updateStatus(
          `<div class="flashme player-notice"><span>YOUR TURN: place your first ${this.c1.name}</span></div>`
        );
        this.setHudHeight();
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
        settlers_self.confirmPlacement(slot, settlers_self.c1.name, () => {
          $(".city.empty").removeClass("chover");
          $(".city.empty").off();
          settlers_self.game.state.placedCity = slot;
          settlers_self.buildCity(settlers_self.game.player, slot);
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
      this.updateStatus(`<div class="player-notice">You may build a ${this.c1.name}</div>`);
      if (canBackUp) {
        this.updateControls(`<ul><li class="undo">cancel</li></ul>`);
        $(".undo").on("click", function () {
          //Make sure the confirm popup goes away
          $(".action").off();
          $(".popup-confirm-menu").remove();
          $(".rhover").off();
          $(".rhover").removeClass("rhover");

          settlers_self.addMove("undo_build");
          settlers_self.endTurn();
        });
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
        settlers_self.confirmPlacement(slot, settlers_self.c1.name, () => {
          $(".rhover").off();
          $(".rhover").removeClass("rhover");

          settlers_self.buildCity(settlers_self.game.player, slot);
          settlers_self.addMove(`build_city\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
        });
      });
    }
  }

  canPlayerBuildRoad(player) {
    return this.doesPlayerHaveResources(player, this.priceList[0]);
  }

  playerBuildRoad(player, canBackUp = false) {
    let settlers_self = this;

    if (this.game.state.placedCity) {
      this.updateStatus(
        `<div class="player-notice"><span>YOUR TURN: place a ${this.r.name}</span></div>`
      );

      /*Initial placing of settlements and roads, road must connect to settlement just placed
          Use a "new" class tag to restrict scope
          This is literally just a fix for the second road in the initial placement
        */
      let newRoads = this.hexgrid.edgesFromVertex(this.game.state.placedCity.replace("city_", ""));
      for (let road of newRoads) {
        $(`#road_${road}`).addClass("new");
      }
      $(".road.new").addClass("rhover");

      $(".road.new").off();
      $(".road.new").on("click", function () {
        let slot = $(this).attr("id");
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
      this.updateStatus(`<div class="player-notice">You may build a ${this.r.name}...</div>`);
      if (canBackUp) {
        this.updateControls(`<ul><li class="undo">cancel</li></ul>`);
        $(".undo").on("click", function () {
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
      }

      /*Normal game play, can play road anywhere empty connected to my possessions*/
      $(".road.empty").addClass("rhover");

      $(".road.empty").off();
      $(".road.empty").on("click", function () {
        let slot = $(this).attr("id");
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
    let availableSlot = false;
    for (let i of this.game.state.cities) {
      if (i.player == player && i.level == 1) availableSlot = true;
    }
    if (!availableSlot) return false;
    if (this.game.state.players[player - 1].cities == 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[2]);
  }

  playerBuildCity(player, canBackUp = 0) {
    this.updateStatus(
      `<div class="player-notice">Click on a ${this.c1.name} to upgrade it to a ${this.c2.name}...</div>`
    );
    if (canBackUp) {
      this.updateControls(`<ul><li class="undo">cancel</li></ul>`);
      $(".undo").on("click", function () {
        //Make sure the confirm popup goes away
        $(".action").off();
        $(".popup-confirm-menu").remove();
        //Disable board event selection
        $(".chover").off();
        $(".chover").removeClass("chover");

        settlers_self.addMove("undo_build");
        settlers_self.endTurn();
      });
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
          settlers_self.addMove(`upgrade_city\t${settlers_self.game.player}\t${slot}`);
          settlers_self.endTurn();
          return;
        }
      }
      //Something went wrong, try again
      settlers_self.playerBuildCity(player);
    });
  }

  /*
    Main function to let player carry out their turn...
    */
  playerPlayMove() {
    let settlers_self = this;
    let can_do_something = false;

    let html = "<ul>";

    if (settlers_self.canPlayerTradeWithBank()) {
      html += '<li class="option" id="bank">bank</li>';
      can_do_something = true;
    }

    if (settlers_self.canPlayerPlayCard()) {
      html += `<li class="option" id="playcard">play card</li>`;
      can_do_something = true;
    }

    if (
      settlers_self.canPlayerBuildRoad(settlers_self.game.player) ||
      settlers_self.canPlayerBuildTown(settlers_self.game.player) ||
      settlers_self.canPlayerBuildCity(settlers_self.game.player) ||
      settlers_self.canPlayerBuyCard(settlers_self.game.player)
    ) {
      html += `<li class="option" id="spend">spend</li>`;
      can_do_something = true;
    } else {
      //html += `<li class="option noselect" id="nospend">spend</li>`;
    }

    html += `<li class="option" id="pass">pass dice</li>`;
    html += "</ul>";

    //
    // auto-end my turn if I cannot do anything
    //
    if (can_do_something != true) {
      this.addMove("end_turn\t" + settlers_self.game.player);
      this.addMove("ACKNOWLEDGE\tYou cannot buy anything - end turn\t" + settlers_self.game.player);
      this.endTurn();
      return;
    }

    settlers_self.updateStatus(settlers_self.getLastNotice());
    settlers_self.updateControls(html);

    $(".option").off();
    $(".option").on("click", function () {
      let id = $(this).attr("id");
      if (id === "pass") {
        settlers_self.addMove("end_turn\t" + settlers_self.game.player);
        settlers_self.endTurn();
        return;
      }
      if (id === "bank") {
        settlers_self.bank.render();
        //settlers_self.playerTradeWithBank();
        return;
      }
      if (id === "playcard") {
        settlers_self.dev_card.render();
        //settlers_self.playerPlayCard();
        return;
      }
      if (id == "spend") {
        settlers_self.build.render();
        return;
      }
      if (id == "nospend") {
        //Show a tool tip to remind players of what resources they need to build what
      }
    });

    if (
      settlers_self.canPlayerBuildRoad(settlers_self.game.player) ||
      settlers_self.canPlayerBuildTown(settlers_self.game.player) ||
      settlers_self.canPlayerBuildCity(settlers_self.game.player) ||
      settlers_self.canPlayerBuyCard(settlers_self.game.player)
    ) {
      html += `<li class="option" id="spend">spend</li>`;
      can_do_something = true;
    } else {
      //html += `<li class="option noselect" id="nospend">spend</li>`;
    }
  }

  playerPlayCard() {
    let settlers_self = this;
    this.displayCardfan("cards");
    let html = "";
    html += '<div class="player-notice">Select a card to play: <ul>';
    let limit = Math.min(
      this.game.deck[0].hand.length,
      this.game.state.players[this.game.player - 1].devcards
    );
    //Show all old cards
    for (let i = 0; i < limit; i++) {
      let card = this.game.deck[0].cards[this.game.deck[0].hand[i]];
      if (this.game.state.canPlayCard || !this.isActionCard(card.card)) {
        html += `<li class="option tip" id="${i}">${card.card}
                    <div class="tiptext">${this.rules[card.action]}</div>
                   </li>`;
      }
    }
    //Show New VP as well
    for (let i = Math.max(limit, 0); i < this.game.deck[0].hand.length; i++) {
      let card = this.game.deck[0].cards[this.game.deck[0].hand[i]];
      if (!this.isActionCard(card.card)) {
        html += `<li class="option tip" id="${i}">${card.card}
                   <div class="tiptext">${this.rules[card.action]}</div>
                   </li>`;
      }
    }

    html += `<li class="option" id="cancel">go back</li>`;
    html += "</ul></div>";
    this.updateStatus(html, 0);

    $(".option").off();
    $(".option").on("click", function () {
      let card = $(this).attr("id"); //this is either "cancel" or the card's deck index (i.e. "11")
      let cardobj = settlers_self.game.deck[0].cards[settlers_self.game.deck[0].hand[card]];

      //Allow a player not to play their dev card
      if (card == "cancel") {
        settlers_self.endTurn();
        /*Restart last move because maybe thought about playing a card before rolling and want to go back to that state
         */
        return;
      }

      //Callback seems to get lost somewhere
      //cardobj.callback(settlers_self.game.player);
      //Fallback code, old school switch
      switch (cardobj.action) {
        case 1: //Soldier/Knight
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          settlers_self.addMove(`play_knight\t${settlers_self.game.player}\t${cardobj.card}`);
          settlers_self.endTurn();
          break;
        case 2:
          settlers_self.playYearOfPlenty(settlers_self.game.player, cardobj.card);
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          break;
        case 3:
          settlers_self.playMonopoly(settlers_self.game.player, cardobj.card);
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          break;
        case 4:
          settlers_self.game.state.canPlayCard = false; //No more cards this turn
          settlers_self.addMove("player_build_road\t" + settlers_self.game.player);
          settlers_self.addMove("player_build_road\t" + settlers_self.game.player);
          settlers_self.addMove(`road_building\t${settlers_self.game.player}\t${cardobj.card}`);
          settlers_self.endTurn();
          break;
        default:
          //victory point
          settlers_self.addMove(`vp\t${settlers_self.game.player}\t${cardobj.card}`);
          settlers_self.endTurn();
      }
      settlers_self.removeCardFromHand(settlers_self.game.deck[0].hand[card]);
    });
  }

  canPlayerTradeWithBank() {
    let minForTrade = this.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    if (!this.game.state.canTrade) {
      return false;
    }

    for (let resource of this.returnResources()) {
      if (this.countResource(this.game.player, resource) >= minForTrade[resource]) return true;
    }
    return false;
  }

  playerTradeWithBank() {
    let settlers_self = this;
    let my_resources = {};
    let minForTrade = this.analyzePorts(); //4;  //1) Fix to have 3:1 port, 2) Fix for resource specific 2:1 ports

    for (let resource of this.returnResources()) {
      let temp = settlers_self.countResource(settlers_self.game.player, resource);
      if (temp >= minForTrade[resource]) my_resources[resource] = temp;
    }

    if (Object.keys(my_resources).length > 0) {
      let html = "<div class='player-notice'>Select Resource to Trade: <ul class='bank'>";
      for (let i in my_resources) {
        html += `<li id="${i}" class="option">`;
        for (let j = 0; j < minForTrade[i]; j++) {
          html += `<img class="icon" src="${settlers_self.returnCardImage(i)}"/>`;
        }
        //`${i} (${minForTrade[i]}/${my_resources[i]})</li>`;
      }
      html += '<li id="cancel" class="option">cancel trade</li>';
      html += "</ul>";
      html += "</div>";

      settlers_self.updateStatus(html, 1);

      $(".option").off();
      $(".option").on("click", function () {
        let res = $(this).attr("id");
        if (res == "cancel") {
          settlers_self.endTurn();
          return;
        }

        //Picked something to give, now pick something to get
        html = "<div class='player-notice'>Select Desired Resource: <ul class='bank horizontal_list'>";
        for (let i of settlers_self.returnResources()) {
          html += `<li id="${i}" class="iconoption option tip"><img class="icon" src="${settlers_self.returnCardImage(
            i
          )}">
              <div class="tiptext">${i}</div></li>`;
        }
        html += '<li id="cancel" class="option">cancel trade</li>';
        html += "</ul>";
        html += "</div>";
        settlers_self.updateStatus(html, 1);

        $(".option").off();
        $(".option").on("click", function () {
          let newRes = $(this).attr("id");
          if (newRes == "cancel") {
            settlers_self.endTurn();
            return;
          }

          if (newRes == res) {
            html = `<div class="player-notice">Are you sure you want to discard ${
              minForTrade[res] - 1
            } ${res}s??
                            <ul><li id="yes" class="option">Yes, Do it!</li>
                            <li id="no" class="option">No way!</li></ul></div>`;
            settlers_self.updateStatus(html, 1);
            $(".option").off();
            $(".option").on("click", function () {
              let choice = $(this).attr("id");
              if (choice == "yes") {
                settlers_self.addMove(
                  `bank\t${settlers_self.game.player}\t${minForTrade[res]}\t${res}\t1\t${newRes}`
                );
                settlers_self.endTurn();
                return;
              } else {
                settlers_self.endTurn();
                return;
              }
            });
            return;
          }

          //Set up Trade
          settlers_self.addMove(
            `bank\t${settlers_self.game.player}\t${minForTrade[res]}\t${res}\t1\t${newRes}`
          );
          settlers_self.endTurn();
          return;
        });
      });
    } else {
      let ackhtml = `<div class='player-notice'>You don't have enough resources to trade with the bank</div>
                      <ul><li class="option" id="okay">okay</li></ul>`;
      settlers_self.updateStatus(ackhtml, 1);
      $(".option").off();
      $(".option").on("click", function () {
        settlers_self.playerPlayMove();
        return;
      });
    }
  }

  canPlayerBuyCard(player) {
    //No more cards in deck (No reshuffling in this game)
    if (this.game.deck[0].crypt.length === 0) return false;
    return this.doesPlayerHaveResources(player, this.priceList[3]);
  }

  canPlayerPlayCard() {
    if (this.game.state.players[this.game.player - 1].devcards > 0) {
      //not deck.length
      if (this.game.state.canPlayCard) return true;
    }
    if (this.hasVPCards()) {
      return true;
    }

    return false;
  }
}

module.exports = SettlersPlayer;
