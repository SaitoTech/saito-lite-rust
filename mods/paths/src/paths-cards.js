
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
        key : 'britishreinforcements',
        img : "cards/card_ap01.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

	    
deck['ap02'] = { 
        key : 'blockade',
        img : "cards/card_ap02.svg" ,
        name : "Blockade" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap03'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap03.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap04'] = { 
        key : 'pleve',
        img : "cards/card_ap04.svg" ,
        name : "Pleve" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap05'] = { 
        key : 'putnik',
        img : "cards/card_ap05.svg" ,
        name : "Putnik" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }



deck['ap06'] = { 
        key : 'withdrawal',
        img : "cards/card_ap06.svg" ,
        name : "Withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap07'] = { 
        key : 'severeweather',
        img : "cards/card_ap07.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }




deck['ap08'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap08.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap09'] = { 
        key : 'moltke',
        img : "cards/card_ap09.svg" ,
        name : "Moltke" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap10'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap10.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }



deck['ap11'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap11.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap12'] = { 
        key : 'entrench',
        img : "cards/card_ap12.svg" ,
        name : "Entrench" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap13'] = { 
        key : 'rapeofbelgium',
        img : "cards/card_ap13.svg" ,
        name : "Rape Of Belgium" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap14'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap14.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,       
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap15'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap15.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap16'] = { 
        key : 'romania',
        img : "cards/card_ap16.svg" ,
        name : "Romania" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap17'] = { 
        key : 'italy',
        img : "cards/card_ap17.svg" ,
        name : "Italy" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'RU' : 4 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap18'] = { 
        key : 'hurricanebarrage',
        img : "cards/card_ap18.svg" ,
        name : "Hurricane Barrage" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

deck['ap19'] = { 
        key : 'airsuperiority',
        img : "cards/card_ap19.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

deck['ap20'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap20.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap21'] = { 
        key : 'phosgenegas',
        img : "cards/card_ap21.svg" ,
        name : "Phosgene Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap22'] = { 
        key : 'italianreinforcements',
        img : "cards/card_ap22.svg" ,
        name : "Italian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap23'] = { 
        key : 'cloakanddagger',
        img : "cards/card_ap23.svg" ,
        name : "Cloak And Dagger" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap24'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap24.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap25'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap25.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap26'] = { 
        key : 'lusitania',
        img : "cards/card_ap26.svg" ,
        name : "Lusitania" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap27'] = { 
        key : 'greatretreat',
        img : "cards/card_ap27.svg" ,
        name : "Great Retreat" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap28'] = { 
        key : 'landships',
        img : "cards/card_ap28.svg" ,
        name : "Landships" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap29'] = { 
        key : 'yudenitch',
        img : "cards/card_ap29.svg" ,
        name : "Yudenitch" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap30'] = { 
        key : 'salonika',
        img : "cards/card_ap30.svg" ,
        name : "Salonika" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap31'] = { 
        key : 'mef',
        img : "cards/card_ap31.svg" ,
        name : "Mef" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap32'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap32.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap33'] = { 
        key : 'grandfleet',
        img : "cards/card_ap33.svg" ,
        name : "Grand Fleet" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap34'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap34.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap35'] = { 
        key : 'yanksandtanks',
        img : "cards/card_ap35.svg" ,
        name : "Yanks And Tanks" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap36'] = { 
        key : 'mineattack',
        img : "cards/card_ap36.svg" ,
        name : "Mine Attack" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }


deck['ap37'] = { 
        key : 'independentairforce',
        img : "cards/card_ap37.svg" ,
        name : "Independent Air Force" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap38'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap38.svg" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap39'] = { 
        key : 'theyshallnotpass',
        img : "cards/card_ap39.svg" ,
        name : "They Shall Not Pass" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }


deck['ap40'] = { 
        key : '14points',
        img : "cards/card_ap40.svg" ,
        name : "14 Points" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap41'] = { 
        key : 'arabnorthernarmy',
        img : "cards/card_ap41.svg" ,
        name : "Arab Northern Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
deck['ap42'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap42.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap43'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap43.svg" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap44'] = { 
        key : 'greece',
        img : "cards/card_ap44.svg" ,
        name : "Greece" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap45'] = { 
        key : 'kerenskyoffensive',
        img : "cards/card_ap45.svg" ,
        name : "Kerensky Offensive" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap46'] = { 
        key : 'brusilovoffensive',
        img : "cards/card_ap46.svg" ,
        name : "Brusilov Offensive" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap47'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap47.svg" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap48'] = { 
        key : 'royaltankcorps',
        img : "cards/card_ap48.svg" ,
        name : "Royal Tank Corps" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

deck['ap49'] = { 
        key : 'sinaipipeline',
        img : "cards/card_ap49.svg" ,
        name : "Sinai Pipeline" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap50'] = { 
        key : 'allenby',
        img : "cards/card_ap50.svg" ,
        name : "Allenby" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap51'] = { 
        key : 'everyoneintobattle',
        img : "cards/card_ap51.svg" ,
        name : "Everyone Into Battle" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap52'] = { 
        key : 'convoy',
        img : "cards/card_ap52.svg" ,
        name : "Convoy" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap53'] = { 
        key : 'armyoftheorient',
        img : "cards/card_ap53.svg" ,
        name : "Army Of The Orient" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap54'] = { 
        key : 'zimmermanntelegram',
        img : "cards/card_ap54.svg" ,
        name : "Zimmermann Telegram" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap55'] = { 
        key : 'overthere',
        img : "cards/card_ap55.svg" ,
        name : "Over There" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap56'] = { 
        key : 'paristaxis',
        img : "cards/card_ap56.svg" ,
        name : "Paris Taxis" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap57'] = { 
        key : 'russiancavalry',
        img : "cards/card_ap57.svg" ,
        name : "Russian Cavalry" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap58'] = { 
        key : 'russianguards',
        img : "cards/card_ap58.svg" ,
        name : "Russian Guards" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap59'] = { 
        key : 'alpinetroops',
        img : "cards/card_ap59.svg" ,
        name : "Alpine Troops" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 2 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }


deck['ap60'] = { 
        key : 'czechlegion',
        img : "cards/card_ap60.svg" ,
        name : "Czech Legion" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap61'] = { 
        key : 'maude',
        img : "cards/card_ap61.svg" ,
        name : "Maude" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['ap62'] = { 
        key : 'Thesixtusaffair',
        img : "cards/card_ap62.svg" ,
        name : "The Sixtus Affair" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap63'] = { 
        key : 'backstothewall',
        img : "cards/card_ap63.svg" ,
        name : "Backs To The Wall" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap64'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap64.svg" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['ap65'] = { 
        key : 'influenza',
        img : "cards/card_ap65.svg" ,
        name : "Influenza" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


    }
	  
    if (type == "central" || type == "all") {

      deck['cp01'] = { 
        key : 'gunsofaugust',
        img : "cards/card_cp01.svg" ,
        name : "Guns of August" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

      deck['cp02'] = { 
        key : 'wirelessintercepts',
        img : "cards/card_cp02.svg" ,
        name : "Wireless Intercepts" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

      deck['cp03'] = { 
        key : 'vonfrancois',
        img : "cards/card_cp03.svg" ,
        name : "Von Francois" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

 deck['cp04'] = { 
        key : 'severeweather',
        img : "cards/card_cp04.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

   deck['cp05'] = { 
        key : 'landwehr',
        img : "cards/card_cp05.svg" ,
        name : "Landwehr" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp06'] = { 
        key : 'entrench',
        img : "cards/card_cp06.svg" ,
        name : "ENTRENCH" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp07'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp07.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp08'] = { 
        key : 'racetothesea',
        img : "cards/card_cp08.svg" ,
        name : "Race to the Sea" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp09'] = { 
        key : 'reichstagtruce',
        img : "cards/card_cp09.svg" ,
        name : "Reichstag Truce" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
deck['cp10'] = { 
        key : 'sudarmy',
        img : "cards/card_cp10.svg" ,
        name : "Sud Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['cp11'] = { 
        key : 'oberost',
        img : "cards/card_cp11.svg" ,
        name : "Oberost" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp12'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp12.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
    deck['cp13'] = { 
        key : 'falkenhayn',
        img : "cards/card_cp13.svg" ,
        name : "Falkenhayn" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


 deck['cp14'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp14.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

      deck['cp15'] = { 
        key : 'chlorinegas',
        img : "cards/card_cp15.svg" ,
        name : "Chlorine Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
  deck['cp16'] = { 
        key : 'limanvonsanders',
        img : "cards/card_cp16.svg" ,
        name : "Liman Von Sanders" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


  deck['cp17'] = { 
        key : 'matahari',
        img : "cards/card_cp17.svg" ,
        name : "Mata Hari" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp18'] = { 
        key : 'fortifiedmachineguns',
        img : "cards/card_cp18.svg" ,
        name : "Fortified Machine Guns" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }
  deck['cp19'] = { 
        key : 'flamethrowers',
        img : "cards/card_cp19.svg" ,
        name : "Flamethrowers" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


  deck['cp20'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp20.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp21'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp21.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
  deck['cp22'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp22.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


  deck['cp23'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp23.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp24'] = { 
        key : 'libyanrevolts(tureinforcements)',
        img : "cards/card_cp24.svg" ,
        name : "Libyan Revolt (Tu Reinforcements)" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
  deck['cp25'] = { 
        key : 'highseasfleet',
        img : "cards/card_cp25.svg" ,
        name : "High Seas Fleet" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp26'] = { 
        key : 'placeofexecution',
        img : "cards/card_cp26.svg" ,
        name : "Place of Execution" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


  deck['cp27'] = { 
        key : 'zeppelinraids',
        img : "cards/card_cp27.svg" ,
        name : "Zeppelin Raids" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp28'] = { 
        key : 'tsartakescommand',
        img : "cards/card_cp28.svg" ,
        name : "Tsar Takes Command" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp29'] = { 
        key : '11tharmy',
        img : "cards/card_cp29.svg" ,
        name : "11Th Army" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp30'] = { 
        key : 'alpenkorps',
        img : "cards/card_cp30.svg" ,
        name : "Alpenkorps" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

deck['cp31'] = { 
        key : 'kemal',
        img : "cards/card_cp31.svg" ,
        name : "Kemal" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

deck['cp32'] = { 
        key : 'warinafrica',
        img : "cards/card_cp32.svg" ,
        name : "War in Africa" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp33'] = { 
        key : 'walterrathenau',
        img : "cards/card_cp33.svg" ,
        name : "Walter Rathenau" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
   deck['cp34'] = { 
        key : 'bulgaria',
        img : "cards/card_cp34.svg" ,
        name : "Bulgaria" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp35'] = { 
        key : 'mustardgas',
        img : "cards/card_cp35.svg" ,
        name : "Mustard Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp36'] = { 
        key : 'u-boatsunleashed',
        img : "cards/card_cp36.svg" ,
        name : "U-Boats Unleashed" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp37'] = { 
        key : 'hoffmann',
        img : "cards/card_cp37.svg" ,
        name : "Hoffmann" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp38'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp38.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp39'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp39.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


   deck['cp40'] = { 
        key : 'airsuperiority',
        img : "cards/card_cp40.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }

   deck['cp41'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp41.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp42'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp42.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
   deck['cp43'] = { 
        key : 'vonbelow',
        img : "cards/card_cp43.svg" ,
        name : "Von Below" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp44'] = { 
        key : 'vonhutier',
        img : "cards/card_cp44.svg" ,
        name : "Von Hutier" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

   deck['cp45'] = { 
        key : 'treatyofbrestlitovsk',
        img : "cards/card_cp45.svg" ,
        name : "Treaty of Brest Litovsk" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


 deck['cp46'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp46.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

  deck['cp47'] = { 
        key : 'frenchmutiny',
        img : "cards/card_cp47.svg" ,
        name : "French Mutiny" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp48'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp48.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
deck['cp49'] = { 
        key : 'michael',
        img : "cards/card_cp49.svg" ,
        name : "Michael" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp50'] = { 
        key : 'blucher',
        img : "cards/card_cp50.svg" ,
        name : "Blucher" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp51'] = { 
        key : 'peaceoffensive',
        img : "cards/card_cp51.svg" ,
        name : "Peace Offensive" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp52'] = { 
        key : 'fallofthetsar',
        img : "cards/card_cp52.svg" ,
        name : "Fall of The Tsar" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp53'] = { 
        key : 'bolshevikrevolution',
        img : "cards/card_cp53.svg" ,
        name : "Bolshevik Revolution" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp54'] = { 
        key : 'h-ltakecommand',
        img : "cards/card_cp54.svg" ,
        name : "H-L Take Command" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp55'] = { 
        key : 'lloydgeorge',
        img : "cards/card_cp55.svg" ,
        name : "Lloyd George" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['cp56'] = { 
        key : 'withdrawal',
        img : "cards/card_cp56.png" ,
        name : "withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp57'] = { 
        key : 'kaisertreu',
        img : "cards/card_cp57.png" ,
        name : "Kaisertreu" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
deck['cp58'] = { 
        key : 'stavkatimidity',
        img : "cards/card_cp58.png" ,
        name : "Stavka Timidity" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
      }


deck['cp59'] = { 
        key : 'polishrestoration',
        img : "cards/card_cp59.png" ,
        name : "Polish Restoration" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp60'] = { 
        key : 'turkdetermination',
        img : "cards/card_cp60.png" ,
        name : "turk Determination" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }
deck['cp61'] = { 
        key : 'haig',
        img : "cards/card_cp61.png" ,
        name : "Haig" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['cp62'] = { 
        key : 'achtung:panzer',
        img : "cards/card_cp62.png" ,
        name : "Achtung: Panzer" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp63'] = { 
        key : 'russiandesertions',
        img : "cards/card_cp63.png" ,
        name : "Russian Desertions" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }

deck['cp64'] = { 
        key : 'alberich',
        img : "cards/card_cp64.png" ,
        name : "Alberich" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
    removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
      }


deck['cp65'] = { 
        key : 'princemax',
        img : "cards/card_cp65.png" ,
        name : "Prince Max" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
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



