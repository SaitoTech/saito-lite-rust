

	importCard(key, card) {
		let game_self = this;

		let c = {
			key,
			name: "Unnamed",
			color: "*",
			cost: [],
			power: 0,
			toughness: 0,
			text: "This card has not provided text",
			img: "/img/cards/sample.png",
		};

		c = Object.assign(c, card);

		//
		// add dummy events that return 0 (do nothing)
		//
		if (!c.onInstant) {
			c.onInstant = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onEnterBattlefield) {
			c.onEnterBattlefield = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onCostAdjustment) {
			c.onCostAdjustment = function (game_self, player, card) {
				return 0;
			};
		}

		game_self.card_library[c.key] = c;
	}


	insertCardSlot(player, destination) {
		let base_id = `p${player}-card-`;

		let max = 0;
		let existing_cards = document.getElementsByClassName("cardslot");
		for (let div of existing_cards){
			if (div.id.includes(base_id)){
				let temp = parseInt(div.id.replace(base_id, ""));
				if (temp > max) {
					max = temp;
				}
			}
		}
		max++;

		base_id += max;

		this.app.browser.addElementToSelector(`<div class="cardslot" id="${base_id}"></div>`, destination);
		
		return base_id;
	}

	moveCard(source_id, destination) {
		
		console.log("Card at: ", source_id);
		console.log("Move card to: ", destination);


		this.moveGameElement(this.copyGameElement(`#${source_id} img`), 
													destination, 
													{insert: 1, resize: 1},
													()=> { 
														$(".animated_elem").remove(); 
														$("#"+source_id).remove(); 
														if (destination === ".graveyard") {
															$(".graveyard").children().fadeOut();
														}
													}
													);
	
	}

	addCard(card_id, destination) {
		console.log("Adding opponent's card to:", destination);

		let destObj = document.getElementById(destination) || document.querySelector(destination);

		this.moveGameElement(this.createGameElement(`<img src="${this.card_library[card_id].img}" id="${card_id}" class="cardimg" />`, ".opponent_hand", ".status-cardbox .hud-card"), 
				destObj, {resize: 1, insert: 1}, ()=> { $(".animated_elem").remove();});	

		//"#summoning_stack > div:last-child"
	}


	displayBoard() {
		let game_self = this;

		$("#summoning_stack").html("");
		for (let summoned_card of this.game.state.summoning_stack){
			this.app.browser.addElementToSelector(this.cardToHTML(summoned_card.key, summoned_card.uuid), "#summoning_stack");
		}

	}


	//
	// this controls the display of the card
	//
	cardToHTML(cardkey, uuid, tapped = false) {
		let card = this.card_library[cardkey];
		
		return `
      <div class="cardslot ${(tapped)?"tapped":""}" id="${uuid}">
        <img src="${card.img}" class="cardimg" id="${cardkey}"/>
      </div>
    `;
	}

