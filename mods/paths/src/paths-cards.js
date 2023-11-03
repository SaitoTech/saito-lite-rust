
  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      let x = this.returnDeck();
      if (x[card]) { c = x[card]; }
    }
    if (c) { 
      if (c.name) {
        return `<span class="showcard ${card}" id="${card}">${c.name}</span>`;
      }
    }
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;
  }




  returnMobilizationDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

      deck['ap01'] = { 
        key : 'ap01',
        img : "cards/card_ap01.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap02'] = { 
        key : 'ap02',
        img : "cards/card_ap02.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap03'] = { 
        key : 'ap03',
        img : "cards/card_ap03.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap04'] = { 
        key : 'ap04',
        img : "cards/card_ap04.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap05'] = { 
        key : 'ap05',
        img : "cards/card_ap05.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap06'] = { 
        key : 'ap06',
        img : "cards/card_ap06.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap07'] = { 
        key : 'ap07',
        img : "cards/card_ap07.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap08'] = { 
        key : 'ap08',
        img : "cards/card_ap08.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap09'] = { 
        key : 'ap09',
        img : "cards/card_ap09.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['ap10'] = { 
        key : 'ap10',
        img : "cards/card_ap10.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

    }
    if (type == "central" || type == "all") {

      deck['cp01'] = { 
        key : 'cp01',
        img : "cards/card_cp01.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp02'] = { 
        key : 'cp02',
        img : "cards/card_cp02.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp03'] = { 
        key : 'cp03',
        img : "cards/card_cp03.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp04'] = { 
        key : 'cp04',
        img : "cards/card_cp04.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp05'] = { 
        key : 'cp05',
        img : "cards/card_cp05.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp06'] = { 
        key : 'cp06',
        img : "cards/card_cp06.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp07'] = { 
        key : 'cp07',
        img : "cards/card_cp07.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp08'] = { 
        key : 'cp08',
        img : "cards/card_cp08.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp09'] = { 
        key : 'cp09',
        img : "cards/card_cp09.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
      deck['cp10'] = { 
        key : 'cp10',
        img : "cards/card_cp10.svg" ,
        name : "British Reinforcements" ,
        text : "2nd army, 1 corps" ,
        cc : false ,
        ops : 2 ,
        sr : 4 ,		
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,		
        type : "normal" ,
	removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
    }

    return deck;
  }
  returnLimitedWarDeck(type="all") {
    let deck = {};
    return deck;
  }
  returnFullWarDeck(type="all") {
    let deck = {};
    return deck;
  }
  returnDeck(type="all") {
    let a = this.returnMobilizationDeck(type);
    let b = this.returnLimitedWarDeck(type);
    let c = this.returnFullWarDeck(type);
    let d = Object.assign({}, a, b);
    let deck = Object.assign({}, d, c);

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;
  }



