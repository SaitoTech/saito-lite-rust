const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Realms extends GameTemplate {

  constructor(app) {

    super(app);

    this.app 		= app;
    this.gamename 	= "Realms";
    this.appname 	= "Realms";
    this.name 		= "Realms";
    this.description 	= "Saito Realms is a card-driven enchantment battle game";
    this.categories 	= "Games Arcade Entertainment";
    this.type     	= "Cardgame";
    this.card_img_dir 	= '/realms/img/cards';

    // graphics
    this.interface = 1;

    this.minPlayers = 2;
    this.maxPlayers = 2;

    return this;

  }


  respondTo(type) {  
    return super.respondTo(type);
  }
  

  initializeHTML(app) {

    super.initializeHTML(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addChatMenu();

    this.menu.render(app, this);

    this.log.render(app, this);

    this.cardbox.render(app, this);

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);

    this.hud.render(app, this);

  }


  initializeGame(game_id) {

    //
    // initialize some useful variables
    //
    if (this.game.status) { this.updateStatus(this.game.status); }

    //
    // import player cards
    //
    let deck1 = this.returnWhiteDeck();
    let deck2 = this.returnBlueDeck();

    //
    // initialize queue on new games
    //
    if (this.game.deck.length == 0) {

      this.game.state = this.returnState();

      this.game.queue.push("round");
      this.game.queue.push("READY");

      //First player to go, doesn't get to draw an 8th card at the beginning of their turn
      this.game.queue.push("DEAL\t1\t1\t6");
      this.game.queue.push("DEAL\t2\t2\t7");

      // encrypt and shuffle player-2 deck
      this.game.queue.push("DECKENCRYPT\t2\t2");
      this.game.queue.push("DECKENCRYPT\t2\t1");
      this.game.queue.push("DECKXOR\t2\t2");
      this.game.queue.push("DECKXOR\t2\t1");

      // encrypt and shuffle player-1 deck
      this.game.queue.push("DECKENCRYPT\t1\t2");
      this.game.queue.push("DECKENCRYPT\t1\t1");
      this.game.queue.push("DECKXOR\t1\t2");
      this.game.queue.push("DECKXOR\t1\t1");

      // import our decks
      this.game.queue.push("DECK\t1\t" + JSON.stringify(deck1));
      this.game.queue.push("DECK\t2\t" + JSON.stringify(deck2));

    }

    //
    // dynamic import 
    //
    // all cards that may be in play are imported into this.game.cards. the import process
    // adds all necessary dummy functions and variables such that the game can check to see
    //
    // if cards implement special abilities, they must be individually programmed to do so 
    // when provided.
    //
    this.game.cards = {};
    for (let key in deck1) { this.importCard(key, deck1[key], 1); }   
    for (let key in deck2) { this.importCard(key, deck2[key], 2); }     

    try {
      this.displayBoard();
      this.updateStatusAndListCards("Waiting for Opponent Move", this.game.deck[this.game.player-1].hand);
    } catch (err) {

    }
  }





  ////////////////////////////////
  /// Cards and Card Functions ///
  ////////////////////////////////
  returnBlueDeck() {

    var deck = {};

    deck['b001'] = {
			name: "Unguided Spirit", 
			type: "Creature - Spirit",
			color: "blue",
			cost: ['*','*','*','blue'],
			power: 3,
			toughness: 1,
			properties: ['flying'],
			text: `Flight - At the start of the battle pick one of the following:
							• Flip one creature.
							• Chose one creature, it will not flip during its Master's unflip phase.`,
			lore: "You'll see whatever I choose to show you. Don't get your hopes up.",
			img: this.card_img_dir + "/sample.png",
    }

	  deck['b002'] = { 
			name: "The Big Wave", 
			type: "sorcery",
			color: "blue",
			cost: ['*','*','*','*','blue'],
			text: `Each player picks a non-domain permanent under their command. 
				Every other non-domain permanent must return to their Master's hand. After they do, 
				you may draw a card for each opponent that had more cards in their hand than you do.`,
			img: this.card_img_dir + "/sample.png",
		}

	  deck['b003'] 	= { 
			name: "Fake Destiny", 
			type: "Instant",
			color: "blue",
			cost: ['*','blue'],
			text: `Send back a creature of your choosing to its Master's hand. If its Soul value is 3 or less, you get Foresight 1. 
			(Check the first card on your compendium. You may shuffle that card to the bottom of your compendium)`,
			img: this.card_img_dir + "/sample.png",
	  }

	  deck['b004'] 	= { 
			name: "Luminous Being", 
			type: "Creature - Horror",
			color: "blue",
			cost: ['*','*', '*','*','*','blue','blue'],
			power: 7,
			toughness: 8,
			properties: ['blaze'],
			text: `Blaze - This spell cannot be countered.
			Every time you conjure a spell pick one of the following:
			• Return a spell outside of your command to its Master's hand.
			• Return a non-domain permanent to its Master's hand.`	,
			img: this.card_img_dir + "/sample.png",
	  }

	  deck['b005'] 	= { 
			name: "Symbiotic Possesion",
			type: "Instant",
			color: "blue",
			cost: ['*','*','blue'],
			text: "Chose a creature, for the rest of the turn it becomes a 5/5 wisdom ghost.",
			lore: `“A simple trade. Our brains for your brawn.”
							-Ancestral Hive Mind`,
			img: this.card_img_dir + "/sample.png",
	  }

	  deck['b006'] 	= { 
			name: "Lakeshire Hippogriff", 
			type: "Creature - Hippogriff",
			color: "blue",
			cost: ['*','*','*','*','*','blue'],
			power: 3,
			toughness: 3,
			properties: ['flying', 'blaze'],
			text: `Blaze
						 Flight`,
			lore: `"With the dragons gone, Lakeshire's hippogriffs eagerly reclaimed their perches atop the valley's mountain peaks."`,
			img: this.card_img_dir + "/sample.png",
	   }

	  deck['b007'] 	= { 
			name: "Deformed Scarecrow", 
			type: "Creature - Zombie Horror",
			color: "blue",
			cost: ['*','*','blue'],
			power: 2,
			toughness: 1,
			text: `When Deformed Scarecrow is killed, search through your compendium for another Deformed Scarecrow, 
				put it on your hand after showing it to your opponent and then reshuffle the deck.`,
			lore: `"Anything, or anybody, can be replaced."`,
			img: this.card_img_dir + "/sample.png",
	  }

	  /*  deck['b003'] 	= { 
		name: "b003",
		type: "creature"	,
		color: "blue",
		cost: ['*','*','*','blue'],
		power: 3	,
		toughness: 2,
		properties: ['flying']	,
		img: this.card_img_dir + "/sample.png"		,
	    }

	    deck['b004'] 	= { 
		name: "b004",
		type: "instant",
		color: "blue",
		cost: ['*','*','blue']	,
		img: this.card_img_dir + "/sample.png",
	    }
	    deck['b005'] 		= { 
		name: "b005",
		type: "sorcery",
		color: "blue",
		cost: ['*','*','blue']	,
		img: this.card_img_dir + "/sample.png",
		onCostAdjustment: function(game_self, player, card) {
		  game_self.updateLog("UNIMPLEMENTED: card costs 1 less to cast if player controlls creature with flying.");
		  return 1;
		}	,
		onInstant: function(game_self, player, card) {
		  game_self.updateLog("UNIMPLEMENTED: draw two cards");
		  return 1;
		}
	    } 
	    deck['island1'] 		= { 
		name: "Isle",
		type: "land",
		color: "blue",
		img: this.card_img_dir + "/sample.png"
	    }
	    deck['island2'] 		= { 
		name: "Isle",
		type: "land",
		color: "blue",
		img: this.card_img_dir + "/sample.png"
	    }
	    deck['island3'] 		= { 
		name: "Isle",
		type: "land",
		color: "blue",
		img: this.card_img_dir + "/sample.png"
	    } */

    deck['island'] 		= { 
			name: "Island",
			type: "land",
			color: "blue",
			img: this.card_img_dir + "/032_waterfall_ruin.png"
    }

    deck['wr'] 		= { 
			name: "Waterfall Ruin",
			type: "land",
			color: ["blue","white"],
			img: this.card_img_dir + "/032_waterfall_ruin.png"
    }

    return deck;

  }

  returnWhiteDeck() {

    var deck = {};

    deck['w001'] 	= {
			name: "Shellring Vindicator", 
			type: "Creature - Human Rogue"	,
			color: "white",
			cost: ['*','*','*','white'],
			power: 3,
			toughness: 2,
			text: `Drain- As Shellring Vindicator joins the fray, bring back a creature with a Soul value of 2 or less from the crypt into the fray. 
			As long as Shellring Vindicator is fielded, that creature cannot attack or block.`	,
			img: this.card_img_dir + "/sample.png"
    }

    deck['w002'] 	= { 
			name: "Triumphant Hippogriff",
			type: "Creature - Hippogriff"	,
			color: "white",
			cost: ['*','*','*','white'],
			power: 2,
			toughness: 3,
			properties: ['flying'],
			text: `Flight - Once a turn, when a creature with 2 or higher Strentgh joins the fray under your command you may draw a card.`,
			lore: `"Hope descended on lily-white wings, just as the prophet foretold."`,
			img: this.card_img_dir + "/sample.png",
    }

	  deck['w003'] 	= { 
			name: "Shellring Guard"	, 
			type: "Creature - Human"	,
			color: "white",
			cost: ['*','*','white']	,
			power: 1,
			toughness: 1,
			text: "As the Shellring Guard enters the fray, give a +1/+1 counter to a creature of your choosing.",
			lore: `"Scuffle breaks out? Blow the whistle. Garbage fire? Blow the whistle. Undead come crawling out from the grave? Blow that godsdamned whistle."
				-Lieutenant Felk`,
			img: this.card_img_dir + "/sample.png",	
    }

		deck['w004'] 	= { 
			name: "Shellring Official"	, 
			type: "Creature - Human"	,
			color: "white",
			cost: ['*','white']	,
			power: 1,
			toughness: 2,
			text: "Lookout - 4 'white': Add a +1/+1 counter to Shellring Official.",
			lore: `"You'll never wear the crown, heretic. Not on my watch."`,
			img: this.card_img_dir + "/sample.png",	
    }

    deck['w005'] 	= { 
			name: "Mastodon Rider",
			type: "Creature - Human"	,
			color: "white",
			cost: ['*','*','*','*','white'],
			power: 2,
			toughness: 3,
			text: "When Mastodon Rider joins the fray or is killed, chose a creature or vessel under your command to give a +1/+1 counter to.",
			lore: `"Find me a bigger horse." -Pickler the Troll King`,
			img: this.card_img_dir + "/sample.png",
    }

    deck['w006'] 	= { 
			name: "Haven Judicator",
			type: "Creature - Angel"	,
			color: "white",
			cost: ['*','*','white']	,
			power: 3,
			toughness: 2,
			properties: ['flying'],
			text: "Flight - When Haven Judicator joins the fray, you recover 1 life and may draw a card.",
			lore: `"To serve the righteous, and cleanse the rest." -Judicator's Oath`,
			img: this.card_img_dir + "/sample.png",
    }

   deck['w007'] 	= { 
			name: "Burned Walker", 
			type: "Instant",
			color: "white",
			cost: ['*','*','*','white'],
			text: "Choose an attacking creature and destroy it.",
			lore: `"It would take more than a few sips of water to quench Nero's thirst for revenge."`,
			img: this.card_img_dir + "/sample.png",
    }

   deck['w008'] 	= { 
			name: "Trickster Spirit", 
			type: "Creature - Spirit",
			color: "white",
			cost: ['*','*','*','*','*','white'],
			power: 2,
			toughness: 5,
			properties: ['flip'],
			text: "Order, Flip: Flip a creature.",
			lore: `"You'd offer me your soul? But there's hardly any left." -Fanpetal, faerie courtesan`,
			img: this.card_img_dir + "/sample.png",
    }

  /*  deck['w004'] 	= { 
	name: "w004", 
	type: "creature",
	color: "white",
	cost: ['*','*','white']	,
	power: 2,
	toughness: 2,
	properties: ['flying']	,
	img: this.card_img_dir + "/sample.png",
    } */

   
    deck['Steppe'] 		= { 
			name: "Steppe",
			type: "land",
			color: "white",
			img: this.card_img_dir + "/sample.png",
    }

    deck['Waterfall Ruin'] 		= { 
			name: "Waterfall Ruin",
			type: "land",
			color: ["white", "blue"],
			img: this.card_img_dir + "/sample.png",
    }

  /*  deck['plains3'] 		= { 
	name: "Grasslands",
	type: "land",
	color: "white",
	img: this.card_img_dir + "/sample.png"
    }
    deck['plains4'] 		= { 
	name: "Grasslands",
	type: "land",
	color: "white",
	img: this.card_img_dir + "/sample.png"
 */
    return deck;

  }
/*
  returnRedDeck() {

    var deck = {};

    deck['r001'] 	= { 
	name: "Magic Cube",
	type: "instant",
	color: "red",
	cost: ['*','*','red']	,
	text: "Pick one of the following:
	• Magic cube inflicts 3 damage to a creature of your choosing.
	• Destroy a Relic of your choosing.",
	lore: ""One by one, the pretenders crumbled into rubble and dust."" ,
	img: this.card_img_dir + "/001_magic_cube.png",
    }

    deck['r002'] 	= { 
	name: "Unwavering Lighting", 
	type: "Instant",
	color: "red",
	cost: ['*','*','*','*','*','red'],
	text: "Unwavering Lighting inflicts 5 damage to a creature of your choosing and 2 damage to its Master. 
		The creature is banished, not destroyed, if it cannot endured the attack." ,
	lore: ""Begone, lichling. And give your master my regards."" ,
	img: this.card_img_dir + "/sample.png",
    }

    deck['r003'] 	= { 
	name: "Unformed Assassin", 
	type: "Creature - Human Rogue",
	color: "red",
	cost: ['*','*','*','*','red'],
	power: 4,
	toughness: 3,
	properties: ['Swiftness'],
	text: "Swiftness - When Unformed Assassin attacks alonside exactly 1 creature on the same turn, it will copy 
		that creature's strength and endurance becomes 4/3 for the rest of the turn."	,
	lore: ""I like your style. Mind if I take it?""		,
	img: this.card_img_dir + "/sample.png",
    }

    deck['r004'] 	= { 
	name: "Restless Flameband", 
	type: "Creature - Orc Berserker",
	color: "red",
	cost: ['*','*','*','*','*','red'],
	power: 5,
	toughness: 4,
	properties: ['Crush'],
	text: "Crush - Restless Flameband joins the fray with a +1/+1 counter on it if an opponent has received damage this turn.",
	lore: ""The flamebands only ever agree to do one thing: kill.""	,
	img: this.card_img_dir + "/sample.png",
    }

    deck['r005'] 	= { 
	name: "Thisty Palemane", 
	type: "Creature - Kobold",
	color: "red",
	cost: ['*','*','red']	,
	power: 5,
	toughness: 4,
	//properties: ['Crush'],
	text: "3'red': Chose a creature. That creature can't block this turn."	,
	lore: ""It won't hurt when they bleed you dry. But it won't be quick, either." - Oswyn Adal, monster hunter"	,
	img: this.card_img_dir + "/sample.png",
    }

    deck['r006'] 	= { 
	name: "Tempest Ravager", 
	type: "Creature - Spirit",
	color: "red",
	cost: ['*','*','red']	,
	power: 3,
	toughness: 3,
	properties: ['Swiftness'],
	text: "Swiftness- Each time Tempest Ravager attacks, add +1/+1 to a creature under your command. 
	Then Tempest Ravager deals damage to each opponent by the same number of modified creatures you control other than itself. 
	(Equipment, Auras and counters are all valid modifications.)"	,
	img: this.card_img_dir + "/sample.png",
    }

    deck['r007'] 	= { 
	name: "Outcast Palemane", 
	type: "Creature - Kobold Warrior",
	color: "red",
	cost: ['*','red']	,
	power: 1,
	toughness: 1,
	//properties: ['Crush'],
	text: ""As long as Outcast Palemane is attacking, it has Initiative. 2'red': Outcast Palemane gains +2/+0 for the rest of the turn."	,
	lore: ""Hunger and hatred embodied. It's a small body, though.""		,
	img: this.card_img_dir + "/sample.png",
    }
    deck['volcano'] 		= { 
	name: "Volcano",
	type: "land",
	color: "red",
	img: this.card_img_dir + "/sample.png"
    }
    deck['Duskwood Edge'] 		= { 
	name: "Duskwood Edge",
	type: "land",
	color: "red"&&"green"",
	img: this.card_img_dir + "/sample.png"
    }

 	return deck;

  }

returnGreenDeck() {

    var deck = {};

    deck['g001'] 	= { 
	name: "Leshy",
	type: "Creature - Fungus",
	color: "green",
	cost: ['*','green']	,
	power: 2,
	toughness: 1,
	properties: [],
	text: "If you control a permanent with a Soul value of 4 or higher, Leshy enters the fray with a +1/+1 counter.
	Every time you conjure a spell with a Soul value of 4 or higher, give a +1/+1 counter to Leshy."	,
	img: this.card_img_dir + "/008_leshy.png",
    }

  deck['g002'] 	= { 
	name: "Dormant Predator", 
	type: "Creature - Treant Spirit",
	color: "green",
	cost: ['*','*','*','*','*','green','green']		,
	power: 6,
	toughness: 6,
	properties: []	,
	text: "As Dormant Predator joins the fray, your life increases by the same amount as the highest 
		endurance among the creatures you have fielded."	,
	lore: ""All the fury of the forest, fixed with a knowing mind and a hunger to grow."",
	img: this.card_img_dir + "/sample.png",
    }

  deck['g003'] 	= { 
	name: "Dormant Wacher", 
	type: "Creature - Treant",
	color: "green",
	cost: ['*','*','*','green'],
	power: 2,
	toughness: 3,
	properties: ['Grasp']	,
	text: "Grasp - If Dormant Watcher blocks a creature with flight, add +2/+0 to Dormant Watcher until end of turn." ,
	lore: ""The more of mankind it saw, the more there was to hate."",
	img: this.card_img_dir + "/sample.png",
    }

    deck['g004'] 	= { 
	name: "Forest Dreamcatcher",
	type: "Enchatment",
	color: "green"	,
	cost: ['*','*','*','*','*','red']	,
	text: "At the start of the batlte, during your turn, pick one of the following —
	• Creatures under your command gain +1/+1 and the Crush effect.
	• A domain of your choosing gains ""Flip: Add 'green'green'green"" for the rest of the turn.
	• If you have fielded a creature with 3 strength or higher, draw a card.
	• Your Lifeforce increases bt 3.",
	img: this.card_img_dir + "/sample.png",
    }

    deck['g005'] 	= { 
	name: "Deadwood Ranger", 
	type: "Creature - Human Scout",
	color: "green",
	cost: ['*','*','green']			  		,
	power: 1,
	toughness: 1,
	properties: []	,
	text: "As Deadwood Ranger joins the fray, add a +1/+1 counter to a creature of your choosing.",
	lore: ""Come on, Risst. We'll follow this path to the end." -Oswyn Adal, monster hunter",
	img: this.card_img_dir + "/sample.png",
    }

  deck['g006'] 	= { 
	name: "Dormant Sleeper", 
	type: "Creature - Treant",
	color: "green",
	cost: ['*','*','*','green'],
	power: 4,
	toughness: 4,
	properties: ['Wariness']	,
	text: "Wariness- As Dormant Sleeper joins the fray, look through your compendium for a basic domain card, add it to the fray flipped, 
		then reshuffle. Unless you control seven domains or more, Dormant Sleeper can't attack." ,
	lore: ""The leaves rustled softly, as if something massive slumbered just beneath the forest floor."",
	img: this.card_img_dir + "/sample.png",
    }
  deck['g007'] 	= { 
	name: "Leshy Fruit", 
	type: "Creature - Fungus",
	color: "green",
	cost: ['*','*','*','green'],
	power: 3,
	toughness: 2,
	properties: []	,
	text: "When Leshy Fruit is killed, you may draw a card." ,
	lore: ""Flowers blossomed from the corpses' slack-jawed mouths, and Leshy smiled at his garden's bountiful harvest."" ,
	img: this.card_img_dir + "/sample.png",
    }

 deck['g008'] 	= { 
	name: "Spider's Game", 
	type: "Instant",
	color: "green",
	cost: ['*','*','green'],
	properties: []	,
	text: "A creature of your choosing gains +3/+3 and the grasp effect for the rest of the turn. Unflip that creature." ,
	lore: ""I'll help you, human. But not until I've had my fun.""-Mother of Thousands"" ,
	img: this.card_img_dir + "/sample.png",
    }

   
    deck['forest'] 		= { 
	name: "Forest",
	type: "land",
	color: "green",
	img: this.card_img_dir + "/sample.png"
    }
    deck['Duskwood Edge'] 		= { 
	name: "Duskwood Edge", 
	type: "land",
	color: "red"&&"green"",
	img: this.card_img_dir + "/sample.png"
    }

 	return deck;

  }

 returnColorLessDeck() {

    var deck = {};
 
deck['c001'] 	= {
	name: "Hollow Battlegear", 
	type: "Artifact - Vehicle",
	color: "Colorless"	,
	cost: ['*','*','*'] 	,
	power: 4	,
	toughness: 3,
	properties: ['Wariness']
	text: ""Wariness - Recruit 1 (Flip as many creatures as you like, each must at leas posses more than 1 in strength: 
		This Vessel turns into a Relic creature until end of turn.)"	,
	lore: ""Make the wyrm hurt like hell if he swallows me."-Lydda Nightblade, to the royal armorer"	,
	img: this.card_img_dir + "/sample.png",
    }

	return deck;
}
*/

  importCard(key, card, player) {

    let game_self = this;

    let c = {
    	key,
    	player,
    	name: "Unnamed",
    	color: "*",
    	cost: [],
    	power: 0,
    	toughness: 0,
    	text: "This card has not provided text",
    	img: "/img/cards/sample.png",
    	tapped: 0,
    };

    c = Object.assign(c, card);

    //
    // add dummy events that return 0 (do nothing)
    //
    if (!c.onInstant) 		{ c.onInstant = function(game_self, player, card) { return 0; } };
    if (!c.onEnterBattlefield) 	{ c.onEnterBattlefield = function(game_self, player, card) { return 0; } };
    if (!c.onCostAdjustment) 	{ c.onCostAdjustment = function(game_self, player, card) { return 0; } };

    c.returnElement = function(card) { return game_self.returnElement(game_self, player, c.key); }

    game_self.game.cards[c.key] = c;

  }




  handleGameLoop() {

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");

      console.log("QUEUE: " + JSON.stringify(this.game.queue));

      //
      // we never clear the "round" so that when we hit it
      // we always bounce back higher on the queue by adding
      // turns for each player.
      //
      if (mv[0] == "round") {
	      this.game.queue.push("PLAY\t2");
        this.game.queue.push("DEAL\t2\t2\t1");
	      this.game.queue.push("PLAY\t1");
        this.game.queue.push("DEAL\t1\t1\t1");
      }

      if (mv[0] === "move") {

      	let player_id = parseInt(mv[1]);
      	let cardkey = mv[2];
      	let source = mv[3];
      	let destination = mv[4];
      	let sending_player_also = 1;
      	if (mv[5] == 0) { sending_player_also = 0; }

      	if (sending_player_also == 0) {
      	  if (this.game.player != player_id) {
      	    this.moveCard(player_id, cardkey, source, destination);
      	  }
      	} else {
      	  this.moveCard(player_id, cardkey, source, destination);
      	}

      	this.displayBoard();

        this.game.queue.splice(qe, 1);

      }

      /*if (mv[0] === "play") {

        let player_to_go = parseInt(mv[1]);

      	//
      	// update board
      	//
        this.displayBoard();
        this.playerTurn();

      	//
      	// do not remove until we resolve!
      	//
        //this.game.queue.splice(qe, 1);

        return 0;

      }*/

    }
    return 1;
  }





  returnState() {

    let state = {};

    state.players = [2];
    for (let i = 0; i < 2; i++) {
      state.players[i] = {};
      state.players[i].health = 20;
    }

    state.hands = [2];
    for (let i = 0; i < 2; i++) {
      state.hands[i] = {};
      state.hands[i].cards = {};
      state.hands[i].lands = [];
      state.hands[i].creatures = [];
      state.hands[i].enchantments = [];
      state.hands[i].graveyard = [];
      state.hands[i].exhiled = [];
    }

    return state;

  }




  returnEventObjects() {

    let z = [];

    //
    // cards on the table
    //


    //
    // playable cards in my hand
    //

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    // 
    // 1 = fall through, 0 = halt game
    //
    if (obj.canEvent == null) {
      obj.canEvent = function(his_self, faction) { return 0; } // 0 means cannot event
    }
    if (obj.onEvent == null) {
      obj.onEvent = function(his_self, player) { return 1; }
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; }
    }


    //
    // functions for convenience
    //
    //if (obj.menuOptionTriggers == null) {
    //  obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOption == null) {
    //  obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOptionActivated == null) {
    //  obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    //}

    return obj;

  }




  nonPlayerTurn() {
    if (this.browser_active == 0) { return; }

    this.updateStatusAndListCards(`Opponent Turn`, this.game.deck[this.game.player-1].hand, function() {});
  }

  playerTurn() {

    if (this.browser_active == 0) { return; }

    //
    // show my hand
    //
    this.updateStatusAndListCards(`Your Turn <span id="end-turn" class="end-turn">[ or pass ]</span>`, this.game.deck[this.game.player-1].hand);

    //
    // players may click on cards in their hand
    //
    this.attachCardboxEvents((card) => {
      this.playerPlayCardFromHand(card);
    });

    //
    // players may also end their turn
    //
    document.getElementById("end-turn").onclick = (e) => {
      this.updateStatusAndListCards("Opponent Turn", this.game.deck[this.game.player-1].hand, function() {});
      this.prependMove("RESOLVE\t"+this.app.wallet.returnPublicKey());
      this.endTurn();
    }

    //
    // display board
    //
    this.displayBoard();

  }


  //
  // this moves a card from one location, such as a player's hand, to another, such as 
  // the discard or remove pile, or a location on the table, such as affixing it to 
  // another card.
  //
  moveCard(player, card, source, destination) {

		console.log(player + " -- " + card + " -- " + source + " -- " + destination);

    switch(source) {

      case "hand":
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] == card) {
	    this.game.deck[0].hand.splice(i, 1);
	    break;
	  }
	}
        break;

      case "lands":
        for (let i = 0; i < this.game.state.hands[player-1].lands.length; i++) {
	  if (this.game.state.hands[player-1].lands[i] == card) {
	    this.game.state.hands[player-1].lands.splice(i, 1);
	    break;
	  }
	}
	break;

      case "creatures":
        for (let i = 0; i < this.game.state.hands[player-1].creatures.length; i++) {
	  if (this.game.state.hands[player-1].creatures[i] == card) {
	    this.game.state.hands[player-1].creatures.splice(i, 1);
	    break;
	  }
	}
	break;

      case "sorcery":
      case "enchantments":
        for (let i = 0; i < this.game.state.hands[player-1].enchantments.length; i++) {
	  if (this.game.state.hands[player-1].enchantments[i] == card) {
	    this.game.state.hands[player-1].enchantments.splice(i, 1);
	    break;
	  }
	}
	break;

      case "graveyard":
        for (let i = 0; i < this.game.state.hands[player-1].graveyard.length; i++) {
	  if (this.game.state.hands[player-1].graveyard[i] == card) {
	    this.game.state.hands[player-1].graveyard.splice(i, 1);
	    break;
	  }
	}
	break;

      default:
    }


		console.log("pushing card onto " + destination);

    let already_exists = 0;
    switch(destination) {

      case "hand":
        already_exists = 0;
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.deck[0].hand.push(card);
	}
        break;

      case "lands":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].lands.length; i++) {
	  if (this.game.state.hands[player-1].lands[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].lands.push(card);
	}
	break;

      case "creatures":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].creatures.length; i++) {
	  if (this.game.state.hands[player-1].creatures[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].creatures.push(card);
	}
	break;

      case "sorcery":
      case "enchantments":

	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].enchantments.length; i++) {
	  if (this.game.state.hands[player-1].enchantments[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].enchantments.push(card);
	}
	break;

      case "graveyard":
	already_exists = 0;
        for (let i = 0; i < this.game.state.hands[player-1].graveyard.length; i++) {
	  if (this.game.state.hands[player-1].graveyard[i] == card) {
	    already_exists = 1;
	  }
	}
	if (already_exists == 0) { 
	  this.game.state.hands[player-1].graveyard.push(card);
	}
	break;

      default:
    }
  }

  playerPlayCardFromHand(card) {

    let c = this.game.cards[card];

    switch(c.type) {
      case "land":

	//
	// confirm player can place
	//
	if (this.game.state.has_placed_land == 1) {
	  alert("You may only play one land per turn.");
	  break;
	} else {
	  this.game.state.has_placed_land = 1;
	}

	// move land from hand to board
	this.moveCard(this.game.player, c.key, "hand", "lands");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tlands\t0");
	this.endTurn();
	break;

      case "creature":

	// move creature from hand to board
	this.moveCard(this.game.player, c.key, "hand", "creatures");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tcreatures\t0");
	this.endTurn();
	break;

      case "sorcery":
      case "enchantment":

	// move enchantment from hand to board
	this.moveCard(this.game.player, c.key, "hand", "enchantments");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tenchantments\t0");
	this.endTurn();
	break;

      case "instant" :

	// move instant from hand to board
	this.moveCard(this.game.player, c.key, "hand", "instant");
	this.addMove("move\t"+this.game.player+"\t"+c.key+"\thand\tinstants\t0");
	this.endTurn();
	break;

      default:
	console.log("unsupported card type");
    }
  }



  displayBoard() {

    let game_self = this;
/****
    document.getElementById("p1-lands").innerHTML = "";
    document.getElementById("p1-creatures").innerHTML = "";
    document.getElementById("p1-enchantments").innerHTML = "";

    // Player 2
    document.getElementById("p2-lands").innerHTML = "";
    document.getElementById("p2-creatures").innerHTML = "";
    document.getElementById("p2-enchantments").innerHTML = "";

    for (let i = 1; i <= 2; i++) {
      for (let z = 0; z < this.game.state.hands[i-1].lands.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].lands[z]].returnElement(game_self, i), `p${i}-lands`);
      }  
      for (let z = 0; z < this.game.state.hands[i-1].creatures.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].creatures[z]].returnElement(game_self, i), `p${i}-creatures`);
      }  
      for (let z = 0; z < this.game.state.hands[i-1].enchantments.length; z++) {
        this.app.browser.addElementToDom(this.game.cards[this.game.state.hands[i-1].enchantments[z]].returnElement(game_self, i), `p${i}-enchantments`);
      }  
    }
****/
  }



  //
  // this controls the display of the card
  //
  returnElement(game_self, player, cardkey) {

    let card = game_self.game.cards[cardkey];
    let tapped = "";
    if (card.tapped == 1) { tapped = " tapped"; }

    return `
      <div class="card ${tapped}" id="p${player}-${cardkey}">
        <img src="${card.img}" class="card-image" />
      </div>
    `;
  }



}

module.exports = Realms;

