class SettlersResources {

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

}

module.exports = SettlersResources

