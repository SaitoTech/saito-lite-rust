

  ////////////////////////////////
  /// Cards and Card Functions ///
  ////////////////////////////////
  returnBlueDeck() {

    var deck = {};

    deck['b001'] 	= {
	name: "b001"						, 
	type: "creature"					,
	color: "blue"						,
	cost: ['*','*','*','blue','blue']			,
	power: 4						,
	toughness: 3						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"
    }
    deck['b002'] 	= { 
	name: "b002"    					, 
	type: "creature"					,
	color: "blue"						,
	cost: ['*','*','blue']					,
	power: 2						,
	toughness: 1						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"			,
	onEnterBattlefield: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: when creature enters battlefield, draw card.");
          return 1;
        }
    }
    deck['b003'] 	= { 
	name: "b003"    					, 
	type: "creature"					,
	color: "blue"						,
	cost: ['*','*','*','blue']				,
	power: 3						,
	toughness: 2						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"			,
	onAttack: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: gains flying when attacking creatures without flying until end of turn.");
          return 1;
        }
    }
    deck['b004'] 	= { 
	name: "b004"    					, 
	type: "instant"						,
	color: "blue"						,
	cost: ['*','*','blue']					,
	img: "/realms/img/cards/sample.png"			,
	onInstant: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: targetted creature gets -4/-0 until end of turn. Player may draw a card.");
	  return 1;
	}
    }
    deck['b005'] 		= { 
	name: "b005"    					, 
	type: "sorcery"						,
	color: "blue"						,
	cost: ['*','*','blue']					,
	img: "/realms/img/cards/sample.png"			,
	onCostAdjustment: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: card costs 1 less to cast if player controlls creature with flying.");
	  return 1;
	}							,
	onInstant: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: draw two cards");
	  return 1;
	}
    }
    deck['island1'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island2'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island3'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island4'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island5'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island6'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island7'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island8'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island9'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island10'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island11'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island12'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['island13'] 		= { 
	name: "Isle"    					, 
	type: "land"						,
	color: "blue"						,
	img: "/realms/img/cards/sample.png"
    }

    return deck;

  }
  returnWhiteDeck() {

    var deck = {};

    deck['w001'] 	= {
	name: "w001"				, 
	type: "creature"					,
	color: "white"						,
	cost: ['*','white']					,
	power: 1						,
	toughness: 3						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"
    }
    deck['w002'] 	= { 
	name: "w002"    					, 
	type: "creature"					,
	color: "white"						,
	cost: ['*','*','*','*','white']				,
	power: 3						,
	toughness: 2						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"			,
	onEnterBattlefield: function(game_self, player, card) {
	  game_self.updateLog("When Dawning Angel enters battlefield, gain 4 life.");
	  game_self.game.status.player[player-1].health += 4;
          return 1;
        }
    }
    deck['w003'] 	= { 
	name: "w002"    				,
	type: "creature"					,
	color: "white"						,
	cost: ['*','*','white']					,
	power: 3						,
	toughness: 2						,
	properties: []						,
	img: "/realms/img/cards/sample.png"			,
	onEnterBattlefield: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: when Haazda Officer enters battlefield, target creature gains +1/+1 until end of turn");
          return 1;
        }
    }
    deck['w004'] 	= { 
	name: "w004"    				, 
	type: "creature"						,
	color: "white"						,
	cost: ['*','*','white']					,
	power: 2						,
	toughness: 2						,
	properties: ['flying']					,
	img: "/realms/img/cards/sample.png"			,
	onAttack: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: when attacks, target attacking creature without flying gains flying until end of turn");
          return 1;
        }
    }
    deck['inspired-charge'] 	= { 
	name: "Inspired Charge"    				, 
	type: "instant"						,
	color: "white"						,
	cost: ['*','*','white']					,
	img: "/realms/img/cards/sample.png"			,
	onInstant: function(game_self, player, card) {
	  game_self.updateLog("UNIMPLEMENTED: all controlled creatures gain +2/+1 until end of turn");
	  return 1;
	}
    }
    deck['plains1'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains2'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains3'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains4'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains5'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains6'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains7'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains8'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/white/plains.jpg"
    }
    deck['plains9'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains10'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains11'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains12'] 		= { 
	name: "Grasslands"    					, 
	type: "land"						,
	color: "white"						,
	img: "/realms/img/cards/sample.png"
    }
    deck['plains13'] 		= { 
	name: "Grasslands"    					, 
	color: "white"						,
	type: "land"						,
	img: "/realms/img/cards/sample.png"
    }

    return deck;

  }

  importCard(key, card, player) {

    let game_self = this;

    let c = {};
	c.key = key;
	c.player = player;
        c.name = "Unnamed";
        c.color = "*";
        c.cost = [];
        c.power = 0;
        c.toughness = 0;
        c.text = "This card has not provided text";
	c.img = "/img/cards/sample.png";
	c.tapped = "";

    if (card.name) 	{ c.name = card.name; }
    if (card.color) 	{ c.color = card.color; }
    if (card.cost) 	{ c.cost = card.cost; }
    if (card.text) 	{ c.text = card.text; }
    if (card.type) 	{ c.type = card.type; }
    if (card.power) 	{ c.power = card.power; }
    if (card.toughness) { c.toughness = card.toughness; }
    if (card.img) 	{ c.img = card.img; }

    //
    // add dummy events that return 0 (do nothing)
    //
    if (!c.onInstant) 		{ c.onInstant = function(game_self, player, card) { return 0; } };
    if (!c.onEnterBattlefield) 	{ c.onEnterBattlefield = function(game_self, player, card) { return 0; } };
    if (!c.onCostAdjustment) 	{ c.onCostAdjustment = function(game_self, player, card) { return 0; } };

    c.returnElement = function(card) { return game_self.returnElement(game_self, player, c.key); }

    game_self.game.cards[c.key] = c;

  }

