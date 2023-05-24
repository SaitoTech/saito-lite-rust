
class SettlersState {

	initializeTheme(option = "classic"){

		this.empty = false;
		this.c1 = {name: "village", svg:`<img src="/settlers/img/icons/village.png"/>`};
		this.c2 = {name: "city", svg:`<img src="/settlers/img/icons/city.png"/>`};
		this.r = {name: "road", svg:`<img src="/settlers/img/icons/road.png"/>`};
		this.b = {name: "bandit", svg:`<img src="/settlers/img/icons/bandit.png"/>`};
		this.s = {name: "knight", img:`<img src="/settlers/img/icons/knight.png"/>`};
		this.t = {name: "bank"};
		this.vp = {name: "VP", img:`<img src="/settlers/img/icons/point_card.png"/>`};
		this.longest = {name: "Longest Road", svg:`<img src="/settlers/img/icons/road.png"/>`};
		this.largest = {name:"Largest Army", img:`<img src="/settlers/img/icons/knight.png"/>`};
		this.resources = [
						  {name: "brick",count:3,ict:3,icon:"/settlers/img/icons/brick-icon.png"},
						  {name: "wood",count:4,ict:3,icon:"/settlers/img/icons/wood-icon.png"},
						  {name: "wheat",count:4,ict:3,icon:"/settlers/img/icons/wheat-icon.png"},
						  {name: "wool",count:4,ict:3,icon:"/settlers/img/icons/wool-icon.png"},
						  {name: "ore",count:3,ict:3,icon:"/settlers/img/icons/ore-icon.png"},
						  {name: "desert",count:1,ict:1}
		];

		// Order is IMPORTANT
		this.priceList = [["brick","wood"],["brick","wood","wheat","wool"],["ore","ore", "ore","wheat","wheat"],["ore","wool","wheat"]];
		this.cardDir = "/settlers/img/cards/";
		this.back = "/settlers/img/cards/red_back.png"; //Hidden Resource cards 
		this.card = {name: "development", back: "/settlers/img/cards/red_back.png"};
		this.deck = [
						{ card : "Knight",count:14, img: "/settlers/img/cards/knight.png", action:1},
						{ card : "Unexpected Bounty" ,count:2, img : "/settlers/img/cards/treasure.png" , action : 2 },
						{ card : "Legal Monopoly" , count:2, img : "/settlers/img/cards/scroll.png" , action : 3 },
						{ card : "Caravan" , count:2, img : "/settlers/img/cards/wagon.png" , action : 4},
						{ card : "Brewery" , count:1, img : "/settlers/img/cards/drinking.png", action: 0 },
						{ card : "Bazaar" , count:1, img : "/settlers/img/cards/shop.png", action: 0 },
						{ card : "Advanced Industry" , count:1, img : "/settlers/img/cards/windmill.png", action: 0 },
						{ card : "Cathedral" , count:1, img : "/settlers/img/cards/church.png", action: 0 },
						{ card : "Chemistry" , count:1, img : "/settlers/img/cards/potion.png", action: 0 }
		];
		this.gametitle = "Settlers of Saitoa";
		this.winState = "elected governor";		

		this.rules = [
			`Gain 1 ${this.vp.name}.`,
			`Move the ${this.b.name} to a tile of your choosing`,
			`Gain any two resources`,
			`Collect all cards of a resource from the other players`,
			`Build 2 ${this.r.name}s`
		];
	}


	returnResources() {
		let newArray = [];
		for (let i of this.resources){
			if (i.count>1)
				newArray.push(i.name);
		}
		return newArray;
	}


	//
	// this should be returnCardImage, and the other function should be renamed somehow -- return resource image?
	//
  	returnResourceHTML(resource){
    		return `<div class="tip"><img class="icon" src="${this.returnCardImage(resource)}" /></div>`;
  	}



	returnCardImage(res) {
		for (let i of this.resources){
			if (i.name == res){
				if (i.card) {
				  return i.card;
				} else {
				  return `${this.cardDir}${res}.png`;
				}
			}

		}
		return null;	
	}


	returnHexes() {
		let hexes = [];
    		for (let i of this.resources){
    			for (let j = 0; j < i.count; j++){
    				if (i.tile) hexes.push({resource:i.name,img: i.tile});
    				else hexes.push({resource:i.name, img: this.randomizeTileImage(i)});
    			}

    		}
	    	return hexes;
	}

	returnDevelopmentCards(option){
		let deck = [];
		for (let i of this.deck){
    			for (let j = 0; j < i.count; j++){
    				deck.push(i);
    			}
	 	}
		return deck;
	}


	returnPortIcon(res){
		if (res === "any"){
			return `<img class="icon" src="/settlers/img/icons/any-port.png">`;
		}
		for (let i of this.resources){
			if (i.name == res){
				if (i.icon){
					return `<img class="icon" src="${i.icon.replace('-icon','-port')}">`;
				}
			}
		}
		return `2:1 ${this.resourceIcon(res)}`;	
	}


	returnNullResource(){
	   	for (let i of this.resources) {
	   		if (i.count==1) {
	   			return i.name;
	   		}
	   	}
	}

	isActionCard(cardname){
		for (let c of this.deck){
			if (cardname == c.card && c.action > 0) {
				return true;
			}
		}
		return false;
	}



	randomizeTileImage(resObj){
		let tileDir = "/settlers/img/sectors/";
		let x = Math.ceil(Math.random()*resObj.ict); 
		return tileDir+resObj.name+x+".png";
	}



  	returnDiceTokens() {
    		let dice = [];
    		dice.push({ value: 2 });
    		dice.push({ value: 12 });
    		for (let i = 3; i < 7; i++) {
    		    dice.push({ value: i });
    		    dice.push({ value: i });
    		    dice.push({ value: i + 5 });
    		    dice.push({ value: i + 5 });
    		}
    		return dice;
  	}



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
            let resources = this.returnResources();
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
                        <div class="ship hexTileCenter">${this.returnPortIcon(port)}</div>
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
