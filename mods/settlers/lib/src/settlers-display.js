class SettlersDisplay {
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
      let score_change = false;

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

        //Check if there is a difference (and who went up)
        if (this.game.state.players[i].vp !== this.racetrack.players[i].score) {
          if (this.game.state.players[i].vp > this.racetrack.players[i].score) {
            score_change = i + 1;
          }
          this.racetrack.players[i].score = this.game.state.players[i].vp;
          this.racetrack.render();
          this.racetrack.lock();
        }

        //Check for winner
        if (this.game.state.players[i].vp >= this.game.options.game_length) {
          this.game.queue.push(`winner\t${i}`);
          score_change = false;
        }
      }

      if (this.game.players.length == 2 && score_change) {
        if (Math.abs(this.game.state.players[0].vp - this.game.state.players[1].vp) > 1) {
          let player = this.game.state.players[0].vp > this.game.state.players[1].vp ? 1 : 2;

          if (score_change == player) {
            // Newly entering state
            if (!this.game.state.robinhood) {
              $('.main').addClass('robinhood');
              this.game.state.robinhood = 3 - player;
              this.updateLog(
                `Robinhood will be friendly to ${this.formatPlayer(this.game.state.robinhood)}`
              );
            }

            if (!this.game.state.robinhood_overlay) {
              this.game.state.robinhood_overlay = 1;
              this.game_help.render({
                title: 'Robin Hood',
                text: 'Robin Hood is a friendly bandit (in 1v1 games) that helps the losing player, who will be immune to Robin Hood raiding their hand or blocking their resource production',
                img: '/settlers/img/robinhood_background.jpg',
                line1: 'who is',
                line2: 'robin hood?',
                id: 'robinhood',
                fontsize : "2.1rem",
                color: "#1a7004",
              });
            }

            // Only move Robinhood if bandit is threatening losing player
            if (this.game.state.threatened.includes(this.game.state.robinhood)) {
              this.card_overlay.render({ player: this.game.state.robinhood, card: 'Robin Hood' });
              this.game.queue.push(`roll_bandit\t${player}`);
            }
          }
        } else {
          if (this.game.state.robinhood) {
            this.updateLog('The bandit is neutral again');
          }
          $('.main').removeClass('robinhood');
          this.game.state.robinhood = 0;
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
                        ${this.longest.icon}
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
                    <img src="${this.back}"/>
                    <div>${num_resources}</div>
                  </div>`;
      }
      if (num_cards) {
        icons += `<div class="cardct dev-cards">
                    ${this.vp.img}
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
          let offer = this.wishListToImage(this.game.state.ads[i - 1].offer);
          let ask = this.wishListToImage(this.game.state.ads[i - 1].ask);
          let id = `trade_${i}`;
          let html = `<div class="trade" id="${id}">
            <img src="${this.back}"/>
            <i class="fa-solid fa-money-bill-transfer"></i>
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
          //this.playerbox.updateGraphics('', i);
        }
      }
    }

    if (
      this.game.deck[0].hand.length == 0 &&
      this.game.state.players[this.game.player - 1].devcards.length == 0
    ) {
      $('.controls #playcard').removeClass('enabled');
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

      if (this.game.player === offering_player) {
        this.trade_overlay.get = i_should_give;
        this.trade_overlay.give = i_should_accept;
        this.trade_overlay.accepting_trade = 0;
      } else {
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

  animateDevCard(player) {
    let destination = '#game-playerbox-' + player;

    if (player == this.game.player) {
      let elm = this.createGameElement(
        `<div class="card_holder"><img src="${this.card.back}"/></div>`,
        '#game-hexgrid',
        '.hex.dummy'
      );

      this.moveGameElement(elm, destination);
    } else {
      this.animationSequence.push({
        callback: this.moveGameElement,
        params: [
          this.createGameElement(
            `<div class="card_holder"><img src="${this.card.back}"/></div>`,
            '#game-hexgrid',
            '.hex.dummy'
          ),
          destination,
          null,
          () => {
            $('.animated_elem').remove();
            this.restartQueue();
          }
        ]
      });
      this.runAnimationQueue(250);
    }
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
      .addClass('rolled')
      .delay(600)
      .queue(function () {
        $(this).removeAttr('style').dequeue();
      });
  }

  updateStatus(str, preserve = 0) {
    try {
      if (this.lock_interface == 1) {
        return;
      }

      let update = [str, preserve];

      this.game.status = str;

      if (this.status.length > 0) {
        let last = this.status.pop();
        if (last[1]) {
          this.status.push(last);
        }
      }

      this.status.push(update);

      //Keep last three
      while (this.status.length > 3) {
        this.status.shift();
      }

      if (this.game.players.includes(this.publicKey)) {
        if (this.gameBrowserActive()) {
          let status_obj = document.querySelector('.hud-body .status');

          let complex_str = '';
          for (let ud of this.status) {
            let s = ud[0];
            if (!s.includes('<div')) {
              s = `<div class="player-notice">${s}</div>`;
            }
            complex_str += s;
          }

          //console.log(complex_str);

          status_obj.innerHTML = complex_str;
          $('.status').disableSelection();
        }
      }
    } catch (err) {
      console.error('ERR: ' + err);
    }
  }
}

module.exports = SettlersDisplay;
