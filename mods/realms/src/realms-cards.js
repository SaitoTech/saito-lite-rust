
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
            type: Instant,
            color: "red",
            cost: ['*','*','red'],
            text: <p>Pick one of the following:<br/><li>Magic cube inflicts 3 damage to a creature of your choosing.<br/></li><li>Destroy a Relic of your choosing.</li></p>,
            lore: <p><i>One by one, the pretenders crumbled into rubble and dust.</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/001-magic-cube%20v3.png,
            };

        deck['r002'] 	= { 
            name: "Unwavering Lighting", 
            type: Instant,
            color: "red",
            cost: ['*','*','*','*','*','red'],
            text: <p>Unwavering Lighting inflicts 5 damage to a creature of your choosing and 2 damage to its Master.The creature is banished, not destroyed, if it cannot endured the attack.</p> ,
            lore: <p><i>Begone, lichling. And give your master my regards.</i></p> ,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/002-unwavering-lighting.png,
            };

        deck['r003'] 	= { 
            name: "Unformed Assassin", 
            type: Creature-Human Rogue,
            color: "red",
            cost: ['*','*','*','*','red'],
            power: 4,
            toughness: 3,
            properties: ['Swiftness'],
            text: <p>Swiftness - When Unformed Assassin attacks alonside exactly 1 creature on the same turn, it will copy that creature's strength and endurance becomes 4/3 for the rest of the turn.</p>,
            lore: <p><i><q>I like your style. Mind if I take it?</q></i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/003-unformed-assassin.png,
            };

        deck['r004'] 	= { 
            name: "Restless Flameband", 
            type: Creature-Orc Berserker,
            color: "red",
            cost: ['*','*','*','*','*','red'],
            power: 5,
            toughness: 4,
            properties: ['Crush'],
            text: <p>Crush - Restless Flameband joins the fray with a +1/+1 counter on it if an opponent has received damage this turn.</p>,
            lore: <p><i>The flamebands only ever agree to do one thing: kill.</i></p>
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/004-restless-flameband.png,
            };

        deck['r005'] 	= { 
            name: "Thisty Palemane", 
            type: Creature-Kobold,
            color: "red",
            cost: ['*','*','red'],
            power: 5,
            toughness: 4,
            properties: ['Crush'],
            text: <p>3'red': Chose a creature. That creature can't block this turn.</p>,
            lore: <p><i><q>It won't hurt when they bleed you dry. But it won't be quick, either.<q/></br> - Oswyn Adal, monster hunter"</i></p>	,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/005-thirsty-palemane.png,
            };

        deck['r006'] 	= { 
            name: "Tempest Ravager", 
            type: Creature-Spirit,
            color: "red",
            cost: ['*','*','red'],
            power: 3,
            toughness: 3,
            properties: ['Swiftness'],
            text: <p>Swiftness- Each time Tempest Ravager attacks, add +1/+1 to a creature under your command. Then Tempest Ravager deals damage to each opponent by the same number of modified creatures you control other than itself.(Equipment, Auras and counters are all valid modifications.)</p>	,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/006-tempest-ravager.png,

        }

        deck['r007'] 	= { 
            name: "Outcast Palemane", 
            type: Creature-Kobold Warrior
            color: "red",
            cost: ['*','red'],
            power: 1,
            toughness: 1,
            properties: ['Crush'],
            text: <p>As long as Outcast Palemane is attacking, it has Initiative. 2'red': Outcast Palemane gains +2/+0 for the rest of the turn.</p>	,
            lore: <p><i>Hunger and hatred embodied. It's a small body, though.</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/007-outcast-palemane.png,
            };

         deck['volcano'] 		= { 
            name: "Volcano", 
            type: Land,
            color: "red",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/037-volcano.png,
            }
         deck['Duskwood Edge'] 		= { 
            name: "Duskwood Edge", 
            type: Land,
            color: "red"&&"green"",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/036-duskwood-edge.png,
            }

         deck['g001'] 	= { 
                name: "Leshy", 
                type: Creature-Fungus,
                color: "green",
                cost: ['*','green'],
                power: 2,
                toughness: 1,
                properties: [],
                text: <p>If you control a permanent with a Soul value of 4 or higher, Leshy enters the fray with a +1/+1 counter.<br/>Every time you conjure a spell with a Soul value of 4 or higher, give a +1/+1 counter to Leshy."</p>	,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/008-leshy.png,
                };
                
         deck['g002'] 	= { 
                name: "Dormant Predator", 
                type: Creature-Treant Spirit,
                color: "green",
                cost: ['*','*','*','*','*','green','green'],
                power: 6,
                toughness: 6,
                properties: [],
                text: <p>As Dormant Predator joins the fray, your life increases by the same amount as the highest endurance among the creatures you have fielded.</p>	,
                lore: <p><i>All the fury of the forest, fixed with a knowing mind and a hunger to grow.</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/009-dormant-predator.png,
                };
                
        deck['g003'] 	= { 
                name: "Dormant Wacher", 
                type: Creature-Treant
                color: "green",
                cost: ['*','*','*','green'],
                power: 2,
                toughness: 3,
                properties: ['Grasp'],
                text: <p>Grasp - If Dormant Watcher blocks a creature with flight, add +2/+0 to Dormant Watcher until end of turn.</p> ,
                lore: <p><i>The more of mankind it saw, the more there was to hate.</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/010-dormant-watcher.png,
                };
    
         deck['g004'] 	= { 
                name: "Forest Dreamcatcher"  
                type: Enchatment,
                color: "green",
                cost: ['*','*','*','*','*','red'],
                text: <p>At the start of the batlte, during your turn, pick one of the following —<br/>
                        • Creatures under your command gain +1/+1 and the Crush effect.<br/>
                        • A domain of your choosing gains ""Flip: Add 'green'green'green"" for the rest of the turn.<br/>
                        • If you have fielded a creature with 3 strength or higher, draw a card.<br/>
                        • Your Lifeforce increases bt 3.</p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/011-forest-dreamcatcher.png,
                };
    
        deck['g005'] 	= { 
                name: "Deadwood Ranger", 
                type: Creature-Human Scout,
                color: "green",
                cost: ['*','*','green'],
                power: 1,
                toughness: 1,
                properties: [],
                text: <p>As Deadwood Ranger joins the fray, add a +1/+1 counter to a creature of your choosing.</p>,
                lore: <p><i><q>Come on, Risst. We'll follow this path to the end.</q><br/> -Oswyn Adal, monster hunter</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/012-deadwood-ranger.png,
                };
                
                
        deck['g006'] 	= { 
                name: "Dormant Sleeper", 
                type: Creature-Treant,
                color: "green",
                cost: ['*','*','*','green'],
                power: 4,
                toughness: 4,
                properties: ['Wariness'],
                text: <p>Wariness- As Dormant Sleeper joins the fray, look through your compendium for a basic domain card, add it to the fray flipped, then reshuffle. Unless you control seven domains or more, Dormant Sleeper can't attack.</p> ,
                lore: <p><i>The leaves rustled softly, as if something massive slumbered just beneath the forest floor.</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/013-dormant-sleeper.png,
                };
            
        deck['g007'] 	= { 
                name: "Leshy Fruit", 
                type: Creature-Fungus,
                color: "green",
                cost: ['*','*','*','green'],
                power: 3,
                toughness: 2,
                properties: [],
                text: <p>When Leshy Fruit is killed, you may draw a card.</p> ,
                lore: <p><i>Flowers blossomed from the corpses' slack-jawed mouths, and Leshy smiled at his garden's bountiful harvest.</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/014-leshy-fruit.png,
                };
    
        deck['g008'] 	= { 
                name: "Spider's Game", 
                type: Instant,
                color: "green",
                cost: ['*','*','green'],
                properties: [],
                text: <p>A creature of your choosing gains +3/+3 and the grasp effect for the rest of the turn. Unflip that creature.</p> ,
                lore: <p><i><q>I'll help you, human. But not until I've had my fun.</q><br/> -Mother of Thousands</i></p>,
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/015-spider-game.png,
                };
    
        deck['forest'] 		= { 
                name: "Forest", 
                type: Land,
                color: "green",
                img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/034-forest.png,
                };

        deck['w001'] 	= {
			name: "Shellring Vindicator" ,
			type: Creature-Human Rogue,
			color: "white",
			cost: ['*','*','*','white']	,
			power: 3,
			toughness: 2,
			properties: ['Drain'],
			text: <p>Drain- As Shellring Vindicator joins the fray, bring back a creature with a Sould value of 2 or less from the crypt into the fray.As long as Shellring Vindicator is fielded, that creature cannot attack or block.</p>,				
				img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/016-shellring-vindicator.png,

		 };

		deck['w002'] 	= { 
			name: "Triumphant Hippogriff" , 
			type: Creature-Hippogriff,
			color: "white",
			cost: ['*','*','*','white']	,
			power: 2,
			toughness: 3,
			properties: ['Flying'],
			text: <p>Flight - Once a turn, when a creature with 2 or higher Strentgh joins the fray under your command you may draw a card.</p>,
			lore: <p><i>Hope descended on lily-white wings, just as the prophet foretold.</i></p>,
			img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/017-triumphant-hippogriff.png,
				};

        deck['w003'] 	= { 
            name: "Shellring Guard", 
            type: Creature-Human,
            color: "white",
            cost: ['*','*','white'],
            power: 1,
            toughness: 1,
            properties: [],
            text: <p>As the Shellring Guard enters the fray, give a +1/+1 counter to a creature of your choosing.</p>
            lore: <p><i><q>Scuffle breaks out? Blow the whistle. Garbage fire? Blow the whistle. Undead come crawling out from the grave? Blow that godsdamned whistle.</q><br/>-Lieutenant Felk</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/018-shellring-guard.png,	
            };

        deck['w004'] 	= { 
            name: "Shellring Official",
            type: Creature-Human,
            color: "white",
            cost: ['*','white'],
            power: 1,
            toughness: 2,
            properties: [],
            text: <p>Lookout - 4'white': Add a +1/+1 counter to Shellring Official.<br/></p>,
            lore: <p><i><q>You'll never wear the crown, heretic. Not on my watch.</q></i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/019-shellring-official.png,	
            };

        deck['w005'] 	= { 
            name: "Mastodon Rider", 
            type: Creature - Human,
            color: "white",
            cost: ['*','*','*','*','white'],
            power: 2,
            toughness: 3,
            properties: [],
            text: <p>When Mastodon Rider joins the fray or is killed, chose a creature or vessel under your command to give a +1/+1 counter to.<p/>,
            lore: <p><i><q>Find me a bigger horse.</q></br> -Pickler the Troll King</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/020-mastodon-rider.png,
            };

        deck['w006'] 	= { 
            name: "Haven Judicator",
            type: Creature-Angel,
            color: "white",
            cost: ['*','*','white'],
            power: 3,
            toughness: 2,
            properties: ['flying'],
            text: <p>Flight - When Haven Judicator joins the fray, you recover 1 life and may draw a card.</p>,
            lore: <p><i><q>To serve the righteous, and cleanse the rest.</q></br> -Judicator's Oath<i/></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/021-haven-judicator.png,
            };

        deck['w007'] 	= { 
            name: "Burned Walker", 
            type: Instant,
            color: "white",
            cost: ['*','*','*','white']	,
            text: <p>Choose an attacking creature and destroy it.</p>,
            lore: <p><i>It would take more than a few sips of water to quench Nero's thirst for revenge.</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/022-burned-walker.png,
            };

        deck['w008'] 	= { 
            name: "Trickster Spirit", 
            type: Creature-Spirit,
            color: "white",
            cost: ['*','*','*','*','*','white'],
            power: 2,
            toughness: 5,
            properties: ['flip'],
            text: <p>Order, Flip: Flip a creature.</p>,
            lore: <p><i><q>You'd offer me your soul? But there's hardly any left.</q></br> -Fanpetal, faerie courtesa</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/023-trickster-spirit.png,
            };

        deck['Steppe'] 		= { 
            name: "Steppe", 
            type: Land,
            color: "white",
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/035-steppe.png,
            };


        deck['c001'] 	= {
            name: "Hollow Battlegear", 
            type: Artifact-Vehicle,
            color: "Colorless",
            cost: ['*','*','*'],
            power: 4,
            toughness: 3,
            properties: ['Wariness'],
            text: <p>Wariness - Recruit 1 (Flip as many creatures as you like, each must at leas posses more than 1 in strength:This Vessel turns into a Relic creature until end of turn.)</p>,
            lore: <p><i><q>Make the wyrm hurt like hell if he swallows me.</q><br/>-Lydda Nightblade, to the royal armorer</i></p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/031-hollow-battlegear.png,
            };        


        deck['b001'] = { 
            name: "The Big Wave", 
            type: Sorcery,
            color: "blue",
            cost: ['*','*','*','*','blue'],
            text: <p>Each player picks a non-domain permanent under their command. Every other non-domain permanent must return to their Master's hand. After they do, you may draw a card for each opponent that had more cards in their hand than you do.</p>,
            img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/024-the-big-wave.png,
    
            };

	deck['b002'] = {
		name: "Unguided Spirit", 
		type: Creature-Spirit,
		color: "blue",
		cost:['*','*','*','blue'],
		power: 3,
		toughness: 1,
		properties: ['flying'],
		text:<><p>Flight - At the start of the battle pick one of the following:</br><li> Flip one creature.</li><li>Chose one creature, it will not flip during its Master's unflip phase.</li></p>,
		lore:<p><i><q>You'll see whatever I choose to show you. Don't get your hopes up.</q></i></p>,
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/025-unguided-spirit.png,
		
	 };
	 
	deck['b003'] 	= { 
		name: "Fake Destiny", 
		type: Instant,
		color: "blue",
		cost: ['*','blue']
		text: "<p>Send back a creature of your choosing to its Master's hand. If its Soul value is 3 or less, you get Foresight 1. (Check the first card on your compendium. You may shuffle that card to the bottom of your compendium)<p/>",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/026-fake-destiny.png,
	};

	   deck['b004'] = { 
		name: "Luminous Being", 
		type: Creature-Horror,
		color: "blue",
		cost:['*','*', '*','*','*','blue,'blue'],
		power: 7,
		toughness: 8,
		properties: ['blaze']
		text: <p>Blaze - This spell cannot be countered.</br>Every time you conjure a spell pick one of the following:<li>Return a spell outside of your command to its Master's hand.<li>Return a non-domain permanent to its Master's hand.</li></p>
		img:  https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/027-luminous-being.png,
	 };

	 deck['b005'] = { 
		name: "Symbiotic Possession", 
		type: Instant,
		color: "blue",
		cost: ['*','*','blue'],
		text: <p>Choose a creature, for the rest of the turn it becomes a 5/5 wisdom ghost.</p>,
		lore: <p><i>A simple trade. Our brains for your brawn.<br/>-Ancestral Hive Mind</i></p>,				
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/028-symbiotic-possesion.png,
	 };

	  deck['b006'] 	= { 
		name: "Lakeshire Hippogriff", 
		type: Creature-Hippogriff,
		color: "blue",
		cost: ['*','*','*','*','*','blue'],
		power: 3,
		toughness: 3,
		properties: ['flying']	['blaze']
		text: <p>Blaze<br/>Flight</p>,						
		lore: <p><i>With the dragons gone, Lakeshire's hippogriffs eagerly reclaimed their perches atop the valley's mountain peaks.</i></p> ,
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/029-lakeshire-hippogriff.png,
	 };

	    deck['b007'] 	= { 
		name: "Deformed Scarecrow", 
		type: Creature-Zombie Horror,
		color: "blue",
		cost: ['*','*','blue'],
		power: 2,
		toughness: 1,
		text: <p>When Deformed Scarecrow is killed, search through your compendium for another Deformed Scarecrow, 
		put it on your hand after showing it to your opponent and then reshuffle the deck.</p>				
		lore: <p><i><q>Anything, or anybody, can be replaced<q/></q></i></p>
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/030-deformed-scarecrow.png,
	 };

	deck["island"] = {
		name: "Island",
		type: Land,
		color: "blue",
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/033-island.png,
	};

	deck["waterfall"] = {
		name: "Waterfall Ruin",
		type: Land,
		color: ["blue", "white"],
		img: https://github.com/SaitoTech/saito-lite-rust/blob/master/mods/realms/web/img/cards/032-waterfall-ruin.png,
	};



		return deck;
	}

