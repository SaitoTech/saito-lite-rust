/*
  Functions for basic display
*/

class SettlersState {


    //
    // Award resources for dice roll
    //
    collectHarvest(value) {
        let logMsg = "";
        let notice = "";
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
                        notice += this.returnResourceHTML(resource);
                    }
                    this.game.state.players[player - 1].resources.push(resource);
                    this.game.stats.production[resource][player - 1]++;
                    //Double Resources for Upgraded City
                    if (city.level == 2) {
                        this.game.state.players[player - 1].resources.push(resource);
                        this.game.stats.production[resource][player - 1]++;
                        logMsg += " x2";
                        if (this.game.player == player) {
                            notice += this.returnResourceHTML(resource);
                        }
                    }
                    logMsg += "; ";
                }
            }
        }
        logMsg = logMsg.substr(0, logMsg.length - 2);
        if (logMsg) {
            this.updateLog(logMsg);
        } else {
            this.updateLog("No one collects any resources.");
        }
        if (notice) {
            this.updateStatus(
                `<div class="persistent alignme"><span>You acquired: </span>${notice}</div>`
            );
        }
    }

    /*
    Used to help with settlement placement, 
    returns list of all available vertices adjacent to the edges owned by a given player
    */
    returnCitySlotsAdjacentToPlayerRoads(player) {
        let adjacentVertices = [];

        //Cycle through roads to find all adjacent vertices
        for (let i = 0; i < this.game.state.roads.length; i++) {
            if (this.game.state.roads[i].player == player) {
                let slot = this.game.state.roads[i].slot.replace("road_", "");
                //console.log(this.game.state.roads[i],slot);
                for (let vertex of this.hexgrid.verticesFromEdge(slot))
                    if (!adjacentVertices.includes(vertex)) adjacentVertices.push(vertex);
            }
        }

        // Filter for available slots
        let existing_adjacent = [];
        for (let vertex of adjacentVertices) {
            let city = document.querySelector("#city_" + vertex);
            if (city && city.classList.contains("empty")) {
                existing_adjacent.push("city_" + vertex);
            }
        }
        //console.log(existing_adjacent);
        adjacent = existing_adjacent;
        return adjacent;
    }

    /*
    Used to prevent placing settlements too close together,
    for a given vertex coordinate, returns list of 2-3 adjacent vertices
    */
    returnAdjacentCitySlots(city_slot) {
        let adjacent = [];

        let vertexID = city_slot.replace("city_", "");
        for (let vertex of this.hexgrid.adjacentVertices(vertexID)) {
            adjacent.push("city_" + vertex);
        }
        //console.log("Vertex: ",city_slot," Neighbors: ",adjacent);
        return adjacent;
    }

    //
    // when 7 is rolled or Soldier Played
    // Select the target spot
    //
    playBandit() {
        this.updateStatus("Move the bandit...");
        let settlers_self = this;
        $(".sector-container").addClass("rhover");
        $(".sector-container").off();
        $(".sector-container").on("click", function () {
            $(".sector-container").off();
            $(".sector-container").removeClass("rhover");
            let slot = $(this).attr("id");

            settlers_self.addMove(
                `move_bandit\t${settlers_self.game.player}\t${slot}`
            );
            settlers_self.endTurn();
        });
        $(".bandit").removeClass("rhover");
        $(".bandit").off(); //Don't select bandit tile
    }

    //Select the person to steal from
    moveBandit(player, hexId) {
        let settlers_self = this;
        //Find adjacent cities and launch into stealing mechanism
        let thievingTargets = [];

        for (let city of this.game.state.cities) {
            if (city.neighbours.includes(hexId)) {
                if (city.player != player)
                    if (!thievingTargets.includes(city.player))
                        thievingTargets.push(city.player);
            }
        }
        if (thievingTargets.length > 0) {
            let robPlayer = (victim) => {
                let potentialLoot =
                    settlers_self.game.state.players[victim - 1].resources;
                if (potentialLoot.length > 0) {
                    let loot =
                        potentialLoot[Math.floor(Math.random() * potentialLoot.length)];
                    settlers_self.addMove(`steal_card\t${player}\t${victim}\t${loot}`);
                } else settlers_self.addMove(`steal_card\t${player}\t${victim}\tnothing`);
                settlers_self.endTurn();
            };

            if (thievingTargets.length > 1) {
                let html = '<div class="tbd">Steal from which Player: <ul>';
                for (let i = 0; i < this.game.players.length; i++) {
                    if (thievingTargets.includes(i + 1)) {
                        html += `<li class="option" id="${i + 1}">${settlers_self.game.playerNames[i]} (${settlers_self.game.state.players[i].resources.length
                            } cards)</li>`;
                    }
                }
                html += "</ul></div>";
                this.updateStatus(html, 1);

                //Select a player to steal from
                $(".option").off();
                $(".option").on("click", function () {
                    $(".option").off();
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

    /*
    Functions to generate and display the game
    */

    /*
      Set everything to zero by default
    */
    addSectorValuesToGameboard() {
        for (const i of this.hexgrid.hexes) {
            this.addSectorValueToGameboard(i, 0);
        }
    }

    addSectorValueToGameboard(hex, sector_value) {
        let selector = "hex_bg_" + hex;
        let hexobj = document.getElementById(selector);
        let svid = `sector_value_${hex}`;

        if (document.getElementById(svid)) {
            //Update Sector Value
            let temp = document.getElementById(svid);
            temp.textContent = sector_value;
            temp.classList.add("sv" + sector_value);
        } else {
            //Create Sector_value
            let sector_value_html = `
                <div class="sector-container sc${sector_value}" id="${svid}">
                    <div class="sector_value hexTileCenter sv${sector_value}" id="${svid}">${sector_value}</div>
                </div>
            `;
            let sector_value_obj = this.app.browser.htmlToElement(sector_value_html);
            if (hexobj) {
                hexobj.after(sector_value_obj);
            }
        }
        return svid;
    }

    /*
      Hardcode the position of resource ports
      Use road id + adjacent vertices for internal logic
    */
    addPortsToGameboard() {

        if (Object.keys(this.game.state.ports).length == 9) {
            //Just read the port information and call the function
            for (let p in this.game.state.ports) {
                let hex = p.substr(2);
                let dir = p[0];
                this.addPortToGameboard(hex, this.game.state.ports[p], dir);
            }
        } else {
            //Define the ports
            let resources = this.skin.resourceArray();
            let randomRoll = this.rollDice(2);
            let hexes, angles;
            if (randomRoll == 1) {
                hexes = ["1_1", "3_5", "5_4", "4_2"];
                angles = [6, 3, 3, 5];
            } else {
                hexes = ["1_2", "2_1", "5_3", "5_5"];
                angles = [1, 5, 4, 2];
            }

            for (let i = 0; i < hexes.length; i++) {
                this.addPortToGameboard(hexes[i], "any", angles[i]);
            }

            //Now do resource ports
            if (randomRoll == 1) {
                hexes = ["1_2", "2_1", "5_3", "5_5", "2_4"];
                angles = [1, 5, 4, 2, 1];
            } else {
                hexes = ["1_1", "3_5", "5_4", "4_2", "2_4"];
                angles = [6, 3, 3, 5, 1];
            }

            for (let i = 0; i < 5; i++) {
                let r = resources.splice(this.rollDice(resources.length) - 1, 1);
                this.addPortToGameboard(hexes[i], r, angles[i]);
            }
        }

    }

    addPortToGameboard(hex, port, direction) {
        let port_id = "port_" + direction + "_" + hex;

        this.game.state.ports[direction + "_" + hex] = port;

        if (!this.browser_active) { return; }

        let selector = "hex_bg_" + hex;
        let hexobj = document.getElementById(selector);
        if (!document.getElementById(port_id)) {
            let port_html = `<div class="port port${direction}" id="${port_id}">
                        <div class="ship hexTileCenter">${this.skin.portIcon(
                port
            )}</div>
                        <div class="harbor lharbor"></div>
                        <div class="harbor rharbor"></div>
                        </div>`;
            let port_obj = this.app.browser.htmlToElement(port_html);
            if (hexobj) hexobj.after(port_obj);
            //else console.log("Null selector: "+selector);
        }
    }

    /*
    Creates DOM stuctures to hold cities, 
    addCityToGameboard calculates where to (absolutely) position them
    */
    addCitiesToGameboard() {
        for (const i of this.hexgrid.hexes) {
            this.addCityToGameboard(i, 6);
            this.addCityToGameboard(i, 1);
        }
        //Right side corners
        this.addCityToGameboard("1_3", 2);
        this.addCityToGameboard("2_4", 2);
        this.addCityToGameboard("3_5", 2);
        this.addCityToGameboard("4_5", 2);
        this.addCityToGameboard("5_5", 2);

        this.addCityToGameboard("3_5", 3);
        this.addCityToGameboard("4_5", 3);
        this.addCityToGameboard("5_5", 3);

        //Left Under side
        this.addCityToGameboard("3_1", 5);
        this.addCityToGameboard("4_2", 5);
        this.addCityToGameboard("5_3", 5);
        //Bottom
        this.addCityToGameboard("5_3", 4);
        this.addCityToGameboard("5_4", 5);
        this.addCityToGameboard("5_4", 4);
        this.addCityToGameboard("5_5", 5);
        this.addCityToGameboard("5_5", 4);
    }

    /*
    Hexboard row_col indexed, city_component is point of hexagon (1 = top, 2 = upper right, ... )
    */
    addCityToGameboard(hex, city_component) {
        //let el = document.querySelector('.game-hexgrid-cities');
        //let hexobj = document.getElementById(hex);
        let city_id = "city_" + city_component + "_" + hex;

        let selector = "hex_bg_" + hex;
        let hexobj = document.getElementById(selector);
        if (!document.getElementById(city_id)) {
            let city_html = `<div class="city city${city_component} empty" id="${city_id}"></div>`;
            let city_obj = this.app.browser.htmlToElement(city_html);
            if (hexobj) hexobj.after(city_obj);
            //else console.log("Null selector: "+selector);
        }
    }


    addRoadToGameboard(hex, road_component) {
        let selector = "hex_bg_" + hex;
        let hexobj = document.getElementById(selector);
        let road_id = "road_" + road_component + "_" + hex;
        //console.log("Add road to gameboard: "+road_id);
        if (!document.getElementById(road_id)) {
            let road_html = `<div class="road road${road_component} empty" id="${road_id}"></div>`;
            let road_obj = this.app.browser.htmlToElement(road_html);
            if (hexobj) hexobj.after(road_obj);
            //else console.log("Null selector: "+selector);
        }
    }


    /*
    Every player should have in deck[2] and deck[3] the board tiles and tokens in the same order
    */
    generateMap() {
        let tileCt = 0;
        let tokenCt = 0;
        let tile, resourceName, token;
        console.log(this.game.pool, this.game.deck);
        for (let hex of this.hexgrid.hexes) {
            tile = this.game.pool[0].hand[tileCt++];
            resourceName = this.game.deck[1].cards[tile].resource;
            if (resourceName != this.skin.nullResource()) {
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
            if (resourceName == this.skin.nullResource())
                this.game.state.hexes[hex].robber = true;
            if (token) this.addSectorValueToGameboard(hex, token);
        }
    }

    /*
    Draw the board (Tiles are already in DOM), add/update sector_values, add/update built cities and roads
    */
    displayBoard() {
        console.log("Draw board");
        $(".road.empty").remove();
        /*
          Set the tile backgrounds to display resources and display sector values (dice value tokens)
        */
        for (let i in this.game.state.hexes) {
            let divname = "#hex_bg_" + i;
            $(divname).html(
                `<img class="hex_img2" src="${this.game.state.hexes[i].img}">`
            );
            if (this.game.state.hexes[i].resource != this.skin.nullResource()) {
                let svid = this.addSectorValueToGameboard(
                    i,
                    this.game.state.hexes[i].value
                );
                if (this.game.state.hexes[i].robber)
                    document.getElementById(svid).classList.add("bandit");
            }
        }

        /*
          Identify which vertices have a player settlement/city and add those to board
        */
        for (let i in this.game.state.cities) {
            let divname = "#" + this.game.state.cities[i].slot;
            let classname = "p" + this.game.colors[this.game.state.cities[i].player - 1];
            $(divname).addClass(classname);
            $(divname).removeClass("empty");

            if (this.game.state.cities[i].level == 1) {
                $(divname).html(this.skin.c1.svg);
            } else {
                /* == 2*/
                $(divname).html(this.skin.c2.svg);
            }
            $(divname).addClass(classname);

            // remove adjacent slots
            let ad = this.returnAdjacentCitySlots(this.game.state.cities[i].slot);
            for (let i = 0; i < ad.length; i++) {
                let d = "#" + ad[i];
                try {
                    $(d).remove();
                } catch (err) { }
            }
        }

        /*
        Add roads to gameboard
        */
        for (let i in this.game.state.roads) {
            //Not the most efficient, but should work to both draw the built roads and prep the available spaces for future building
            this.buildRoad(this.game.state.roads[i].player, this.game.state.roads[i].slot);
        }

        this.displayPlayers();
    }

    /*
    Work in Progress
    Check the score everytime we update players, which is with each cycle of game queue, 
    so should catch victory condition
    */
    updateScore() {
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


    /*
      @param {string} deck -- the name of the deck to render (resource || cards), if empty defaults to resource, if no resources, tries dev cards
    */
    displayCardfan(deck = "") {
        try {
            let usingDev = false;
            let cards = "";
            if (deck == "resource" || deck == "") {
                for (let r of this.game.state.players[this.game.player - 1].resources) {
                    //Show all cards
                    cards += `<div class="card tip"><img src="${this.skin.resourceCard(r)}">
                    <img class="icon" src="${this.skin.resourceIcon(r)}"/>
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
                    <div class="cardrules">${this.skin.rules[card.action]}</div>
                    <div class="tiptext">${card.card}: ${this.skin.rules[card.action]}</div>
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
                  <img src="${this.skin.resourceCard(r)}">
                  <img class="icon" src="${this.skin.resourceIcon(r)}"/>
                </div>`;
            }
            hand += "</div>";

            this.playerbox.appendGraphic(hand, i + 1);
        }
    }

    /*
      Refresh the Playerboxes with formatted information on the players
    */
    /*
      Refresh the Playerboxes with formatted information on the players
    */
    displayPlayers() {

        this.updateScore();

        if (!this.browser_active) { return; }

        let card_dir = "/settlers/img/cards/";
        for (let i = 1; i <= this.game.state.players.length; i++) {

            this.game.state.players[i - 1].resources.sort();
            let num_resources = this.game.state.players[i - 1].resources.length;
            let num_cards = this.game.state.players[i - 1].devcards;
//            let trade_offers_line = `<div class="trade-offers">your active trade offers</div>`;
//            if (i != this.game.player) { trade_offers_line = `<div class="trade-offers">their active trade offers</div>`; }
	    let userline = "";
                userline += `<div class="flexliane">`;
                userline += `<div class="cardct">resources: ${this.game.state.players[i - 1].resources.length}</div>`;
                userline += `</div>`;

            let playerHTML = `
          <div class="saito-user settlers-user saito-user-${this.game.players[i - 1]}" id="saito-user-${this.game.players[i - 1]}" data-id="${this.game.players[i - 1]}">
            <div class="saito-identicon-box"><img class="saito-identicon" src="${this.app.keychain.returnIdenticon(this.game.players[i - 1])}"></div>
            <div class="saito-address saito-playername" data-id="${this.game.players[i - 1]}">${this.game.playerNames[i - 1]}</div>
            <div class="saito-userline">${userline}</div>
          </div>`;

            this.playerbox.refreshTitle(playerHTML, i);
//            this.playerbox.refreshLog(trade_offers_line, i);

/*******
            //Stats
            let statshtml = `<div class="flexline">`;
            //Victory Point Card Tokens -- should move to VP track
            for (let j = 0; j < this.game.state.players[i - 1].vpc; j++) {
              statshtml += `<div class="token">${this.skin.vp.svg}</div>`;
            }
            if (this.game.state.largestArmy.player == i) {
                statshtml += `<div class="token army largest" title="${this.skin.largest.name}">`;
            } else {
                statshtml += `<div class="token army" title="${this.skin.largest.name}">`;
            }
            for (let j = 0; j < this.game.state.players[i - 1].knights; j++) {
              statshtml += this.skin.s.img;
            }
            statshtml += `</div>`;
             
            if (this.game.state.longestRoad.player == i) {
              statshtml += `<div class="token longest-road" title="${this.skin.longest.name}">${this.skin.longest.svg}</div>`;
            }
            statshtml += `</div>`;

	    let reshtml = "";
            //For opponents, summarize their hands numerically
            if (this.game.player != i) {
                  reshtml += `<div class="flexliane">`;
                  reshtml += `<div class="cardct">res: ${this.game.state.players[i - 1].resources.length}</div>`;
                  reshtml += `<div class="cardct">cards: ${this.game.state.players[i - 1].devcards}</div>`;
                  reshtml += `</div>`;
            } else {

                if (!this.game.state.placedCity) {
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
                        //newhtml += `<span id="tradenow">Trade</span>`;
                    }
                    reshtml += `</div>`;
                    //Interactive controls to toggle between "decks"
                    if (
                        this.game.deck[0].hand.length > 0 &&
                        this.game.state.players[i - 1].resources.length > 0
                    ) {
                        //newhtml += `<div class="flexline">`;
                        //newhtml += `<div class="cardselector" id="resource" title="Show my resources">Resources</div>`;
                        //newhtml += `<div class="cardselector" id="cards" title="Show my ${this.skin.card.name} cards">Cards</div>`;
                        //newhtml += `</div>`;
                    }
                }
            }
****/

//            this.playerbox.refreshInfo(newhtml, i);
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
                            settlers_self.showTradeOverlay(i, settlers_self.game.state.ads[i - 1].ask, settlers_self.game.state.ads[i - 1].offer);
                        });
                    } else {
                        this.renderTradeOfferInPlayerBox(i, this.game.state.ads[i - 1].offer, this.game.state.ads[i - 1].ask);
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
        $('#cleartrade').off();
        $('#cleartrade').on("click", function () {
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

        let selector =
            "#player-box-" + this.playerbox.playerBox(offering_player);

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
                    settlers_self.game.player + "\t" +
                    offering_player + "\t" +
                    JSON.stringify(stuff_on_offer) + "\t" +
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

    //Allow this player to click buttons to display resource or dev cards in their cardfan
    addEventsToHand() {
        let settlers_self = this;

        $(".cardselector").off(); //Previous events should be erased when the dom is rebuilt, but just in case...
        $(".cardselector").on("click", function () {
            settlers_self.displayCardfan($(this).attr("id"));
        });
    }

    removeEvents() {
        //console.trace("remove events");
        this.displayBoard();
        $(".cardselector").off();
        $(".trade").off();
    }

}

module.exports = SettlersState;
