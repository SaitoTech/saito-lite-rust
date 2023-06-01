class SettlersDisplay {
  /*
    Every player should have in deck[2] and deck[3] the board tiles and tokens in the same order
    */
  displayMap() {
    let tileCt = 0;
    let tokenCt = 0;
    let tile, resourceName, token;
    for (let hex of this.hexgrid.hexes) {
      tile = this.game.pool[0].hand[tileCt++];
      resourceName = this.game.deck[1].cards[tile].resource;
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
      if (resourceName == this.returnNullResource()) {
        this.game.state.hexes[hex].robber = true;
      }
      if (token) {
        this.addSectorValueToGameboard(hex, token);
      }
    }
    console.log("DONE GENERATING MAP");
  }

  renderTradeOfferInPlayerBox(offering_player, stuff_on_offer, stuff_in_return) {
    let settlers_self = this;

    let can_accept = true;
    for (let r in stuff_in_return) {
      if (this.countResource(this.game.player, r) < stuff_in_return[r]) {
        can_accept = false;
      }
    }

    if (!can_accept) {
      this.game.state.ads[offering_player - 1].ad = true;
      this.addMove(`reject_offer\t${this.game.player}\t${offering_player}`);
      this.endTurn();
      return;
    }

    //Simplify resource objects
    let offer = this.wishListToImage(stuff_on_offer) || "<em>nothing</em>";
    let ask = this.wishListToImage(stuff_in_return) || "<em>nothing</em>";

    let html = `<div class="pbtrade">
                  <div class="flexline">Offers <span class="tip highlight">${offer}</span> for <span class="tip highlight">${ask}</span></div>`;

    if (this.game.state.canTrade) {
      html += `<ul class="flexline">
                <li class="pboption" id="accept">✔</li>
                <li class="pboption" id="reject">✘</li>
              </ul>`;
    }
    html += "</div>";

    this.playerbox.refreshLog(html, offering_player);

    let selector = "#player-box-" + this.playerbox.playerBox(offering_player);

    $(`${selector} .pboption`).off();
    $(`${selector} .pboption`).on("click", function () {
      //
      settlers_self.playerbox.refreshLog("", offering_player);
      //
      let choice = $(this).attr("id");
      if (choice == "accept") {
        settlers_self.game.state.ads[offering_player - 1].offer = null;
        settlers_self.game.state.ads[offering_player - 1].ask = null;
        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
        settlers_self.addMove(
          "accept_offer\t" +
            settlers_self.game.player +
            "\t" +
            offering_player +
            "\t" +
            JSON.stringify(stuff_on_offer) +
            "\t" +
            JSON.stringify(stuff_in_return)
        );
        settlers_self.endTurn();
      }
      if (choice == "reject") {
        settlers_self.game.state.ads[offering_player - 1].ad = true;
        settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${offering_player}`);
        settlers_self.endTurn();
      }
    });
  }

  displayBoard() {
    console.log("Draw board");
    $(".road.empty").remove();
    for (let i in this.game.state.hexes) {
      let divname = "#hex_bg_" + i;
      $(divname).html(`<img class="hex_img2" src="${this.game.state.hexes[i].img}">`);
      if (this.game.state.hexes[i].resource != this.returnNullResource()) {
        let svid = this.addSectorValueToGameboard(i, this.game.state.hexes[i].value);
        if (this.game.state.hexes[i].robber) document.getElementById(svid).classList.add("bandit");
      }
    }

    for (let i in this.game.state.cities) {
      let divname = "#" + this.game.state.cities[i].slot;
      let classname = "p" + this.game.colors[this.game.state.cities[i].player - 1];
      $(divname).addClass(classname);
      $(divname).removeClass("empty");

      if (this.game.state.cities[i].level == 1) {
        $(divname).html(this.c1.svg);
      } else {
        /* == 2*/
        $(divname).html(this.c2.svg);
      }
      $(divname).addClass(classname);

      let ad = this.returnAdjacentCitySlots(this.game.state.cities[i].slot);
      for (let i = 0; i < ad.length; i++) {
        let d = "#" + ad[i];
        try {
          $(d).remove();
        } catch (err) {}
      }
    }

    for (let i in this.game.state.roads) {
      //Not the most efficient, but should work to both draw the built roads and prep the available spaces for future building
      this.buildRoad(this.game.state.roads[i].player, this.game.state.roads[i].slot);
    }

    this.displayPlayers();
  }

  displayScore() {
    let track_vp = [];
    for (let i = 0; i < this.game.state.players.length; i++) {
      let score = 0;
      //Count towns and cities
      for (let j = 0; j < this.game.state.cities.length; j++) {
        if (this.game.state.cities[j].player === i + 1) {
          //Player Number, not array index
          score += this.game.state.cities[j].level;
        }
      }

      //Update Longest Road
      if (this.game.state.longestRoad.player == i + 1) {
        score += 2;
      }
      //Update Largest Army
      if (this.game.state.largestArmy.player == i + 1) {
        score += 2;
      }
      //Count (played) Victory Points
      score += this.game.state.players[i].vpc;

      //
      // and render to screen
      //
      track_vp.push(this.game.state.players[i].vp);

      //Save Score
      this.game.state.players[i].vp = score;

      //Check for winner
      if (score >= this.game.options.game_length) {
        this.game.queue.push(`winner\t${i}`);
      }
    }

    for (let i = 0; i < this.game.state.players.length; i++) {
      if (this.game.state.players[i].vp > track_vp[i]) {
        this.scoreboard.render();
        this.scoreboard.lock();
      }
    }
  }

  displayCardfan(deck = "") {
    try {
      let usingDev = false;
      let cards = "";
      if (deck == "resource" || deck == "") {
        for (let r of this.game.state.players[this.game.player - 1].resources) {
          //Show all cards
          cards += `<div class="card tip"><img src="${this.returnCardImage(r)}">
                    </div>`;
        }
      }
      if (deck == "cards" || cards == "") {
        //Dev Cards
        usingDev = true;
        for (let x = 0; x < this.game.deck[0].hand.length; x++) {
          let card = this.game.deck[0].cards[this.game.deck[0].hand[x]];
          console.log("card ////////////////");
          console.log(card);
          cards += `<div class="card tip"><img src="${card.img}">
                    <div class="cardtitle">${card.card}</div>
                    <div class="cardrules">${this.rules[card.action]}</div>
                    <div class="tiptext">${card.card}: ${this.rules[card.action]}</div>
                    </div>`;
        }
      }
      this.cardfan.render(cards);

      if (usingDev) {
        this.cardfan.addClass("staggered-hand");
        this.cardfan.removeClass("bighand");
      } else {
        this.cardfan.addClass("bighand");
        this.cardfan.removeClass("staggered-hand");
      }
    } catch (err) {
      //console.log(err);
    }
  }

  // Only for the game Observer
  showPlayerResources() {
    $(".player-box-graphic .hand").remove();
    for (let i = 0; i < this.game.players.length; i++) {
      let hand = `<div class="hand">`;
      for (let r of this.game.state.players[i].resources) {
        hand += `<div class="card">
                  <img src="${this.returnCardImage(r)}">
                  <img class="icon" src="${this.returnCardImage(r)}"/>
                </div>`;
      }
      hand += "</div>";

      this.playerbox.appendGraphic(hand, i + 1);
    }
  }

  displayPlayers() {
    try {
      this.displayScore();

      if (!this.browser_active) {
        return;
      }

      let card_dir = "/settlers/img/cards/";
      for (let i = 1; i <= this.game.state.players.length; i++) {
        //
        // player vp achievements
        //

        let statshtml = `<div class="achievements">`;
        //Victory Point Card Tokens -- should move to VP track
        statshtml += `<div class="victory_point_cards">`;
        for (let j = 0; j < this.game.state.players[i - 1].vpc; j++) {
          statshtml += `<div class="victory_point_card">${this.vp.img}</div>`;
        }
        if (this.game.state.players[i - 1].vpc > 0) {
          statshtml += `<div class="victory_point_card_points vproundel">${this.game.state.players[i - 1].vpc}</div>`
        }
        statshtml += `</div>`;
        if (this.game.state.largestArmy.player == i) {
          statshtml += `<div class="token army largest" title="${this.largest.name}">`;
        } else {
          statshtml += `<div class="token army" title="${this.largest.name}">`;
        }
        for (let j = 0; j < this.game.state.players[i - 1].knights; j++) {
          statshtml += this.s.img;
        }
        if (this.game.state.largestArmy.player == i) {
          statshtml += `<div class="army_knights vproundel">2</div>`
        }
        statshtml += `</div>`;

        if (this.game.state.longestRoad.player == i) {
          statshtml += `<div class="token longest-road" title="${this.longest.name}">${this.longest.svg}`
          statshtml += `<div class="army_knights vproundel">2</div>`
          statshtml += `</div>`;
          }
        statshtml += `</div>`;

        //
        // TOP - player info
        //
        this.game.state.players[i - 1].resources.sort();
        let num_resources = this.game.state.players[i - 1].resources.length;
        let num_cards = this.game.state.players[i - 1].devcards;
        let userline = "";
        userline += `<div class="flexline">`;
        userline += `
                <div class="cardct">
                   resources: ${this.game.state.players[i - 1].resources.length},
                   cards: ${this.game.state.players[i - 1].devcards}
                </div></div>`;
        //userline += `${statshtml}</div>`;

        let playerHTML = `
              <div class="saito-user settlers-user saito-user-${
                this.game.players[i - 1]
              }" id="saito-user-${this.game.players[i - 1]}" data-id="${this.game.players[i - 1]}">
                <div class="saito-identicon-box"><img class="saito-identicon" src="${this.app.keychain.returnIdenticon(
                  this.game.players[i - 1]
                )}"></div>
                <div class="saito-player-line">
                  <div class="saito-address saito-playername" data-id="${
                    this.game.players[i - 1]
                  }">${this.game.playerNames[i - 1]}</div>
                  <div class="saito-userline">${userline}</div>
                </div>
                ${statshtml}
              </div>
            `;

        this.playerbox.refreshTitle(playerHTML, i);

        //
        // TOP - trade offers
        //
        let reshtml = "";
        reshtml += `<div class="flexline">`;
        if (this.game.state.ads[i - 1].offer || this.game.state.ads[i - 1].ask) {
          reshtml += "<span>";
          if (this.game.state.ads[i - 1].offer) {
            reshtml += this.wishListToImage(this.game.state.ads[i - 1].offer);
          }
          reshtml += `<i class="fas fa-long-arrow-alt-right"></i>`;
          if (this.game.state.ads[i - 1].ask) {
            reshtml += this.wishListToImage(this.game.state.ads[i - 1].ask);
          }
          reshtml += `</span><i id="cleartrade" class="fas fa-ban"></i>`;
        } else {
          //reshtml += `<span id="tradenow">Trade</span>`;
        }
        reshtml += `</div>`;
        // flexline has border bottom, so hide if unneeded
        if (reshtml === '<div class="flexline"></div>') {
          reshtml = "";
        }

        this.playerbox.refreshLog(reshtml, i);
        $(".player-box-info").disableSelection();
        //Other player ads... in LOG
        if (this.game.player != i) {
          if (this.game.state.ads[i - 1].offer || this.game.state.ads[i - 1].ask) {
            if (this.game.state.ads[i - 1].ad) {
              let offer = this.wishListToImage(this.game.state.ads[i - 1].offer);
              let ask = this.wishListToImage(this.game.state.ads[i - 1].ask);
              let id = `trade_${i}`;
              let html = `<div class="trade flexline" id="${id}">`;
              if (ask) {
                html += `<span>Wants:</span><span class="tip">${ask}</span>`;
              }
              if (offer) {
                html += `<span>Has:</span><span class="tip">${offer}</span></div>`;
              }
              this.playerbox.refreshLog(html, i);
              id = "#" + id;
              $(id).off();
              $(id).on("click", function () {
                //  Launch overlay window for private trade
                settlers_self.showTradeOverlay(
                  i,
                  settlers_self.game.state.ads[i - 1].ask,
                  settlers_self.game.state.ads[i - 1].offer,
                  i
                );
              });
            } else {
              this.renderTradeOfferInPlayerBox(
                i,
                this.game.state.ads[i - 1].offer,
                this.game.state.ads[i - 1].ask
              );
            }
          } else {
            this.playerbox.refreshLog("", i);
          }
        }
      }

      if (this.game.player == 0) {
        this.showPlayerResources();
        return;
      }

      let settlers_self = this;
      $("#cleartrade").off();
      $("#cleartrade").on("click", function () {
        settlers_self.clearAdvert();
      });
      $(".player-box.me").off();
      $(".player-box.me").on("click", function () {
        settlers_self.showResourceOverlay();
      });
      //$("#tradenow").off();
      //$("#tradenow").on("click", function(){
      //  settlers_self.showResourceOverlay();
      //});

      this.cardbox.attachCardEvents();

      //Show player cards and add events (Doesn't need to be in for loop!)
      if (this.boughtCard) {
        this.displayCardfan("cards"); //Only shows this player's
        this.boughtCard = false;
      } else {
        this.displayCardfan();
      }
      this.addEventsToHand();
    } catch (e) {
      console.log("error in displayPlayers(): " + e);
    }
  }

  /*<><><><><><><>
  Broadcast offer to trade to all players
  This just makes an advertisement accessible through game menu to any player at any time (even if not eligible to trade)
  and there is no game mechanic to go directly into accepting or rejecting the trade
  @param tradeType (integer) the player number of the targeted player, 0 for all players, -1 for advertisement
  */
  showTradeOverlay(
    tradeType = -1,
    i_should_give = null,
    i_should_accept = null,
    offering_player = null
  ) {
    let settlers_self = this;

    if (i_should_accept) {
      settlers_self.trade_overlay.get = i_should_accept;
    }
    if (i_should_give) {
      settlers_self.trade_overlay.give = i_should_give;
    }
    if (offering_player) {
      settlers_self.trade_overlay.offering_player = offering_player;
    }
    settlers_self.trade_overlay.render(tradeType, false); // don't reset, we want to start with this trade
    return;
  }

  /*
  Alternate UI for advertizing your wants and needs
  */
  showResourceOverlay() {
    this.trade_overlay.render();
    return;
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
    this.updateLog(`${this.game.playerNames[player - 1]} ${msg}`);
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
    $(".sector_value:not(.bandit)").attr("style", "");
    let divname = ".sv" + roll + ":not(.bandit)";
    $(divname)
      .addClass("rolled")
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
}

module.exports = SettlersDisplay;
