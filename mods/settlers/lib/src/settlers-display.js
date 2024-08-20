class SettlersDisplay {
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
    let offer = this.wishListToImage(stuff_on_offer) || '<em>nothing</em>';
    let ask = this.wishListToImage(stuff_in_return) || '<em>nothing</em>';

    let html = `<div class="pbtrade">
                  <div class="flexline">Offers <span class="tip highlight">${offer}</span> for <span class="tip highlight">${ask}</span></div>`;

    if (this.game.state.canTrade) {
      html += `<ul class="flexline">
                <li class="pboption" id="accept">✔</li>
                <li class="pboption" id="reject">✘</li>
              </ul>`;
    }
    html += '</div>';

    this.playerbox.updateBody(html, offering_player);

    let selector = '#player-box-' + this.playerbox.playerBox(offering_player);

    $(`${selector} .pboption`).off();
    $(`${selector} .pboption`).on('click', function () {
      //
      settlers_self.playerbox.updateBody('', offering_player);
      //
      let choice = $(this).attr('id');
      if (choice == 'accept') {
        settlers_self.game.state.ads[offering_player - 1].offer = null;
        settlers_self.game.state.ads[offering_player - 1].ask = null;
        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
        settlers_self.addMove(
          'accept_offer\t' +
            settlers_self.game.player +
            '\t' +
            offering_player +
            '\t' +
            JSON.stringify(stuff_on_offer) +
            '\t' +
            JSON.stringify(stuff_in_return)
        );
        settlers_self.endTurn();
      }
      if (choice == 'reject') {
        settlers_self.game.state.ads[offering_player - 1].ad = true;
        settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${offering_player}`);
        settlers_self.endTurn();
      }
    });
  }

  displayBoard() {
    try {
      console.log('Display board');
      $('.road.empty').remove();
      for (let i in this.game.state.hexes) {
        let divname = '#hex_bg_' + i;
        $(divname).html(`<img class="hex_img2" src="${this.game.state.hexes[i].img}">`);
        if (this.game.state.hexes[i].resource != this.returnNullResource()) {
          let svid = this.addSectorValueToGameboard(i, this.game.state.hexes[i].value);
          if (this.game.state.hexes[i].robber)
            document.getElementById(svid).classList.add('bandit');
        }
      }

      for (let i in this.game.state.cities) {
        let divname = '#' + this.game.state.cities[i].slot;
        let classname = 'p' + this.game.colors[this.game.state.cities[i].player - 1];
        $(divname).addClass(classname);
        $(divname).removeClass('empty');

        if (this.game.state.cities[i].level == 1) {
          $(divname).html(this.c1.svg);
        } else {
          /* == 2*/
          $(divname).html(this.c2.svg);
        }
        $(divname).addClass(classname);

        let ad = this.returnAdjacentCitySlots(this.game.state.cities[i].slot);
        for (let i = 0; i < ad.length; i++) {
          let d = '#' + ad[i];
          try {
            $(d).remove();
          } catch (err) {
            console.error(err);
          }
        }
      }

      for (let i in this.game.state.roads) {
        //Not the most efficient, but should work to both draw the built roads and prep the available spaces for future building
        this.buildRoad(this.game.state.roads[i].player, this.game.state.roads[i].slot);
      }

      this.displayPlayers();
    } catch (err) {
      console.error(err);
    }
  }

  displayScore() {
    try {
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
          score += this.longest.value;
        }
        //Update Largest Army
        if (this.game.state.largestArmy.player == i + 1) {
          score += this.largest.value;
        }
        //Count (played) Victory Points
        score += this.game.state.players[i].vpc;

        //Save Score
        this.game.state.players[i].vp = score;

        //Check for winner
        if (score >= this.game.options.game_length) {
          this.game.queue.push(`winner\t${i}`);
        }
      }

      for (let i = 0; i < this.game.state.players.length; i++) {
        if (this.game.state.players[i].vp !== this.racetrack.players[i].score) {
          this.racetrack.players[i].score = this.game.state.players[i].vp;
          this.racetrack.render();
          this.racetrack.lock();
        }
      }

      if (this.game.players.length == 2) {
        if (Math.abs(this.game.state.players[0].vp - this.game.state.players[1].vp) > 1) {
          console.log('Robin hood');
          $('.gameboard').addClass('robinhood');
        } else {
          $('.gameboard').removeClass('robinhood');
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  displayCardfan(deck = '') {
    if (!this.gameBrowserActive()) {
      return;
    }
    try {
      let cards = '';

      for (let r of this.game.state.players[this.game.player - 1].resources) {
        //Show all cards
        cards += `<div class="card"><img src="${this.returnCardImage(r)}">
                  </div>`;
      }

      if (cards) {
        this.cardfan.render(cards);
      } else {
        this.cardfan.hide();
      }

      this.cardfan.addClass('bighand');
    } catch (err) {
      console.error(err);
    }
  }

  // Only for the game Observer
  showPlayerResources() {
    try {
      $('.player-box-graphic .hand').remove();
      for (let i = 0; i < this.game.players.length; i++) {
        let hand = `<div class="hand">`;
        for (let r of this.game.state.players[i].resources) {
          hand += `<div class="card">
                  <img src="${this.returnCardImage(r)}">
                  <img class="icon" src="${this.returnCardImage(r)}"/>
                </div>`;
        }
        hand += '</div>';

        this.playerbox.appendGraphic(hand, i + 1);
      }
    } catch (err) {
      console.error(err);
    }
  }

  formatPlayer(playerNumber) {
    return `<span class="p${this.game.colors[playerNumber - 1]}-lite display-name">${
      this.game.playerNames[playerNumber - 1]
    }</span>`;
  }

  formatResource(resource) {
    return `<div class="card tiny"><img src="${this.returnCardImage(resource)}" /></div>`;
  }

  displayPlayers() {
    this.displayScore();

    if (!this.browser_active) {
      return;
    }

    console.log('Display players');

    let card_dir = '/settlers/img/cards/';

    for (let i = 1; i <= this.game.state.players.length; i++) {
      //
      // PLAYERBOX HEAD - graphics box
      //
      let statshtml = `<div class="token">`;
      if (this.game.state.players[i - 1].vpc > 0) {
        //Victory Point Card Tokens -- should move to VP track
        for (let j = 0; j < this.game.state.players[i - 1].vpc; j++) {
          statshtml += `<div class="victory_point_card">${this.vp.img}</div>`;
        }
        statshtml += `<div class="vproundel" title="victory point card">${
          this.game.state.players[i - 1].vpc
        }</div>`;
      }

      for (let j = 0; j < this.game.state.players[i - 1].knights; j++) {
        statshtml += this.s.img;
      }
      if (this.game.state.largestArmy.player == i) {
        statshtml += `<div class="vproundel" title="${this.largest.name}">${this.largest.value}</div>`;
      }

      if (this.game.state.longestRoad.player == i) {
        statshtml += `  <div class="gap-token"></div>
                        ${this.longest.svg}
                        <div class="vproundel" title="${this.longest.name}">${this.longest.value}</div>`;
      }

      //
      // PLAYERBOX HEAD
      //
      this.game.state.players[i - 1].resources.sort();
      let num_resources = this.game.state.players[i - 1].resources.length;
      let num_cards = this.game.state.players[i - 1].devcards.length;

      if (i == this.game.player) {
        num_cards += this.game.deck[0].hand.length;
      }
      let icons = '';

      if (num_resources) {
        icons += `<div class="cardct resource-cards">
                    <img src="/settlers/img/cards/wheat_old.png"/>
                    <div>${num_resources}</div>
                  </div>`;
      }
      if (num_cards) {
        icons += `<div class="cardct dev-cards">
                    <img src="/settlers/img/cards/red_back.png"/>
                    <div>${num_cards}</div>
                  </div>`;
      }

      //this.playerbox.updateAddress(this.game.playerNames[i - 1], i);
      //this.playerbox.updateUserline(userline, i);
      this.playerbox.updateIcons(icons, i);

      //
      // PLAYERBOX BODY
      //
      this.playerbox.updateBody(statshtml, i);

      if (!this.game.over) {
        if (this.game.state.ads[i - 1].offer || this.game.state.ads[i - 1].ask) {
          if (this.game.state.ads[i - 1].ad) {
            let offer = this.wishListToImage(this.game.state.ads[i - 1].offer);
            let ask = this.wishListToImage(this.game.state.ads[i - 1].ask);
            let id = `trade_${i}`;
            let html = `<div class="trade" id="${id}">
            <img src="/settlers/img/cards/desert.png"/>
            <i class="fa-solid fa-right-left"></i>
            </div>
            `;

            this.playerbox.updateGraphics(html, i);
            id = '#' + id;
            let settlers_self = this;
            $(id).off();
            $(id).on('click', function () {
              //  Launch overlay window for private trade
              settlers_self.showTradeOverlay(
                i,
                settlers_self.game.state.ads[i - 1].ask,
                settlers_self.game.state.ads[i - 1].offer
              );
            });
          } else {
            this.renderTradeOfferInPlayerBox(
              i,
              this.game.state.ads[i - 1].offer,
              this.game.state.ads[i - 1].ask
            );
          }
        }else{
          this.playerbox.updateGraphics('', i);
        }
      }
    }

    if (document.querySelector('.hud-body .mobile .cards')) {
      if (
        this.game.deck[0].hand.length == 0 &&
        this.game.state.players[this.game.player - 1].devcards.length == 0
      ) {
        document.querySelector('.hud-body .mobile .cards').classList.add('hidden');
      } else {
        document.querySelector('.hud-body .mobile .cards').classList.remove('hidden');
      }
    }

    if (this.game.player == 0) {
      this.showPlayerResources();
      return;
    }

    //Show player cards and add events (Doesn't need to be in for loop!)
    this.displayCardfan();
  }

  /*<><><><><><><>
  Broadcast offer to trade to all players
  This just makes an advertisement accessible through game menu to any player at any time (even if not eligible to trade)
  and there is no game mechanic to go directly into accepting or rejecting the trade
  @param tradeType (integer) the player number of the targeted player, 0 for all players, -1 for advertisement
  */
  showTradeOverlay(offering_player = -1, i_should_give = null, i_should_accept = null) {

    if (offering_player) {
      this.trade_overlay.offering_player = offering_player;
    }

    if (i_should_give || i_should_accept) {

      i_should_give = i_should_give || {};
      i_should_accept = i_should_accept || {};

      if (this.game.player === offering_player){
        this.trade_overlay.get = i_should_give;
        this.trade_overlay.give = i_should_accept;
        this.trade_overlay.accepting_trade = 0;
      }else{
        this.trade_overlay.get = i_should_accept;
        this.trade_overlay.give = i_should_give;
        this.trade_overlay.accepting_trade = 1;
      }

      console.log('Consider trade offer');
      console.log(i_should_give, i_should_accept);
      this.trade_overlay.render(false); // don't reset, we want to start with this trade
    } else {
      this.trade_overlay.render();
    }
  }

  /***********
   *
   * Game animations
   *
   ***********/
  animateHarvest(player, resource, tile = null) {
    let destination;

    if (player == this.game.player) {
      if (document.getElementById('cardfan')) {
        destination = '#cardfan';
      } else {
        destination = '#hud';
      }
    } else {
      destination = '#game-playerbox-' + player;
    }

    if (tile) {
      tile = '#sector_value_' + tile;
    }

    this.animationSequence.push({
      callback: this.moveGameElement,
      params: [
        this.createGameElement(
          `<div class="card_holder"><img src="${this.returnCardImage(resource)}"/></div>`,
          tile,
          tile
        ),
        destination,
        null,
        () => {
          $('.animated_elem').remove();
          this.restartQueue();
        }
      ]
    });
  }

  /*
  Briefly animate the longest road and update log if there is a change in ownership
  */
  highlightRoad(player, road, msg) {
    this.updateLog(`${this.formatPlayer(player)} ${msg}`);
    for (let segment of road) {
      let selector = '#road_' + segment;
      let div = document.querySelector(selector);
      if (div) div.classList.add('roadhighlight');
      //else  console.log("Null selector?",selector);
    }

    let divname = '.roadhighlight';

    $(divname)
      .css('background', '#FFF')
      .delay(500)
      .queue(function () {
        $(this).removeAttr('style').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css('background', '#FFF').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr('style').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css('background', '#FFF').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr('style').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).css('background', '#FFF').dequeue();
      })
      .delay(500)
      .queue(function () {
        $(this).removeAttr('style').removeClass('roadhighlight').dequeue();
      });
  }

  /*
  Flashes tiles activated by dice roll
  */
  animateDiceRoll(roll) {
    //console.log("Dice Animated: " + roll);
    $('.rolled').removeClass('rolled');
    $('.sector_value:not(.bandit)').attr('style', '');
    let divname = '.sv' + roll + ':not(.bandit)';
    $(divname)
      .addClass('rolled')
      .css('color', '#000')
      .css('background', '#FFF6')
      .delay(600)
      .queue(function () {
        $(this).css('color', '#FFF').css('background', '#0004').dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css('color', '#000').css('background', '#FFF6').dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css('color', '#FFF').css('background', '#0004').dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css('color', '#000').css('background', '#FFF6').dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css('color', '#FFF').css('background', '#0004').dequeue();
      })
      .delay(600)
      .queue(function () {
        $(this).css('color', '#000').css('background', '#FFF6').dequeue();
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
    if (document.querySelector('.status .persistent')) {
      let nodes = document.querySelectorAll('.status .persistent');
      return `<div class="${preserveLonger ? 'persistent' : 'player-notice'}">${
        nodes[nodes.length - 1].innerHTML
      }</div>`;
    }
    return '';
  }

  updateStatus(str, hide_info = 0) {
    try {
      if (this.lock_interface == 1) {
        this.setHudHeight();
        return;
      }

      this.game.status = str;

      if (this.browser_active == 1) {
        let status_obj = document.querySelector('.hud-body .status');
        if (this.game.players.includes(this.publicKey)) {
          if (!str.includes('<')) {
            console.log('Settlers: Wrap status message --', str);
            str = `<div class="player-notice">${str}</div>`;
          }
          status_obj.innerHTML = str;
          $('.status').disableSelection();
        }
      }
      if (this.hud.user_dragged == 0) {
        this.setHudHeight();
      }
    } catch (err) {
      //console.log("ERR: " + err);
    }
  }

  //
  // this affixes HUD to bottom of screen...
  //
  setHudHeight() {
    try {
      console.log('Adjusting hud');
      let hud = document.querySelector('.hud');
      if (hud) {
        //hud.style.bottom = "24px";
        //hud.style.height = "auto";
        //hud.style.top = "unset";
      }
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = SettlersDisplay;
