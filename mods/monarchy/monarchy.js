const GameTemplate = require('../../lib/templates/gametemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
class Monarchy extends GameTemplate {

  constructor(app) {
    super(app);

    this.app             = app;

    this.name  		       = "Monarchy";
    this.gamename        = "Monarchy";
    this.slug		         = "monarchy";
    this.description     = `Monarch is a strategy deck-building game, where players strive for dominion over the land by spending money on land and resources.`;
    this.categories      = "Games Arcade Entertainment";

    this.card_height_ratio = 1.6; // height is 1.6x width

    this.interface     = 1; //Display card graphics
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 4;
    this.type       	 = "Strategy Boardgame";
    this.categories 	 = "Boardgame Game"

    this.hud.mode = 0;  // long-horizontal
    this.hud.enable_mode_change = 1;
    this.hud.card_width = 120;
    this.hud.respectDocking = true;
  }


  //
  // manually announce arcade banner support
  //
  respondTo(type) {

    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/monarchy/img/arcade/arcade-banner-background.png";
      obj.title = "Monarchy";
      return obj;
    }
   
    return null;
   }


  showCardOverlay(cards, title = ""){
    let html = `
      <div class="ts-overlay">
      <h1>${title}</h1>
      <div class="ts-body">
      <div class="cardlist-container">${this.returnCardList(cards)}</div>`;
      if (cards.length == 0) { 
        html = `<div style="text-align:center; margin: auto;">
                There are no cards to display
                </div>`;
      }
      html += "</div></div>";
      this.overlay.show(this.app, this, html);
  }


 
 initializeHTML(app) {

    if (this.browser_active == 0) { return; }

    super.initializeHTML(app);

    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
      	game_mod.menu.showSubMenu("game-game");
      }
    });
   
    this.menu.addSubMenuOption("game-game", {
      text : "How to Play",
      id : "game-rules",
      class : "game-rules",
      callback : function(app, game_mod) {
         game_mod.menu.hideSubMenus();
         game_mod.overlay.show(game_mod.app, game_mod, game_mod.returnGameRulesHTML()); 
      }
    });

     this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        window.location.href = "/arcade";
      }
    });

    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
	      game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
    });
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.cardbox.render(app, this);
    this.cardbox.attachEvents(app, this);

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("logcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);
    
    this.hud.render(app, this);
    this.hud.attachEvents(app, this);

}


  ////////////////
  // initialize //
  ////////////////
initializeGame(game_id) {

  if (this.game.status != "") { this.updateStatus(this.game.status); }
  this.restoreLog();

  this.deck = this.returnCards();

  //
  // initialize
  //
  if (!this.game.state) {
    this.game.state = this.returnState();

    console.log("\n\n\n\n");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("------ INITIALIZE GAME ----");
    console.log("----------MONARCHY---------");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("\n\n\n\n");

    this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

    this.game.queue.push("turn\t1");
    this.game.queue.push("READY");
    for (let p = 1; p <= this.game.players.length; p++){
      this.game.queue.push(`DEAL\t${p}\t${p}\t5`);  
      
      for (let i = this.game.players.length; i>0; i--){
        this.game.queue.push(`DECKENCRYPT\t${p}\t${i}`);
      }
      for (let i = this.game.players.length; i>0; i--){
        this.game.queue.push(`DECKXOR\t${p}\t${i}`);
      }
      this.game.queue.push(`DECK\t${p}\t${JSON.stringify(this.returnInitialHand())}`);  
    }
    
    this.game.queue.push("init");

  }

  if (this.browser_active){
     this.displayBoard();
  }
 
}





  //
  // Core Game Logic
  //
  handleGameLoop() {

    let we_self = this;
    
    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      if (this.browser_active){
         this.displayBoard();
      }
      console.log(JSON.parse(JSON.stringify(this.game.deck)));

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");


      if (mv[0] == "init") {
        this.game.queue.splice(qe, 1);
        /*
          Determine which cards are in play for the game
        */
        let supply = [];
        if (this.game.options.card_set){
          switch(this.game.options.card_set){
            case "firstgame":      supply = ["cellar", "market", "militia", "mine", "moat", "remodel", "smithy", "village", "woodcutter", "workshop"]; break;
            case "bigmoney":       supply = ["adventurer", "bureaucrat", "chancellor", "chapel", "feast", "laboratory", "market", "mine", "moneylender", "throneroom"]; break;
            case "interaction":    supply = ["bureaucrat", "chancellor", "councilroom", "festival", "library", "militia", "moat", "spy", "thief", "village"]; break;
            case "sizedistortion": supply = ["cellar", "chapel", "feast", "gardens", "laboratory", "thief", "village", "witch", "woodcutter", "workshop"]; break;
            case "villagesquare":  supply = ["bureaucrat", "cellar", "festival", "library", "market", "remodel", "smithy", "throneroom", "village", "woodcutter"]; break;
          }
        }
        //Random Selection
        if (supply.length == 0){
          let choices = (this.game.options.second)? this.returnSecondEd() : this.returnFirstEd();
          for (let i = 0; i < 10; i++){
            let ind = this.rollDice(choices.length) - 1;
            supply = supply.concat(choices.splice(ind-1,1));
          }
        }

        while (supply.length > 0){
          let card = supply.shift();
          this.game.state.supply[card] = 10;
        }

        return 1;
      }

      if (mv[0] == "turn"){
        if (!this.browser_active) {return 0;}
        let player = parseInt(mv[1]);
        if (this.game.player == player){
          this.playerTurn();
        }else{
          this.updateStatusAndListCards(`Waiting for Player ${player} to play a card`);
        }

        return 0;
      }

      if (mv[0] == "DISCARD"){
        let deckidx = parseInt(mv[1]);
        let card = mv[2];

        let handidx = this.game.deck[deckidx-1].hand.indexOf(card);
        if (handidx > -1){
          this.game.deck[deckidx-1].hand.splice(handidx,1);
        }
        this.game.deck[deckidx-1].discards[card] = this.game.deck[deckidx-1].cards[card];
        this.game.queue.splice(qe, 1);
        return 1;
      }

      if (mv[0] == "trash"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let ckey = mv[2];
        let cvalue = mv[3];
        this.updateLog(`Player ${player} trashes a ${this.cardToText(cvalue)}`);
        this.game.deck[player-1].removed[ckey] = cvalue;
        delete this.game.deck[player-1].cards[ckey];
        return 1;        
      }

      if (mv[0] == "cleanup"){
        let player = parseInt(mv[1]);
        //Functions like resolve + end round
        this.game.queue.splice(qe-1, 2); //Get rid of turn
        this.game.state.buys = 1;
        this.game.state.actions = 1;
        this.game.state.coins = 0;
        this.game.state.shuffled = false;
        this.game.state.merchant = false;
        this.game.state.throneroom = false;
        
        console.log(this.game.player,player,JSON.parse(JSON.stringify(this.game.deck[player-1])));
        //Check for end game
        if (this.gameOver()){
          this.game.push("gameover");
          for (let p = 1; p <= this.game.players.length; p++){
            this.game.queue.push(`SAFEDEAL\t${p}\t${p}\t${this.game.deck[p-1].discards.length + this.game.deck[p-1].crypt.length}`);
          }
        }else{
          if (this.game.player == player){
            this.updateStatus("Discarding hand and drawing new cards...");
            this.addMove("turn\t"+this.returnNextPlayer(player));
            //Deal 5 New Cards
            this.addMove(`SAFEDEAL\t${player}\t${player}\t5`);
                 
            //Discard all cards in hand
            for (let c of this.game.deck[player-1].hand){
              this.addMove(`DISCARD\t${player}\t${c}`);
              //this.game.deck[player-1].discards[cardcode] = this.game.deck[player-1].cards[cardcode];
            }
            this.endTurn();  
          }
          return 0;
          
        }

        return 1;
      }

      if (mv[0] == "buy"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card_to_buy = mv[2];
        let direct_to_hand = (mv[3]=="1");
        let code = Object.keys(this.game.deck[player-1].cards).length + 1;
        //Manuall insert card into players discard pile
        this.game.deck[player-1].cards[code.toString()] = card_to_buy;
        if (direct_to_hand){
          this.game.deck[player-1].hand.push(code);
        }else{
          this.game.deck[player-1].discards[code.toString()] = card_to_buy;
        }

        this.game.state.supply[card_to_buy]--; //Decrease supply in game
        return 1;
      }

      if (mv[0] == "play"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card_to_play = mv[2];

        this.updateLog(`Player ${player} played ${this.cardToText(card_to_play)}`);
        return this.playCard(player, card_to_play);
      }

      if (mv[0] == "draw"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let number = parseInt(mv[2]) - this.game.deck[player-1].hand.length;
        if (number > 0){
          this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t${number}`);  
        }
        return 1;
      }

      if (mv[0] == "hand"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let number = parseInt(mv[2]);
        let target = mv[3];
        let optional = (mv[4]=="1");

        if (this.game.player == player){
          if (number <= 0){
            this.endTurn();
            return 0;
          }
          this.updateStatusAndListCards(`Select (${number}) cards to move to ${target}:`,[],optional);
          this.bindBackButtonFunction(()=>{
            we_self.endTurn();
            we_self.updateStatusAndListCards(`Finished moving cards to ${target}...`);
          });
          this.attachCardboxEvents(function(card){
            number--;
            we_self.removeCardFromHand(card);
            let div = document.querySelector("#status #"+card);
            if (div){ div.remove(); }
            switch(target){
              case "deck": we_self.addMove(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(we_self.returnLastCard())}`); break;
              case "trash": we_self.addMove(`trash\t${mv[1]}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`); break;
              case "discards": we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`); break;
            }     
            if (number <= 0){
              we_self.endTurn();
            }
          });
        }
        return 0;
      }

      //Specific card instructions
      if (mv[0] == "adventurer"){
        let player = parseInt(mv[1]);
        if (player !== this.game.player){ return 0;}

        if (this.game.pool[player-1].hand.length > 0){
          let c = this.game.pool[player-1].hand.pop();
          let cardname = this.game.pool[player-1].cards[c];
          if (this.deck[cardname].type == "treasure"){ //Move to player's hand
            this.game.deck[player-1].hand.push(c);
          this.game.state.adventurer--;
          }else{ //Put it back
            this.game.pool[player-1].hand.push(c);
          }
        }

        if (this.game.state.adventurer == 0 || (this.game.state.shuffled && this.game.deck[player-1].crypt.length == 0)){
          this.game.queue.splice(qe, 1);
          for (let c of this.game.pool[player-1].hand){
            this.addMove(`DISCARD\t${mv[1]}\t${c}`);
          }
          this.endTurn();
          return 0;
        }

        this.addMove(`POOLDEAL\t${mv[1]}\t1\t${mv[1]}`);
        if (this.game.deck[player-1].crypt.length == 0){
          this.addMove(`SHUFFLEDISCARDS\t${player}`);
          this.game.state.shuffled = true;
        }
        this.endTurn();
        return 0;
      }

      //Bandit will auto select the least value treasure to discard
      if (mv[0] == "bandit"){
        let card_player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);
        let trash = [];
        let discard = [];
        for (let c of this.game.pool[victim-1].hand){
          let cardname = this.game.pool[victim-1].cards[c];
          if (this.deck[cardname].type == "treasure" && cardname !== "copper"){
            //Can Trash
            trash.push(c);
          }else{
            discard.push(c);
          }
        }
        if (trash.length > 1){
          if (this.game.pool[victim-1].cards[trash[0]] == "silver"){
            discard.push(trash.shift());
          }else{
            discard.push(trash.pop());
          }
        }
        for (let t of trash){
          this.game.queue.push(`trash\t${victim}\t${t}\t${this.game.pool[victim-1].cards[t]}`);
        }
        for (let t of discard){
          this.game.queue.push(`DISCARD\t${victim}\t${t}`);
        }

        return 1;
      }

      if (mv[0] == "harbinger"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        if (player == this.game.player){
          //Read the discard pile
          let my_keys = [];
          let my_discards = [];
          for (let c in this.game.deck[player-1].discards){
            my_keys.push(c);
            my_discards.push(this.game.deck[player-1].discards[c]);
          }
          this.updateStatusAndListCards(`Select a card to put on top of your deck:`,my_discards, false);
          this.attachCardboxEvents(function(oldcard){
            let index = my_discards.indexOf(oldcard);
            let card = {};
            card[my_keys[index]] = my_discards[index];
            this.addMove(`PUSHONDECK\t${player}\t${JSON.stringify(card)}`);
            this.endTurn();
          });
        }
        return 0;
      }

      if (mv[0] == "library"){
        let player = parseInt(mv[1]);

        if (this.game.player !== player){
          return 0;
        }
        if (this.game.pool[player-1].hand.length > 0){
          let c = this.game.pool[player-1].hand.pop();
          let cardname = this.game.pool[player-1].cards[c];
          if (this.deck[cardname].type.includes("action")){
            this.updateStatusWithOptions(`You drew ${this.cardToText(cardname)}:`, `<ul><li class="card nocard" id="keep">keep</li><li class="card nocard" id="nope">set aside</li></ul>`);
            this.attachCardboxEvents(function (action){
              if (action == "keep"){
                this.game.deck[player-1].hand.push(c);  
              }else{
                this.game.pool[player-1].hand.push(c);  
              }
            });  
          }else{
            this.game.deck[player-1].hand.push(c);  
          }
        }

        if (this.game.deck[player-1].hand.lenght == 7 || (this.game.state.shuffled && this.game.deck[player-1].crypt.length == 0)){
          this.game.queue.splice(qe, 1);
          for (let c of this.game.pool[player-1].hand){
            this.addMove(`DISCARD\t${mv[1]}\t${c}`);
          }
          this.endTurn();
          return 0;
        }

        this.addMove(`POOLDEAL\t${mv[1]}\t1\t${mv[1]}`);
        if (this.game.deck[player-1].crypt.length == 0){
          this.addMove(`SHUFFLEDISCARDS\t${player}`);
          this.game.state.shuffled = true;
        }
        this.endTurn();
        return 0;
      }

      if (mv[0] == "sentry"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        if (this.game.player == player){
          if (this.game.pool[player-1].hand.length == 0){
            this.endTurn();
            return;
          }
          this.menu_backup_callback = ()=>{this.endTurn();}
          this.addMove(`sentry\t${player}`);
          let html = `<ul>
                        <li class="card nocard" id="deck">deck</li>
                        <li class="card nocard" id="discards">discard</li>
                        <li class="card nocard" id="trash">trash</li>
                      </ul>`;
          this.updateStatusAndListCards("The top cards from your deck:",this.game.pool[player-1].hand,false);
          this.attachCardboxEvents(function(card){
            we_self.updateStatusWithOptions(`Move ${card} to:`, html, true);
            we_self.attachCardboxEvents(function(action){
              we_self.removeCardFromPool(card);
              if (action == "deck"){
                we_self.addMove(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(we_self.returnLastCard())}`);
              }else if (action == "trash"){
                we_self.addMove(`trash\t${mv[1]}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`);
              }else{
                we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              }
              we_self.endTurn();
            });
          });
        }
        return 0;
      }


      if (mv[0] == "vassal"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        if (this.game.player == player){
          let c = this.game.pool[player-1].hand[0];
          let cname = this.game.pool[player-1].cards[c];
          if (this.deck[cname].type.include("action")){
            let html = `<ul><li class="card nocard" id="play">play</li><li class="card nocard" id="discards">discard</li></ul>`;
            we_self.updateStatusWithOptions(`Play ${card} instead of discarding it?`, html);
            we_self.attachCardboxEvents(function (action){
              we_self.removeCardFromPool(cname);
              if (action == "play"){
                we_self.addMove(`play\t${player}\t${cname}`);
              }else{
                we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              }
              we_self.endTurn();
            });
          }else{
            we_self.removeCardFromPool(cname);
            we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
            this.endTurn();
          }
        }
        return 0;
      }

    } // if cards in queue
    
    return 0;

  }


  playerTurn(){
    let we_self = this;
    if ((this.game.state.throneroom || this.game.state.actions > 0) && this.hasActionCard()){
      this.updateStatusAndListCards(`Pick a card to play${this.game.state.throneroom?" twice":""}`);
      this.attachCardboxEvents(function(action){
        if (we_self.deck[action].type.includes("action")){
          we_self.removeCardFromHand(action); 
          we_self.updateStatusAndListCards(`Playing ${we_self.cardToText(action)}...`);
          we_self.addMove(`DISCARD\t${we_self.game.player}\t${we_self.lastCardKey}`);
          we_self.addMove(`play\t${we_self.game.player}\t${action}`);

          if (this.game.state.throneroom){
            this.game.state.throneroom = false;
            we_self.addMove(`play\t${we_self.game.player}\t${action}`);  
          }else{
            we_self.game.state.actions--;            
          }
          we_self.endTurn();

          $(".dim").removeClass("dim");
        }
      });
      
      $(".gameboard .cardpile").addClass('dim');
      return;
    }

    this.game.state.actions = 0;
    
    if (this.game.state.buys > 0){

      let available_coins = this.game.state.coins + this.countMoney();
      this.updateStatusAndListCards(`You have ${available_coins} coins and ${this.game.state.buys} card${(this.game.state.buys>0)?"s":""} to buy`);
      this.filterBoardDisplay(available_coins);
      $(".gameboard .cardpile").on("click", function(){
        let newcard = $(this).attr("id");
        if (we_self.game.state.supply[newcard] <= 0){
          we_self.displayModal(`No ${we_self.cardToText(newcard)} available!`);
          return;
        }
        if (we_self.deck[newcard].cost <= available_coins){
          we_self.addMove(`buy\t${we_self.game.player}\t${newcard}`);
          we_self.addMove(`NOTIFY\tPlayer ${we_self.game.player} bought a ${we_self.cardToText(newcard)}.`);
          we_self.game.state.buys--;
          available_coins -= we_self.deck[newcard].cost;
        }

        if (we_self.game.state.buys <= 0){
          $(".gameboard .cardpile").off();
          we_self.endTurn();
        }else{
          we_self.updateStatusAndListCards(`You have ${available_coins} coins and ${we_self.game.state.buys} card${(we_self.game.state.buys>0)?"s":""} to buy`);
          we_self.filterBoardDisplay(available_coins);
        }
      });
      return;
    }

    this.addMove(`cleanup\t${this.game.player}`);
    this.endTurn();
  }


  acquireCard(max_value){
    let we_self = this;
    this.updateStatus(`You may select a card worth up to ${max_value}`);
    this.filterBoardDisplay(max_value);
    $(".gameboard .cardpile").on("click", function(){
      let newcard = $(this).attr("id");
      if (we_self.game.state.supply[newcard] <= 0){
          we_self.displayModal(`No ${we_self.cardToText(newcard)} available!`);
          return;
        }
      if (we_self.deck[newcard].cost <= max_value){
        $(".gameboard .cardpile").off();
        we_self.addMove(`buy\t${we_self.game.player}\t${newcard}`);
        we_self.addMove(`NOTIFY\tPlayer ${we_self.game.player} acquired a ${we_self.cardToText(newcard)}.`);
        we_self.endTurn();
      }
    });
  }

  displayBoard(){
    let html = `<div class="cardstacks">`;
    let cardClass = ($("#zoom").hasClass("active"))?"showcard":"passivecard";
    for (let c in this.game.state.supply){
      if (c !== "curse"){
        html += `<div class="cardpile tip" id="${c}">`;
        if (this.game.state.supply[c] > 0){
          html += `<img class="${cardClass}" id="${c}" src="/monarchy/img/cards/${this.deck[c].img}">`;
          html += `<div class="tiptext">Remaining Supply: ${this.game.state.supply[c]}</div>`;
        }else{
          html += `<img class="${cardClass}" src="/monarchy/img/cards/blank.png">`;
          html += `<div class="tiptext">No more ${this.cardToText(c,true)}</div>`;
        }
        html += "</div>";  
      }
    }
    html += "</div>";

    $(".gameboard").html(html);
    this.attachCardboxEvents();
    this.attachBoardEvents();
  }

  filterBoardDisplay(max){
    for (let c in this.game.state.supply){
      if (c !== "curse"){
        if (this.deck[c].cost > max){
          $(`#${c}.cardpile`).css("filter","brightness(0.15)");
        }else{
          $(`#${c}.cardpile`).css("filter","brightness(0.95)");
        }
      }
    }
  }

  attachBoardEvents(){
    let we_self = this;
    $("#zoom").off();
    $("#zoom").on("click",function(){
      $("#zoom").toggleClass("active");
      if ($("#zoom").hasClass("active")){
        $(".passivecard").addClass("showcard");
        $(".passivecard").removeClass("passivecard");
        $(".cardpile").removeClass("tip");
      }else{
        $(".showcard").off();
        $(".showcard").addClass("passivecard");
        $(".showcard").removeClass("showcard");
        $(".cardpile").addClass("tip");
      }
      we_self.cardbox.detachCardEvents();
      we_self.attachCardboxEvents();
    });
  }

  gameOver(){
    if (this.game.state.supply.province == 0){
      return true;
    }
    let count = 0;
    for (let s in this.game.state.supply){
      if (this.game.state.supply[s]==0){
        count++;
      }
    }

    return (count>=3);
  }

  //Utilities
  hasActionCard(){
    let pi = this.game.player-1;
    for (let c of this.game.deck[pi].hand){
      let cardname = this.game.deck[pi].cards[c];
      if (this.deck[cardname].type.includes("action")){
        return true;
      }
    }
    return false;
  }

  hasCardInHand(cardvalue){
    let pi = this.game.player-1;
    for (let c of this.game.deck[pi].hand){
      console.log(cardvalue, this.game.deck[pi].cards[c]);
      if(this.game.deck[pi].cards[c] == cardvalue){
        return true;
      }
    }
    return false;
  }

   countMoney(){
    let bank = 0;
    let pi = this.game.player-1;
    for (let c of this.game.deck[pi].hand){
      let cardname = this.game.deck[pi].cards[c];
      if (this.deck[cardname].type == "treasure"){
        bank += parseInt(this.deck[cardname].text);
        if (this.game.state.merchant && cardname == "silver"){
          bank++;
          this.game.state.merchant = false;
        }
      }
    }
    return bank;
  }

  cardToText(card, textonly = false){
    try{
      if (textonly){
        return this.deck[card].name;
      }else{
        return `<span class="logcard" id="${card}">${this.deck[card].name}</span>`;
      }
    }catch(err){
      console.log(err);
      console.log(card,this.deck[card]);
    }
  }

  /*
  Get the card out of the hand (but don't add it to the discards ...yet)
  */
  removeCardFromHand(card) {
    console.log("Should remove: " + card);
    if (this.game.player == 0) { return; }
    let pi = this.game.player-1;
    for (let i = 0; i < this.game.deck[pi].hand.length; i++) {
      if (this.game.deck[pi].cards[this.game.deck[pi].hand[i]] == card) {
        this.lastCardKey = this.game.deck[pi].hand[i];
        this.lastCardValue = card;
        this.game.deck[pi].hand.splice(i, 1);
        return; //Only remove one copy
      }
    }
    console.log("Card not found");
  }
  removeCardFromPool(card) {
    if (this.game.player == 0) { return; }
    for (let i = 0; i < this.game.pool[this.game.player-1].hand.length; i++) {
      if (this.game.pool[this.game.player-1].cards[this.game.pool[this.game.player-1].hand[i]] == card) {
        this.lastCardKey = this.game.pool[this.game.player-1].hand[i];
        this.lastCardValue = card;
        this.game.pool[this.game.player-1].hand.splice(i, 1);
        return; //Only remove one copy
      }
    }
  }

 playCard(player, card_to_play){
    console.log("Playing card",player,card_to_play);
    console.log(JSON.parse(JSON.stringify(this.game.state)));
    we_self = this;
    //**
    if (card_to_play == "adventurer"){
      //Reveal cards from your deck until you reveal 2 Treasure cards. Put those into your hand and discard the other revealed cards.
      this.game.state.shuffled = false;
      this.game.state.adventurer = 2;
      this.game.queue.push(`adventurer\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
    }
    //**
    if (card_to_play == "artisan"){
      //Gain a card to your hand costing up to 5. Put a card from your hand onto your deck.
      this.game.queue.push(`hand\t${player}\t1\tdeck`);
      if (this.game.player == player){
        this.acquireCard(5);
      }
      return 0;
    }
    //**
    if (card_to_play == "bandit"){
      //Gain a gold. Each other player reveals the top 2 cards of their deck, trashes a revealed Treasure other than Copper, and discards the rest.
      this.game.queue.push(`buy\t${player}\tgold`);
      for (let i = 1; i <= this.game.players.length; i++){
        if (i !== player){
          this.game.queue.push(`bandit\t${player}\t${i}`);
          this.game.queue.push(`POOLDEAL\t${i}\t2\t${i}`); //Reveal top to cards
          this.game.queue.push(`POOL\t${i}`); //Reset the pool
        }
      }
    }

    if (card_to_play == "bureaucrat"){
      //Gain a Silver onto your deck. Each other player reveals a Victory card from their hand and puts it onto their deck (or reveals a hand with no Victory cards)
      
    }
    //**
    if (card_to_play == "cellar"){
      //+1 Action, Discard any number of cards, then draw that many.
      this.game.state.actions++;
      if (this.game.player == player){
        let number = 0;
        this.updateStatusAndListCards(`Select cards to discard:`,[],true);
        this.bindBackButtonFunction(()=>{
          if (number > 0){
            we_self.prependMove(`SAFEDEAL\t${player}\t${player}\t${number}`);  
          }
          we_self.endTurn();
          we_self.updateStatusAndListCards(`Dealing ${number} cards...`);
        });
        this.attachCardboxEvents(function(card){
          number++;
          we_self.removeCardFromHand(card);
          let div = document.querySelector("#status #"+card);
          if (div){
            div.remove();
          }
          we_self.addMove(`DISCARD\t${player}\t${we_self.lastCardKey}`);
        });
      }
      return 0;
    }
    //**
    if (card_to_play == "chancellor"){
      //+2 coin, You may immediately put your deck into your discard pile.
      this.game.state.coins += 2;
      if (this.game.player == player){
        let html = `<ul><li class="card nocard" id="yes">yes</li><li class="card nocard" id="no">no</li></ul>`;
        this.updateStatusWithOptions("Would you like to discard your deck (for a reshuffle before next draw)?", html);
        this.attachCardboxEvents(function(card){
          if (card == "yes"){
            we_self.addMove(`SHUFFLEDISCARDS\t${player}`);
          }
          we_self.endTurn();
        });
      }
      return 0;
    }
    //**
    if (card_to_play == "chapel"){
      //Trash up to 4 cards from your hand.
      this.game.queue.push(`hand\t${player}\t4\ttrash\t1`);
    }
    //**
    if (card_to_play == "councilroom"){
      //+4 Cards +1 Buy, Each other player draws a card
      this.game.state.buys++;
      for (let i = 1; i <= this.game.players.length; i++){
        if (i !== player){
          this.game.queue.push(`SAFEDEAL\t${i}\t${i}\t1`);    
        }
      }
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t4`);
    }
    //**
    if (card_to_play == "feast"){
      //Trash this card. Gain a card costing up to 5
      if (this.game.player == player){
        this.addMove(`trash\t${player}\t${this.lastCardKey}\t${this.lastCardValue}`);
        this.acquireCard(5);
      }
      return 0;
    }
    //**
    if (card_to_play == "festival"){
      //+2 Actions, +1 Buy, +2 Coin
      this.game.state.actions += 2;
      this.game.state.buys    += 1;
      this.game.state.coins   += 2;
    }
    //**
    if (card_to_play == "gardens"){
      //+1 VP for 10 cards in deck
    }
    //**
    if (card_to_play == "harbinger"){
      //+1 Card, +1 Action, Look through your discard pile. You may put a card from it onto your deck.
      this.game.state.actions++;
      this.game.queue.push(`harbinger\t${player}`);
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`);
    }
    //**
    if (card_to_play == "laboratory"){
      //+2 Cards, +1 Action      
      this.game.state.actions++;
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t2`)
    }
    //**
    if (card_to_play == "library"){
      //Draw until you have 7 cards in hand, skipping any Action cards you choose to. Set those aside to discard afterwards
      this.game.state.shuffled = false;
      this.game.queue.push(`library\t${player}`);
    }
    //**
    if (card_to_play == "market"){
      //+1 Card +1 Action +1 Buy +1 Coin
      this.game.state.actions++;
      this.game.state.buys++;
      this.game.state.coins++;
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`)
    }
    //**
    if (card_to_play == "merchant"){
      //+1 Card +1 Action The first time you play a Silver this turn, +1 Coin
      this.game.state.merchant = true;
      this.game.state.actions++;
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`)
    }
    //**
    if (card_to_play == "militia"){
      //+2 Coin, Each other play discards down to 3 cards in hand
      this.game.state.coins += 2;
      for (let i = 1; i <= this.game.players.length; i++){
        if (i !== player){
          this.game.queue.push(`hand\t${i}\t${this.game.deck[i-1].hand.length-3}\tdiscards`);  
        }
      }  
    }
    //**
    if (card_to_play == "mine"){
      //You may trash a Treasure from your hand. Gain a treasure to your hand costing up to 3 more than it
      if (player == this.game.player){
        let tcards = [];
        for (let c of this.game.deck[player-1].hand){
          let cname = this.game.deck[player-1].cards[c];
          if (this.deck[cname].type == "treasure"){
            tcards.push(cname);
          }
        }
        if (tcards.length == 0){
          this.endTurn();
        }else{
          this.updateStatusAndListCards(`You may trash a treasure to acquire one costing 3 more than it.`, tcards, true);
          this.bindBackButtonFunction(function(){we_self.endTurn();});
          this.attachCardboxEvents(function(tc){
            we_self.removeCardFromHand(tc);
            if (tc == "copper"){
              we_self.addMove(`buy\t${player}\tsilver\t1`);
            }else{
              we_self.addMove(`buy\t${player}\tgold\t1`);
            }
            we_self.addMove(`trash\t${player}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`);
            we_self.endTurn();
          });
        }
      }
      return 0;
    }
    //**
    if (card_to_play == "moat"){
      //+2 Cards, When another player plays an Attack card, you may first reveal this from your hand to be unaffected by it
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t2`) 
    }
    //**
    if (card_to_play == "moneylender"){
      //You may trash a Copper from your hand for +3 Coin
      if (player == this.game.player){
        if (this.hasCardInHand("copper")){
           let html = `<ul><li class="card nocard" id="yes">yes</li><li class="card nocard" id="no">no</li></ul>`;
           this.updateStatusWithOptions("Would you like to trash a copper for +3 coin this turn?", html);
           this.attachCardboxEvents(function(card){
              if (card == "yes"){
                we_self.game.state.coins += 3;
                we_self.removeCardFromHand("copper");
                we_self.addMove(`trash\t${player}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`);
              }
              we_self.endTurn();
            });
        }else{
          this.endTurn();
        }
      }
      return 0;
    }
    //**
    if (card_to_play == "poacher"){
      //+1 Card, +1 Action, +1 Coin, Discard a card per empty Supply pile
      this.game.state.actions++;
      this.game.state.coins++;
      let num = 0;
      for (let s of this.game.state.supply){
        if (this.game.state.supply[s]==0){
          num++;
        }
      }
      this.game.queue.push(`hand\t${player}\t${num}\tdiscards`);
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`);
    }
    //**
    if (card_to_play == "remodel"){
      //Trash a card from your hand. Gain a card costing up to 2 more than it
      if (this.game.player == player){
        this.updateStatusAndListCards(`Pick a card to trash in exchange for a new card worth up to 2 more`);
        this.attachCardboxEvents(function(card){
          we_self.removeCardFromHand(card);
          we_self.addMove(`trash\t${player}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`);
          we_self.acquireCard(we_self.deck[card].cost + 2);
        });
      }
      return 0;
    }
    //**
    if (card_to_play == "sentry"){
      //+1 Card +1 Action, Look at the top 2 cards of your deck. Trash and/or discard any number of them. Put the rest back on top in any order
      this.game.queue.push(`sentry\t${player}`);
      this.game.state.actions++;
      this.game.queue.push(`POOLDEAL\t${player}\t2\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`)
    }
    //**
    if (card_to_play == "smithy"){
      //+3 Cards      
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t3`)
    }
    if (card_to_play == "spy"){
      //+1 Card +1 Action, Each player (including you) reveals the top card of their deck and either discards it or puts it back, your choice.
      this.game.state.action++;
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`) 
    }
    if (card_to_play == "thief"){
      //Each other player reveals the top 2 cards of their deck. If they revealed any Treasure cards, you choose one to trash. You may gain any and all of these trashed cards. Other revealed cards are discarded.      
    }
    //**
    if (card_to_play == "throneroom"){
      //You may play an Action card from your hand twice  
      this.game.state.throneroom = true;
    }
    //**
    if (card_to_play == "vassal"){
      //+2 Coin, Discard the top card of your deck. If it's an Action card, you may play it.
      this.game.state.coins += 2;
      this.game.queue.push(`vassal\t${player}`);
      this.game.queue.push(`POOLDEAL\t${player}\t1\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
    }
    //**
    if (card_to_play == "village"){
      //+1 Card, +2 Actions
      this.game.state.actions += 2;
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t1`)
    }
    //**
    if (card_to_play == "witch"){
      //+2 Cards, each other player gains a curse
      for (let i = 1; i <= this.game.players.length; i++){
        if (i !== player){
          this.game.queue.push(`buy\t${i}\tcurse`);
        }
      }
      this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t2`)
    }
    //**
    if (card_to_play == "woodcutter"){
      //+1 Buy, +2 Coins
      this.game.state.buys++;
      this.game.state.coins+=2;
    }
    //**
    if (card_to_play == "workshop"){
      //Gain a card costing up to 4
      if (this.game.player == player){
        this.acquireCard(4);
      }      
      return 0;
    }
    console.log("Did I process "+ card_to_play + " ?");
    console.log(JSON.parse(JSON.stringify(this.game.state)));
    return 1;
 }
       

  returnCardList(cardarray = [], deckid = 0) {
    let did = this.game.player - 1;
    if (cardarray.length == 0){
      for (let i = 0; i < this.game.deck[did].hand.length; i++){
        cardarray.push(this.game.deck[did].cards[this.game.deck[did].hand[i]]);
      }  
    }
    return super.returnCardList(cardarray, did);
  }

  returnCardImage(cardname){
    //let cardname = this.game.deck[this.game.player-1].cards[card];
    if (this.deck[cardname]?.img){
      return `<img class="cardimg" src="/monarchy/img/cards/${this.deck[cardname].img}" />`;
    }else{
      return ""; 
    }
    
  }

  ////////////////////
  // Core Game Data //
  ////////////////////
  returnState() {

    let state = {};
    state.supply = { };
    
    let numPlayers = this.game.players.length;
    state.supply.copper = 60 - 7*numPlayers;
    state.supply.silver = 40;
    state.supply.gold = 30;
    state.supply.estate = 12;
    state.supply.duchy = 12;
    state.supply.province = 12;
    state.supply.curse = 10 * (numPlayers-1); 

    state.buys = 1;
    state.actions = 1;
    state.coins = 0;
  
    return state;

  }

  returnFirstEd(){
    return ["cellar", "chapel", "moat", "chancellor", "woodcutter", "feast", "village", "workshop",
            "bureaucrat", "gardens", "militia", "moneylender", "spy", "remodel", "smithy",
            "throneroom", "thief", "councilroom", "festival", "laboratory", "library", 
            "market", "mine", "witch", "adventurer"];
  }

  returnSecondEd(){
    return ["cellar", "chapel", "moat", "harbinger", "merchant", "vassal", "village", "workshop",
            "bureaucrat", "gardens", "militia", "moneylender", "poacher", "remodel", "smithy",
            "throneroom", "bandit", "councilroom", "festival", "laboratory", "library", 
            "market", "mine", "sentry", "witch", "artisan"];
  }

  returnInitialHand(){
    let hand = {};
    for (let i = 1; i <= 7; i++){
      hand[i.toString()] = "copper";
    }
    for (let i = 8; i <= 10; i++){
      hand[i.toString()] = "estate";
    }

    return hand;
  }

  returnLastCard(){
    var deck = {};
    deck[this.lastCardKey] = this.lastCardValue;
    return deck;
  }

  returnCards() {

    var deck = {};

    deck['copper']    = { img : "copper.png" , name : "Copper", type : "treasure" , cost : 0 , text: "+1 Coin"};
    deck['silver']    = { img : "silver.png" , name : "Silver", type : "treasure" , cost : 3 , text: "+2 Coin"};
    deck['gold']      = { img : "gold.png" , name : "Gold", type : "treasure" , cost : 6 , text: "+3 Coin"};
    deck['estate']    = { img : "estate.png" , name : "Estate", type : "victory" , cost : 2 , text:"+1 VP"};
    deck['duchy']     = { img : "duchy.png" , name : "Duchy", type : "victory" , cost : 5 , text:"+3 VP"};
    deck['province']  = { img : "province.png" , name : "Province", type : "victory" , cost : 8 , text: "+6 VP"};
    deck['curse']     = { img : "curse.png" , name : "Curse", type : "treasure" , cost : 0 , text: "-1 VP"};
    deck['adventurer']= { img : "adventurer.png" , name : "Adventurer", type : "action" , cost : 6 , text: "Reveal cards from your deck until you reveal 2 Treasure cards. Put those into your hand and discard the other revealed cards."};
    deck['artisan']   = { img : "artisan.png" , name : "Artisan", type : "action" , cost : 6 , text: "Gain a card to your hand costing up to 5. Put a card from you hand onto your deck."};
    deck['bandit']    = { img : "bandit.png" , name : "Bandit", type : "action - attack" , cost : 5 , text: "Gain a gold. Each other player reveals the top 2 cards of their deck, trashes a revealed Treasure other than Copper, and discards the rest."};
    deck['bureaucrat']= { img : "bureaucrat.png" , name : "Bureaucrat", type : "action - attack" , cost : 4 , text: "Gain a Silver onto your deck. Each other player reveals a Victory card from their hand and puts it onto their deck (or reveals a hand with no Victory cards)."};
    deck['cellar']    = { img : "cellar.png" , name : "Cellar", type : "action" , cost : 2 , text: "+1 Action, Discard any number of cards, then draw that many."};
    deck['chancellor']= { img : "chancellor.png" , name : "Chancellor", type : "action" , cost : 3 , text: "+2 coin, You may immediately put your deck into your discard pile."};
    deck['chapel']    = { img : "chapel.png" , name : "Chapel", type : "action" , cost : 2 , text: "Trash up to 4 cards from your hand."};
    deck['councilroom'] = { img : "councilroom.png" , name : "Council Room", type : "action" , cost : 5 , text: "+4 Cards +1 Buy, Each other player draws a card"};
    deck['feast']       = { img : "feast.png" , name : "Feast", type : "action" , cost : 4 , text: "Trash this card. Gain a card costing up to 5"};
    deck['festival']    = { img : "festival.png" , name : "Festival", type : "action" , cost : 5 , text: "+2 Actions, +1 Buy, +2 Coin"};
    deck['gardens']     = { img : "gardens.png" , name : "Gardens", type : "victory" , cost : 4 , text: "+1 VP for 10 cards in deck"};
    deck['harbinger']   = { img : "harbinger.png" , name : "Harbinger", type : "action" , cost : 3 , text: "+1 Card, +1 Action, Look through your discard pile. You may put a card from it onto your deck."};
    deck['laboratory']  = { img : "laboratory.png" , name : "Laboratory", type : "action" , cost : 5 , text: "+2 Cards, +1 Action"};
    deck['library']     = { img : "library.png" , name : "Library", type : "action" , cost : 5 , text: "Draw until you have 7 cards in hand, skipping any Action cards you choose to. Set those aside to discard afterwards"};
    deck['market']      = { img : "market.png" , name : "Market", type : "action" , cost : 5 , text: "+1 Card +1 Action +1 Buy +1 Coin"};
    deck['merchant']    = { img : "merchant.png" , name : "Merchant", type : "action" , cost : 3 , text: "+1 Card +1 Action The first time you play a Silver this turn, +1 Coin"};
    deck['militia']     = { img : "militia.png" , name : "Militia", type : "action - attack" , cost : 4 , text: "+2 Coin, Each other play discards down to 3 cards in hand"};
    deck['mine']        = { img : "mine.png" , name : "Mine", type : "action" , cost : 5 , text: "You may trash a Treasure from your hand. Gain a treasure to your hand costing up to 3 more than it"};
    deck['moat']        = { img : "moat.png" , name : "Moat", type : "action - reaction" , cost : 2 , text: "+2 Cards, When another player plays an Attack card, you may first reveal this from your hand to be unaffected by it"};
    deck['moneylender'] = { img : "moneylender.png" , name : "Moneylender", type : "action" , cost : 4 , text: "You may trash a Copper from your hand for +3 Coin"};
    deck['poacher']     = { img : "poacher.png" , name : "Poacher", type : "action" , cost : 4 , text: "+1 Card, +1 Action, +1 Coin, Discard a card per empty Supply pile"};
    deck['remodel']     = { img : "remodel.png" , name : "Remodel", type : "action" , cost : 4 , text: "Trash a card from your hand. Gain a card costing up to 2 more than it"};
    deck['sentry']      = { img : "sentry.png" , name : "Sentry", type : "action" , cost : 5 , text: "+1 Card +1 Action, Look at the top 2 cards of your deck. Trash and/or discard any number of them. Put the rest back on top in any order"};
    deck['smithy']      = { img : "smithy.png" , name : "Smithy", type : "action" , cost : 4 , text: "+3 Cards"};
    deck['spy']         = { img : "spy.png" , name : "Spy", type : "action - attack" , cost : 4 , text: "+1 Card +1 Action, Each player (including you) reveals the top card of their deck and either discards it or puts it back, your choice."};
    deck['thief']       = { img : "thief.png" , name : "Thief", type : "action - attack" , cost : 4 , text: "Each other player reveals the top 2 cards of their deck. If they revealed any Treasure cards, you choose one to trash. You may gain any and all of these trashed cards. Other revealed cards are discarded."};
    deck['throneroom']  = { img : "throneroom.png" , name : "Throne Room", type : "action" , cost : 4 , text: "You may play an Action card from your hand twice"};
    deck['vassal']      = { img : "vassal.png" , name : "Vassal", type : "action" , cost : 3 , text: "+2 Coin, Discard the top card of your deck. If it's an Action card, you may play it."};
    deck['village']     = { img : "village.png" , name : "Village", type : "action" , cost : 3 , text: "+1 Card, +2 Actions"};
    deck['witch']       = { img : "witch.png" , name : "Witch", type : "action - attack" , cost : 5 , text: "+2 Cards, each other player gains a curse"};
    deck['woodcutter']  = { img : "woodcutter.png" , name : "Woodcutter", type : "action" , cost : 3 , text: "+1 Buy, +2 Coins"};
    deck['workshop']    = { img : "workshop.png" , name : "Workshop", type : "action" , cost : 3 , text: "Gain a card costing up to 4"};

    return deck;

  }


  returnGameRulesHTML(){
    let html = `<div class="rules-overlay">
    <h1>Monarchy</h1>
    <p>You are the ruler of a small kingdom with grand hopes and dreams. In all directions lie small tracts of land on the verge of a nervous breakdown. Pacify these lands under your banner and expand your kingdom, and do it quickly as other principalities are looking to expand. Hire minions, construct buildings, and fill the coffers of your treasury.</p>`;
    return html;
  }

  returnGameOptionsHTML(){
      let html = `
      <h1 class="overlay-title">Monarchy Options</h1>
        <div class="overlay-input">
          <label for="card_set">Prearranged Supplies:</label>
          <select name="card_set">
            <option value="random" selected default>None (Random)</option>
            <option value="firstgame">First Game</option>
            <option value="bigmoney">Big Money</option>
            <option value="interaction">Interaction</option>
            <option value="sizedistortion">Size Distortion</option>
            <option value="villagesquare">Village Square</option>
          </select>
        </div>
        <div class="overlay-input">
          <input type="checkbox" name="second" />
          <label for"second">Use Second Edition Cards</label>
        </div>
    `;
    return html;
  }








} // end Monarchy class

module.exports = Monarchy;



