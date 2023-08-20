	returnCardImage(cardname) {

	  	if (this.deck[cardname]) {
	  		return this.deck[cardname].returnCardImage();
	  	}


		return '';

	}


        importCard(key, card) {

                let game_self = this;

                let c = {
                        key		:	key,
                        name		: 	"Unnamed",
                        color		: 	"*",
                        cost		: 	[],
                        power		: 	0,
                        toughness	: 	0,
                        text		: 	"This card has not provided text",
                        img		: 	"/img/cards/sample.png",
                };
                c = Object.assign(c, card);


                //
                // add dummy events that return 0 (do nothing)
                //
		if (!c.returnCardImage) {
                	c.returnCardImage = function() {
				return `<div class="card"><img class="card cardimg" src="/realms/img/cards/016_shellring_vindicator.png"></div>`;
                	};
	        }
                if (!c.oninstant) {
                	c.oninstant = function (game_self, player, card) {
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

		
                game_self.deck[c.key] = c;

        }




	////////////////////////////////
	/// Cards and Card Functions ///
	////////////////////////////////
	returnCards() {

		var deck = {};
	deck['r001'] 	= { 
            name: "Magic Cube", 
            type: "Instant",
            color: "red",
            cost: ['*','*','red'],
            text: "Pick one of the following: Magic cube inflicts 3 damage to a creature of your choosing. Destroy a Relic of your choosing.",
            lore: "One by one, the pretenders crumbled into rubble and dust.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/001-magic-cube%20v3.png,
            };

        deck['r002'] 	= { 
            name: "Unwavering Lighting", 
            type: "Instant",
            color: "red",
            cost: ['*','*','*','*','*','red'],
            text: "Unwavering Lighting inflicts 5 damage to a creature of your choosing and 2 damage to its Master.The creature is banished, not destroyed, if it cannot endured the attack.",
            lore: "Begone, lichling. And give your master my regards.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/002-unwavering-lighting.png,
            };

        deck['r003'] 	= { 
            name: "Unformed Assassin", 
            type: "Creature - Human Rogue",
            color: "red",
            cost: ['*','*','*','*','red'],
            power: 4,
            toughness: 3,
            properties: ['Swiftness'],
            text: "Swiftness - When Unformed Assassin attacks alonside exactly 1 creature on the same turn, it will copy that creature's strength and endurance becomes 4/3 for the rest of the turn.",
            lore: "I like your style. Mind if I take it?",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/003-unformed-assassin.png,
            };

        deck['r004'] 	= { 
            name: "Restless Flameband", 
            type: "Creature - Orc Berserker",
            color: "red",
            cost: ['*','*','*','*','*','red'],
            power: 5,
            toughness: 4,
            properties: ['Crush'],
            text: "Crush - Restless Flameband joins the fray with a +1/+1 counter on it if an opponent has received damage this turn.",
            lore: "The flamebands only ever agree to do one thing: kill.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/004-restless-flameband.png,
            };

        deck['r005'] 	= { 
            name: "Thisty Palemane", 
            type: "Creature - Kobold",
            color: "red",
            cost: ['*','*','red'],
            power: 5,
            toughness: 4,
            properties: ['Crush'],
            text: "3'red': Chose a creature. That creature can't block this turn.",
            lore: "It won't hurt when they bleed you dry. But it won't be quick, either. - Oswyn Adal, monster hunter",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/005-thirsty-palemane.png,
            };

        deck['r006'] 	= { 
            name: "Tempest Ravager", 
            type: "Creature - Spirit",
            color: "red",
            cost: ['*','*','red'],
            power: 3,
            toughness: 3,
            properties: ['Swiftness'],
            text: "Swiftness- Each time Tempest Ravager attacks, add +1/+1 to a creature under your command. Then Tempest Ravager deals damage to each opponent by the same number of modified creatures you control other than itself.(Equipment, Auras and counters are all valid modifications.)",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/006-tempest-ravager.png,

        }

        deck['r007'] 	= { 
            name: "Outcast Palemane", 
            type: "Creature - Kobold Warrior",
            color: "red",
            cost: ['*','red'],
            power: 1,
            toughness: 1,
            properties: ['Crush'],
            text: "As long as Outcast Palemane is attacking, it has Initiative. 2'red': Outcast Palemane gains +2/+0 for the rest of the turn.",
            lore: "Hunger and hatred embodied. It's a small body, though.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/007-outcast-palemane.png,
            };

         deck['volcano'] 		= { 
            name: "Volcano", 
            type: "Land"",
            color: "red",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/037-volcano.png,
            }
         deck['Duskwood Edge'] 		= { 
            name: "Duskwood Edge", 
            type: "Land",
            color: "red"&&"green"",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/036-duskwood-edge.png,
            }
         deck['g001'] 	= { 
                name: "Leshy", 
                type: "Creature - Fungus",
                color: "green",
                cost: ['*','green'],
                power: 2,
                toughness: 1,
                properties: [],
                text:" If you control a permanent with a Soul value of 4 or higher, Leshy enters the fray with a +1/+1 counter. Every time you conjure a spell with a Soul value of 4 or higher, give a +1/+1 counter to Leshy",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/008-leshy.png,
                };

         deck['g002'] 	= { 
                name: "Dormant Predator", 
                type: "Creature - Treant Spirit",
                color: "green",
                cost: ['*','*','*','*','*','green','green'],
                power: 6,
                toughness: 6,
                properties: [],
                text: "As Dormant Predator joins the fray, your life increases by the same amount as the highest endurance among the creatures you have fielded."	,
                lore: "All the fury of the forest, fixed with a knowing mind and a hunger to grow.",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/009-dormant-predator.png,
                };

        deck['g003'] 	= { 
                name: "Dormant Wacher", 
                type: "Creature - Treant",
                color: "green",
                cost: ['*','*','*','green'],
                power: 2,
                toughness: 3,
                properties: ['Grasp'],
                text: "Grasp - If Dormant Watcher blocks a creature with flight, add +2/+0 to Dormant Watcher until end of turn.",
                lore: "The more of mankind it saw, the more there was to hate.",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/010-dormant-watcher.png,
                };

         deck['g004'] 	= { 
                name: "Forest Dreamcatcher"  
                type: "Enchatment",
                color: "green",
                cost: ['*','*','*','*','*','red'],
                text: "At the start of the batlte, during your turn, pick one of the following • Creatures under your command gain +1/+1 and the Crush effect.• A domain of your choosing gains Flip: Add `green`green`green`for the rest of the turn. • If you have fielded a creature with 3 strength or higher, draw a card.• Your Lifeforce increases bt 3.",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/011-forest-dreamcatcher.png,
                };

        deck['g005'] 	= { 
                name: "Deadwood Ranger", 
                type: "Creature - Human Scout",
                color: "green",
                cost: ['*','*','green'],
                power: 1,
                toughness: 1,
                properties: [],
                text: "As Deadwood Ranger joins the fray, add a +1/+1 counter to a creature of your choosing.",
                lore: "Come on, Risst. We'll follow this path to the end. -Oswyn Adal, monster hunter",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/012-deadwood-ranger.png,
                };


        deck['g006'] 	= { 
                name: "Dormant Sleeper", 
                type: "Creature - Treant",
                color: "green",
                cost: ['*','*','*','green'],
                power: 4,
                toughness: 4,
                properties: ['Wariness'],
                text: "Wariness- As Dormant Sleeper joins the fray, look through your compendium for a basic domain card, add it to the fray flipped, then reshuffle. Unless you control seven domains or more, Dormant Sleeper can't attack." ,
                lore: "The leaves rustled softly, as if something massive slumbered just beneath the forest floor.",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/013-dormant-sleeper.png,
                };

        deck['g007'] 	= { 
                name: "Leshy Fruit", 
                type: "Creature - Fungus",
                color: "green",
                cost: ['*','*','*','green'],
                power: 3,
                toughness: 2,
                properties: [],
                text: "When Leshy Fruit is killed, you may draw a card. ",
                lore:"Flowers blossomed from the corpses' slack-jawed mouths, and Leshy smiled at his garden's bountiful harvest",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/014-leshy-fruit.png,
                };

        deck['g008'] 	= { 
                name: "Spider's Game", 
                type: "Instant",
                color: "green",
                cost: ['*','*','green'],
                properties: [],
                text: "A creature of your choosing gains +3/+3 and the grasp effect for the rest of the turn. Unflip that creature.",
                lore:" I'll help you, human. But not until I've had my fun. -Mother of Thousands",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/015-spider-game.png,
                };

        deck['forest'] 		= { 
                name: "Forest", 
                type: "Land",
                color: "green",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/034-forest.png,
                };

        deck['w001'] 	= {
			name: "Shellring Vindicator" ,
			type: "Creature - Human Rogue",
			color: "white",
			cost: ['*','*','*','white']	,
			power: 3,
			toughness: 2,
			properties: ['Drain'],
			text:"Drain- As Shellring Vindicator joins the fray, bring back a creature with a Sould value of 2 or less from the crypt into the fray.As long as Shellring Vindicator is fielded, that creature cannot attack or block.",				
			img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/016-shellring-vindicator.png,

		 };

		deck['w002'] 	= { 
			name: "Triumphant Hippogriff" , 
			type: "Creature - Hippogriff",
			color: "white",
			cost: ['*','*','*','white']	,
			power: 2,
			toughness: 3,
			properties: ['Flying'],
			text: "Flight - Once a turn, when a creature with 2 or higher Strentgh joins the fray under your command you may draw a card.",
			lore: "Hope descended on lily-white wings, just as the prophet foretold.",
			img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/017-triumphant-hippogriff.png,
				};

        deck['w003'] 	= { 
            name: "Shellring Guard", 
            type: "Creature - Human",
            color: "white",
            cost: ['*','*','white'],
            power: 1,
            toughness: 1,
            properties: [],
            text: "As the Shellring Guard enters the fray, give a +1/+1 counter to a creature of your choosing.",
            lore: "Scuffle breaks out? Blow the whistle. Garbage fire? Blow the whistle. Undead come crawling out from the grave? Blow that godsdamned whistle.-Lieutenant Felk",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/018-shellring-guard.png,	
            };

        deck['w004'] 	= { 
            name: "Shellring Official",
            type: "Creature - Human",
            color: "white",
            cost: ['*','white'],
            power: 1,
            toughness: 2,
            properties: [],
            text: "Lookout - 4'white': Add a +1/+1 counter to Shellring Official.",
            lore: "You'll never wear the crown, heretic. Not on my watch.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/019-shellring-official.png,	
            };

        deck['w005'] 	= { 
            name: "Mastodon Rider", 
            type: "Creature - Human",
            color: "white",
            cost: ['*','*','*','*','white'],
            power: 2,
            toughness: 3,
            properties: [],
            text: "When Mastodon Rider joins the fray or is killed, chose a creature or vessel under your command to give a +1/+1 counter to.",
            lore: "Find me a bigger horse. -`Pickler the Troll King`",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/020-mastodon-rider.png,
            };

        deck['w006'] 	= { 
            name: "Haven Judicator",
            type: "Creature - Angel",
            color: "white",
            cost: ['*','*','white'],
            power: 3,
            toughness: 2,
            properties: ['flying'],
            text: "Flight - When Haven Judicator joins the fray, you recover 1 life and may draw a card.",
            lore: "To serve the righteous, and cleanse the rest. -Judicator's Oath",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/021-haven-judicator.png,
            };

        deck['w007'] 	= { 
            name: "Burned Walker", 
            type: "Instant",
            color: "white",
            cost: ['*','*','*','white']	,
            text: "Choose an attacking creature and destroy it.",
            lore: "It would take more than a few sips of water to quench Nero's thirst for revenge",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/022-burned-walker.png,
            };

        deck['w008'] 	= { 
            name: "Trickster Spirit", 
            type: "Creature - Spirit",
            color: "white",
            cost: ['*','*','*','*','*','white'],
            power: 2,
            toughness: 5,
            properties: ['flip'],
            text: "Order, Flip: Flip a creature",
            lore: "You'd offer me your soul? But there's hardly any left. -Fanpetal, faerie courtesa",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/023-trickster-spirit.png,
            };

        deck['Steppe'] 		= { 
            name: "Steppe", 
            type: "Land",
            color: "white",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/035-steppe.png,
            };


        deck['c001'] 	= {
            name: "Hollow Battlegear", 
            type: "Artifact - Vehicle",
            color: "Colorless",
            cost: ['*','*','*'],
            power: 4,
            toughness: 3,
            properties: ['Wariness'],
            text: "Wariness - Recruit 1 (Flip as many creatures as you like, each must at leas posses more than 1 in strength:This Vessel turns into a Relic creature until end of turn.)",
            lore: "Make the wyrm hurt like hell if he swallows me.-Lydda Nightblade, to the royal armorer",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/031-hollow-battlegear.png,
            };        


        deck['b001'] = { 
            name: "The Big Wave", 
            type: "Sorcery",
            color: "blue",
            cost: ['*','*','*','*','blue'],
            text: "Each player picks a non-domain permanent under their command. Every other non-domain permanent must return to their Master's hand. After they do, you may draw a card for each opponent that had more cards in their hand than you do.",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/024-the-big-wave.png,

            };

	deck['b002'] = {
		name: "Unguided Spirit", 
		type: "Creature - Spirit",
		color: "blue",
		cost:['*','*','*','blue'],
		power: 3,
		toughness: 1,
		properties: ['flying'],
		text: "Flight - At the start of the battle pick one of the following: Flip one creature. Chose one creature, it will not flip during its Master's unflip phase.",
		lore:" You'll see whatever I choose to show you. Don't get your hopes up.",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/025-unguided-spirit.png,

	 };

	deck['b003'] 	= { 
		name: "Fake Destiny", 
		type: "Instant",
		color: "blue",
		cost: ['*','blue'],
		text: "Send back a creature of your choosing to its Master's hand. If its Soul value is 3 or less, you get Foresight 1. (Check the first card on your compendium. You may shuffle that card to the bottom of your compendium)",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/026-fake-destiny.png,
	};

	   deck['b004'] = { 
		name: "Luminous Being", 
		type: "Creature - Horror",
		color: "blue",
		cost: ['*','*', '*','*','*','blue','blue'],
		power: 7,
		toughness: 8,
		properties: ['blaze'],
		text: "Blaze - This spell cannot be countered.</br>Every time you conjure a spell pick one of the following: *Return a spell outside of your command to its Master's hand. *Return a non-domain permanent to its Master's hand",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/027-luminous-being.png,
	 };

	 deck['b005'] = { 
		name: "Symbiotic Possession", 
		type: "Instant",
		color: "blue",
		cost: ['*','*','blue'],
		text: "Choose a creature, for the rest of the turn it becomes a 5/5 wisdom ghost",
		lore: "A simple trade. Our brains for your brawn. -Ancestral Hive Mind",				
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/028-symbiotic-possesion.png,
	 };

	  deck['b006'] 	= { 
		name: "Lakeshire Hippogriff", 
		type: "Creature - Hippogriff",
		color: "blue",
		cost: ['*','*','*','*','*','blue'],
		power: 3,
		toughness: 3,
		properties: ['flying']	['blaze']
		text: "Blaze Flight",						
		lore: "With the dragons gone, Lakeshire's hippogriffs eagerly reclaimed their perches atop the valley's mountain peaks ",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/029-lakeshire-hippogriff.png,
	 };

	    deck['b007'] 	= { 
		name: "Deformed Scarecrow", 
		type: "Creature - Zombie Horror",
		color: "blue",
		cost: ['*','*','blue'],
		power: 2,
		toughness: 1,
		text: "When Deformed Scarecrow is killed, search through your compendium for another Deformed Scarecrow, put it on your hand after showing it to your opponent and then reshuffle the deck.",			
		lore: "Anything, or anybody, can be replaced",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/030-deformed-scarecrow.png,
	 };

	deck["island"] = {
		name: "Island",
		type: "Land",
		color: "blue",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/033-island.png,
	};

	deck["waterfall"] = {
		name: "Waterfall Ruin",
		type: "Land",
		color: ["blue", "white"],
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/032-waterfall-ruin.png,
	};

		return deck;
	}

