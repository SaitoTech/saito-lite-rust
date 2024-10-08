const GameTemplate = require('../../lib/templates/gametemplate');
const ShogunGameRulesTemplate = require('./lib/core/rules.template');
const ShogunGameOptionsTemplate = require('./lib/core/options.template');
const SaitoOverlay = require('../../lib/saito/ui/saito-overlay/saito-overlay');
const ShopOverlay = require("./lib/overlays/shop");
const WelcomeOverlay = require("./lib/overlays/welcome");
const AttackOverlay = require('./lib/overlays/attack');
const htmlTemplate = require('./lib/core/game-html.template');

//
// TODO
//
// card-events		- should be defined as parts of the cards and then executed from the deck rather than hardcoded
//			in a separate location, which requires much more delicacy in keeping things in track and
//			upgrading / downgrading cards.
//

//////////////////
// CONSTRUCTOR  //
//////////////////
class Shogun extends GameTemplate {

constructor(app) {
    super(app);

    this.app             = app;

    this.name  		       = "Shogun";
    this.slug            = "shogun";
    this.description     = `Strategy deck-building game: acquire money and land to assert <em>dominion</em> over the realm.`;
    this.status          = "Alpha";
    this.card_height_ratio = 1.6; // height is 1.6x width

    this.interface     = 1; //Display card graphics
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 4;
    this.game_length   = 20; //Estimated number of minutes to complete a game
    this.categories 	 = "Games Cardgame Strategy Deckbuilding";

    this.hud.mode = 0;  // long-horizontal
    //this.hud.enable_mode_change = 1;
    this.hud.card_width = 120;
    this.hud.respectDocking = true;
    this.shop = new ShopOverlay(app, this);

    this.cards_in_play = [];
    this.is_testing = false;
    
    this.newDeal = 0;
    this.card_img_dir = `/${this.name.toLowerCase()}/img/cards`;
    
    this.card_back = "blank.jpg";
    this.back_button_html = `<i class="fas fa-window-close" aria-hidden="true"></i>`;
    this.menu_backup_callback = ()=>{this.endTurn();} //Default behavior
  }

  

  formatDeck(cardStats, title = ""){
    let html = `
      <div class="rules-overlay">
        <h1>${title}</h1>
        <div class="cardlist-container">`;

    for (let cardType in this.game.state.supply){
      if (cardStats[cardType]){
        html += `<div class="cardlist" style="width:${80+40*cardStats[cardType]}px">`;
        for (let i = 0; i < cardStats[cardType]; i++){
          html += this.returnCardImage(cardType);
        }
        html += "</div>";   
      }
    }

    html += "</div></div>";

    return html;
  }

  formatPlayer(player){
    let pkey = this.game.players[player-1];
    return this.app.keychain.returnUsername(pkey);
  }

  showDecks(){
    this.menu.addMenuOption("game-decks", "Decks");
    
    for (let i = 1; i <= this.game.players.length; i++){
      let title = (this.game.player == i) ? "My Deck" : `${this.formatPlayer(i)}'s Deck`;
      this.menu.addSubMenuOption("game-decks", {
        text : `${this.formatPlayer(i)}${(this.game.player == i)?" (Me)":""}`,
        id : "decks-player-"+i,
        class : "decks-cards",
        callback : function(app, game_mod) {
           game_mod.menu.hideSubMenus();
           game_mod.overlay.show(game_mod.formatDeck(game_mod.game.state.decks[i], title)); 
        }
      });
    }
    this.menu.render();

    console.log(JSON.parse(JSON.stringify(this.game.state.decks)));
  }

 
 async render(app) {

    if (this.browser_active == 0 || this.initialize_game_run) { return; }

    await this.injectGameHTML(htmlTemplate());

    await super.render(app);

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-rules",
      class : "game-rules",
      callback : function(app, game_mod) {
         game_mod.menu.hideSubMenus();
         game_mod.overlay.show(game_mod.returnGameRulesHTML()); 
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Score",
      id : "game-score",
      class : "game-score",
      callback : function(app, game_mod) {
         game_mod.menu.hideSubMenus();
         game_mod.overlay.show(game_mod.updateScore()); 
      }
    });


    this.menu.addChatMenu();
    this.menu.render();

    this.log.render();

    this.cardbox.render();

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.skip_card_prompt = 0;
    this.cardbox.show_exit_button = false;
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("logcard", "", null);
    this.cardbox.addCardType("playcard", "", this.cardbox_callback);

    //Test for mobile
    try {
      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        console.log("Mobile user!");
        this.hud.card_width = 100; //Smaller cards
        this.cardbox.skip_card_prompt = 0;
      } 
    } catch (err) {
      console.log("ERROR with Mobile: " + err);
    }

    if (this.game.player > 0){
      this.hud.render();  
    }

    $(".shop").on("click", ()=> {
      this.shop.render();
    });

}


  ////////////////
  // initialize //
  ////////////////
initializeGame(game_id) {


  this.deck = this.returnCards();

  if (this.game.status != "") { 
    this.updateStatusAndListCards(this.game.status); 
  }

  //
  // initialize
  //
  if (!this.game.state) {
    this.game.state = this.returnState();

    console.log("\n\n\n\n");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("------ INITIALIZE GAME ----");
    console.log(`----------${this.name}---------`);
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("\n\n\n\n");

    this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

    this.game.queue.push("turn\t1");
    this.game.queue.push("READY");

    /*
    Each player has their own deck that they draw from to build their hand.
    The deck's are cross encrypted to prevent look ahead
    When a player draws openly (to reveal card to all), they draw into a pool.
    Otherwise, they just have their secret hand.
    */
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

  this.augmentQueueCommands();

  if (this.browser_active){
     this.displayDecks();
  }
 
}





  //
  // Core Game Logic
  //
  handleGameLoop() {

    let we_self = this;
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    // QUEUE *** NOTE: We will pause execution unless the command explicitly returns 1. ****
    //////////////////////////////////////////////////////////////////////////////////////////
    if (this.game.queue.length > 0) {

      //console.log("LOOP DECK:",JSON.parse(JSON.stringify(this.game.deck)));
      //console.log("LOOP POOL:",JSON.parse(JSON.stringify(this.game.pool)));

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
        if (this.is_testing){
          supply = ["cellar", "merchant", "militia", "mine", "witch", "moat", "adventurer", "moneylender", "remodel", "smithy"];
        }
        supply.sort((a,b) =>{
          let c_a = this.deck[a];
          let c_b = this.deck[b];
          if (c_a.type < c_b.type){
            return -1;
          }
          if (c_a.type > c_b.type){
            return 1;
          }
          if (c_a.cost < c_b.cost){
            return -1;
          }
          if (c_a.cost > c_b.cost){
            return 1;
          }
          return 0;
        });

        while (supply.length > 0){
          let card = supply.shift();
          this.game.state.supply[card] = (this.is_testing)? 4: 10;
        }

        return 1;
      }

      if (mv[0] == "gameover"){
        let winner = [];
        let highScore = -1;
        let reason = "high score";
        
        this.showDecks();
        //Find High Score
        for (let i = 1; i <= this.game.players.length; i++){
          let score = this.returnPlayerVP(i);
          if (score > highScore){
            highScore = score;
          }
        }
        //Get Players with High Score
        for (let i = 1; i <= this.game.players.length; i++){
          if (this.returnPlayerVP(i) == highScore){
            winner.push(i);
          }
        }
        //Filter for least number of turns
        if (winner.length > 1){
          let leastMoves = 10000;
          reason += " and fewest moves";
          for (let j = 0; j < winner.length; j++){
            if (this.game.state.players[winner[j]-1].turns < leastMoves){
              leastMoves = this.game.state.players[winner[j]-1].turns;
            }
          }
          for (let j = winner.length-1; j >= 0; j--){
            if (this.game.state.players[winner[j]-1].turns > leastMoves){
              winner.splice(j,1);
            }
          }
        }
        if (winner.length == 1){
          this.endGame(this.game.players[winner[0]-1], reason);
        }else{
          this.endGame(winner.map(x=>this.game.players[x-1]), reason);  
        }
        
        return 0;
      }

      if (mv[0] == "turn"){
        if (!this.browser_active) {return 0;}

        //For the beginning of the game only...
        if (this.game.state.welcome == 0) {
          let welcome_overlay = new WelcomeOverlay(this.app, this);
          this.halted = 1;
          welcome_overlay.render();
          return 0;
        }

        this.displayDecks();

        let player = parseInt(mv[1]);
        if (this.game.player == player){
          this.playerTurn();
        }else{
          this.updateStatusAndListCards(`Waiting for ${this.formatPlayer(player)} to take their turn`);
          this.attachCardboxEvents(); 
        }

        return 0;
      }


      /*
      Wrap the deal function so we can animate new cards being added to the hand
      */
      if (mv[0] == "draw"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let number = parseInt(mv[2]);
        if (number > 0){
            
          this.game.queue.push(`update_hand\t${player}\t${number}`);

          this.game.queue.push(`SAFEDEAL\t${player}\t${player}\t${number}`);  

          if (this.game.player == player){
            
            let cardarray = [];
            for (let i = 0; i < this.game.deck[player-1].hand.length; i++){
             cardarray.push(this.game.deck[player-1].cards[this.game.deck[player-1].hand[i]]);
            }
            for (let i = 1; i <= number; i++){
              cardarray.push(`slot${i}`);
            }
            this.updateStatusAndListCards(`Dealing ${number} cards...`, cardarray);  
          }

        }
        return 1;
      }

      if (mv[0] == "update_hand"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let number = parseInt(mv[2]);
        
        if (this.game.player == player){
          this.newDeal = 0;
          let did = this.game.player - 1;

          //Make sure incoming moves from opponent are queued until the animation finishes
          this.game.halted = 1;

          this.displayDecks();
          $(".animation_helper").remove();

          console.log("Replacing cards in HUD");
          let displayedCards = document.querySelector("#controls .game-cardgrid").children;
          let slot = 1;
          let width = displayedCards[0].style.width;
          let height = displayedCards[0].style.height;
          for (let i = 0; i <= this.game.deck[did].hand.length; i++){
            if (displayedCards[i]?.id == `slot${slot}`){
              displayedCards[i].outerHTML = this.flipCardHTML(this.game.deck[did].cards[this.game.deck[did].hand[i]]);
              //Keep hud sizing!
              displayedCards[i].style.width = width;
              displayedCards[i].style.height = height;
              slot++;
            }
          }
          console.log("Flipping cards in HUD");
          this.flipCardAnimation();

          return 0;
        }

        return 1;
      }


      if (mv[0] == "trash"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let ckey = mv[2];
        let cvalue = mv[3];
        if (!mv[4]){
          this.updateLog(`${this.formatPlayer(player)} trashes a ${this.cardToText(cvalue)}`);
        }
        this.game.deck[player-1].removed[ckey] = cvalue;
        delete this.game.deck[player-1].cards[ckey];

        //Do a bit of extra processing to remember each players deck
        if (this.deck[cvalue].type == "victory"){
          let cobj = this.deck[cvalue];
          if (cvalue == "curse"){
            this.game.state.players[player-1].curses--;
          }else if (cvalue == "gardens"){
            this.game.state.players[player-1].gardens--;
          }else{
            this.game.state.players[player-1].vp -= parseInt(cobj.text);
          }
          //this.updateScore();
        }

        for (let card of document.querySelectorAll(".active_card_zone .card")){
          if (card.id == cvalue && !("destination" in card.dataset)){
            card.dataset.destination = "trash";
            return 1;
          }
        }

        return 1;        
      }

      if (mv[0] == "cleanup"){
        let player = parseInt(mv[1]);
        //Functions like resolve + end round
        this.game.queue.splice(qe-1, 2); //Get rid of turn
        this.game.state.players[player-1].turns++; //Marked that this player finished a turn
        this.game.state.buys = 1;
        this.game.state.actions = 1;
        this.game.state.coins = 0;
        this.game.state.shuffled = false;
        this.game.state.merchant = false;
        this.game.state.throneroom = false;


        //console.log(this.game.player,player,JSON.parse(JSON.stringify(this.game.deck[player-1])));
        
        //Check for end game
        if (this.gameOver()){
          this.game.queue.push("gameover");
          for (let p = 1; p <= this.game.players.length; p++){
            this.game.queue.push(`reportdeck\t${p}`);
            this.game.queue.push(`SAFEDEAL\t${p}\t${p}\t${Object.keys(this.game.deck[p-1].discards).length + this.game.deck[p-1].crypt.length}`);
          }
          this.updateStatus("Game over, determining winner...");
          return 1;
        }else{

          //Will add animation(s) to sequence
          this.clearActiveCards(player);

          if (this.game.player == player){
            this.hud.updateStatus("Clearing the table...");
            this.addMove("turn\t"+this.returnNextPlayer(player));
            
            this.addMove(`draw\t${player}\t5`);

            //Discard all cards in play
            for (let c of this.cards_in_play){
              this.addMove(`DISCARD\t${player}\t${c}`);
            }
            this.cards_in_play = [];

            //Discard remaining cards in hand
            for (let j = this.game.deck[player-1].hand.length - 1; j >= 0; j--){
              //Will add animation(s) to sequence
              this.discardCard(this.game.deck[player-1].cards[this.game.deck[player-1].hand[j]]);
              this.addMove(`DISCARD\t${player}\t${this.lastCardKey}`);
            }

            if (this.game.deck[player-1].hand.length > 0){
              console.error("Cards left in hand");
              console.log(JSON.parse(JSON.stringify(this.game.deck[player-1])));
            }


            this.runAnimationQueue(150);  
            
            //We submit the move while the animations are running...
            this.endTurn();
          }
          return 0;
          
        }

      }

      if (mv[0] == "reportdeck"){
        let player = parseInt(mv[1]);
        this.game.queue.splice(qe, 1);
        if (this.game.player == player){
          this.addMove("resolve");
          let numCards = this.game.deck[player-1].hand.length;
          for (let i = 0; i < numCards; i++){
            this.addMove(this.game.deck[player-1].cards[this.game.deck[player-1].hand[i]]);
          }
          this.addMove(`mycards\t${mv[1]}\t${numCards}`);
          this.endTurn();
        }
        return 0;
      }

      if (mv[0] == "mycards"){
        let player = parseInt(mv[1]);
        let expectedCount = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);
        if (!this.game.state.decks){
          this.game.state.decks = {};
        }
        this.game.state.decks[player] = {};

        let card = this.game.queue.pop();
        let cnt = 1;
        while (card != "resolve"){
          cnt++;
          if (!this.game.state.decks[player][card]){
            this.game.state.decks[player][card] = 0;
          }
          this.game.state.decks[player][card]++;
          card = this.game.queue.pop();
        }
        return 1;
      }

      if (mv[0] == "create"){
        this.game.state.supply[mv[1]]++; //Increase supply in game
        this.game.queue.splice(qe, 1);
        return 1;        
      }

      if (mv[0] == "buy"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card_to_buy = mv[2];
        let direct_to_hand = (mv[3] == "hand");
        let add_to_deck = (mv[3] == "deck");
        let animationDestination = "#discardpile";

        let code = this.getNextCardCode(player);
        //Manually insert card into players discard pile
        this.game.deck[player-1].cards[code.toString()] = card_to_buy;
        if (direct_to_hand){
          this.game.deck[player-1].hand.push(code);
          animationDestination = "#slot00";
          if (player == this.game.player){
            this.hud.insertCard(`<div id="slot00" class="card hud-card"></div>`);
          }
        }else if (add_to_deck){
          let cobj = {};
          cobj[code] = card_to_buy;
          this.game.queue.push(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(cobj)}`);
          animationDestination = "#drawpile";
        }else{
          this.game.deck[player-1].discards[code.toString()] = card_to_buy;
        }

        this.game.state.supply[card_to_buy]--; //Decrease supply in game

        //Do a bit of extra processing to remember each players deck
        if (this.deck[card_to_buy].type == "victory"){
          let cobj = this.deck[card_to_buy];
          if (card_to_buy == "curse"){
            this.game.state.players[player-1].curses++;
          }else if (card_to_buy == "gardens"){
            this.game.state.players[player-1].gardens++;
          }else{
            this.game.state.players[player-1].vp += parseInt(cobj.text);
          }
          //this.updateScore();
        }

        if (!this.browser_active){return 1;}  

        /*  
          Animate the purchase
        */

        this.game.halted = 1;
        let delay = 750;

        if (player !== this.game.player){
          this.updateStatus(`${this.formatPlayer(player)} bought a ${this.cardToText(card_to_buy)}`);
          animationDestination = ".purchase_zone";
          delay = delay * 2;
        }
          
        let element = this.createGameElement(this.returnCardImage(card_to_buy), ".shop", animationDestination);

        this.animationSequence.push({callback: this.moveGameElement, 
                                    params: [ element,  
                                              animationDestination, 
                                              {},
                                              ()=>{ this.finishAnimation();}
                                            ],
                                    delay});
          
        this.runAnimationQueue();
        

        return 0;
      }

      if (mv[0] == "play"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card_to_play = mv[2];
        let msg = "You";

        if (this.game.player !== player){
          msg = this.formatPlayer(player);
          $(`<div class="card showcard" id="${card_to_play}">${this.returnCardImage(card_to_play)}</div>`).hide().appendTo("#active_card_zone").fadeIn();
        }

        this.updateLog(`${msg} played ${this.cardToText(card_to_play)}`);

        return this.playCard(player, card_to_play);
      }

      if (mv[0] == "spend"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card = mv[2];

        if (this.game.player == player){
            this.animationSequence.push({callback: this.moveGameElement, 
                                 params: [this.copyGameElement(`#controls #${card}:not(.copied_elem)`), "#discardpile", {
                                  callback: ()=> { 
                                    let count = document.getElementById("discard_count");
                                    if (count){
                                      count.innerHTML = parseInt(count.innerHTML) + 1;
                                    }
                                 }}, null]});
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
          let card_list = [];
          if (number <= 0){
            this.endTurn();
            return 0;
          }
          this.hud.updateStatus(`<span id="status-content">Select (${number}) cards to move to ${target}:</span>`);
          //this.updateStatusAndListCards(`Select (${number}) cards to move to ${target}:`,[],optional);
          if (optional){
            this.bindBackButtonFunction(()=>{
              if (card_list.length > 0){
                we_self.addMove(`NOTIFY\t${this.formatPlayer(player)} moved ${we_self.cardsToText(card_list)} to the their ${target}.`);  
              }
              we_self.endTurn();
              we_self.updateStatusAndListCards(`Finished moving cards to ${target}...`);
            });
          }
          this.attachCardboxEvents(function(card){
            number--;
            card_list.push(card);

            switch(target){
              case "deck":  we_self.putCardOnDeck(card)
                            we_self.addMove(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(we_self.returnLastCard())}`); 
                            
                            break;
              case "trash": 
                            we_self.trashCard(card);
                            we_self.addMove(`trash\t${mv[1]}\t${we_self.lastCardKey}\t${we_self.lastCardValue}\t1`); 
                            
                            break;
              case "discards": 
                            we_self.discardCard(card);
                            we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`); 
                            
                            break;
            }     
            if (number <= 0){
              we_self.addMove(`NOTIFY\t${this.formatPlayer(player)} moved ${we_self.cardsToText(card_list)} to the their ${target}.`);
              we_self.endTurn();
            }
          });
        }
        return 0;
      }

      //Attack -- counter
      if (mv[0] == "attack"){
        let player = parseInt(mv[1]);
        let victim = parseInt(mv[2]);
        let card_to_play = mv[3];
        this.game.queue.splice(qe, 1);


        if (this.game.player == victim){
          //Spy Affects even the one who played it
          if (card_to_play == "spy"){
            this.addMove(`spy\t${player}\t${victim}`);
            this.addMove(`SAFEPOOLDEAL\t${victim}\t1\t${victim}`);
            this.addMove(`POOL\t${victim}`);   
            this.endTurn();
            return 0;
          }        

          //Other attacks only affect other players
          if (victim != player){
            if (this.hasCardInHand("moat")){
              this.addMove(`augment\tAttack nullified by Moat\tmoat`);
              this.discardCard("moat");
              this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
              this.addMove(`NOTIFY\t${this.formatPlayer(victim)} is protected from ${this.cardToText(card_to_play)} by a ${this.cardToText("moat")}.`);
            }else{
              switch(card_to_play){
                case "bandit":
                  this.addMove(`bandit\t${player}\t${victim}`);
                  this.addMove(`SAFEPOOLDEAL\t${victim}\t2\t${victim}`);
                  this.addMove(`POOL\t${victim}`);   
                  break;
                case "bureaucrat":
                  this.addMove(`bureaucrat\t${player}\t${victim}`);
                  break;
                case "militia":
                  this.addMove(`hand\t${victim}\t${this.game.deck[victim-1].hand.length-3}\tdiscards`);  
                  this.addMove(`augment\t${this.formatPlayer(victim)} must discard two cards`);
                  break;
                case "thief":
                  this.addMove(`thief\t${player}\t${victim}\t`);
                  this.addMove(`SAFEPOOLDEAL\t${victim}\t2\t${victim}`);
                  this.addMove(`POOL\t${victim}`);
                  break;
                case "witch":
                  this.addMove(`augment\t${this.formatPlayer(victim)} gains a curse\tcurse`);
                  this.addMove(`buy\t${victim}\tcurse`);
                  break;
              }
            }
          }
          this.endTurn();
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
        let top_cards = [];
        for (let c of this.game.pool[victim-1].hand){
          let cardname = this.game.pool[victim-1].cards[c];
          top_cards.push(cardname);
          if (this.deck[cardname].type == "treasure" && cardname !== "copper"){
            //Can Trash
            trash.push(c);
          }else{
            discard.push(c);
          }
        }

        this.augmentAttackOverlay(`${this.formatPlayer(victim)}'s top cards:`, ...top_cards);
        if (trash.length > 1){
          if (this.game.pool[victim-1].cards[trash[0]] == "silver"){
            discard.push(trash.shift());
          }else{
            discard.push(trash.pop());
          }
        }
        
        for (let t of trash){
          this.game.queue.push(`trash\t${victim}\t${t}\t${this.game.pool[victim-1].cards[t]}\t1`);
          this.game.queue.push(`NOTIFY\t${this.formatPlayer(mv[2])} trashes a ${this.cardToText(this.game.pool[victim-1].cards[t])} because of the ${this.cardToText("bandit")}`);
        }
        for (let t of discard){
          this.game.queue.push(`DISCARD\t${victim}\t${t}`);
          this.game.queue.push(`NOTIFY\t${this.formatPlayer(mv[2])} discards a ${this.cardToText(this.game.pool[victim-1].cards[t])} because of the ${this.cardToText("bandit")}`);
        }

        return 1;
      }

      if (mv[0] == "bureaucrat"){
        let card_player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        this.game.queue.splice(qe, 1);
        let vpcards = [];
        let hand = [];
        if (this.game.player !== victim){ return 0;}

        for (let c of this.game.deck[victim-1].hand){
          let cardname = this.game.deck[victim-1].cards[c];
          hand.push(cardname);
          if (this.deck[cardname].type == "victory" && cardname !== "curse"){
            vpcards.push(cardname);
          }
        }
        if (vpcards.length > 0){
          this.putCardOnDeck(vpcards[0]);
          this.addMove(`PUSHONDECK\t${mv[2]}\t${JSON.stringify(this.returnLastCard())}`)
          this.addMove(`augment\t${this.formatPlayer(victim)}\t${vpcards[0]}`);
          this.addMove(`NOTIFY\t${this.cardToText("bureaucrat")}: ${this.formatPlayer(victim)} puts a ${this.cardToText(vpcards[0])} back on top of the deck.`);
        }else{
          this.addMove(`augment\t${this.formatPlayer(victim)} does not have a victory card in their hand\t${JSON.stringify(hand)}`);
          this.addMove(`NOTIFY\t${this.cardToText("bureaucrat")}: ${this.formatPlayer(victim)} does not have a victory card in their hand.`);
        }
        this.endTurn();
        return 0;
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
          if (my_discards.length == 0){
            this.endTurn();
          }
          this.updateStatusAndListCards(`Select a card to put on top of your deck or cancel (X):`,my_discards);
          this.filterHud();
          $("#discardpile").fadeOut("fast");
          this.attachCardboxEvents(function(oldcard){
            console.log("DECK1:",JSON.parse(JSON.stringify(this.game.deck)));
            let index = my_discards.indexOf(oldcard);
            let card = {};
            card[my_keys[index]] = my_discards[index];
            delete we_self.game.deck[player-1].discards[my_keys[index]];
            this.addMove(`PUSHONDECK\t${player}\t${JSON.stringify(card)}`);
            console.log("DECK2:",JSON.parse(JSON.stringify(this.game.deck)));
            $("#discardpile").fadeIn("fast");
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

        this.updateStatusAndListCards(`${this.cardToText("library")}: Drawing to seven cards: `);

        //Stop Condition, draw to seven or until deck empty (with 1 reshuffle)
        if (this.game.deck[player-1].hand.length == 7 || (this.game.state.shuffled && this.game.deck[player-1].crypt.length == 0)){
          this.game.queue.splice(qe, 1);
          for (let c of this.game.pool[player-1].hand){
            this.addMove(`DISCARD\t${mv[1]}\t${c}`);
          }
          this.endTurn();
          return 0;
        }

        //Process the last drawn card
        if (this.game.pool[player-1].hand.length > 0){
          let c = this.game.pool[player-1].hand.pop();
          let cardname = this.game.pool[player-1].cards[c];
          if (this.deck[cardname].type.includes("action")){
            this.updateStatusWithOptions(`You drew ${this.cardToText(cardname)}:`, `<ul><li class="card nocard" id="keep">keep in hand</li><li class="card nocard" id="nope">set aside</li></ul>`);
            this.attachCardboxEvents(function (action){
              if (action == "keep"){
                this.game.deck[player-1].hand.push(c);  
                this.hud.insertCard(this.flipCardHTML(cardname), () => { this.restartQueue();});
              }else{
                this.game.pool[player-1].hand.unshift(c);  
                this.addMove(`POOLDEAL\t${mv[1]}\t1\t${mv[1]}`);
                this.endTurn();
              }
            });  
            return 0;
          }else{
            this.game.deck[player-1].hand.push(c);
            this.hud.insertCard(this.flipCardHTML(cardname), () => { this.restartQueue();});
            return 0;
          }
        }

        //Draw a card
        this.addMove(`POOLDEAL\t${mv[1]}\t1\t${mv[1]}`);

        //Shuffle (once)
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
          
          this.addMove(`sentry\t${player}`);
          let html = `<ul>
                        <li class="playcard nocard" id="deck">deck</li>
                        <li class="playcard nocard" id="discards">discard</li>
                        <li class="playcard nocard" id="trash">trash</li>
                      </ul>`;
          this.updateStatusAndListCards("The top cards from your deck:",this.game.pool[player-1].hand.map(x=>this.game.pool[player-1].cards[x]));
          this.filterHud();
          this.attachCardboxEvents(function(card){
            we_self.updateStatusWithOptions(`Move ${we_self.cardToText(card)} to:`, html, true);
            we_self.attachCardboxEvents(function(action){
              we_self.removeCardFromPool(card, player);
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

      if (mv[0] == "spy"){
        this.game.queue.splice(qe, 1);
        let spy = parseInt(mv[1]);
        let victim = parseInt(mv[2]);

        let card = (this.game.pool[victim-1].hand.length > 0) ? this.game.pool[victim-1].cards[this.game.pool[victim-1].hand[0]] : "Deck empty";
        let player_display = (this.game.player === victim) ? "My top card:" : `${this.formatPlayer(victim)}'s top card:`; 
        this.augmentAttackOverlay(player_display,card);

        if (this.game.player == spy){
          if (this.game.pool[victim-1].hand.length == 0){
            this.endTurn();
            return;
          }
          let html = `<ul>
                        <li class="playcard nocard" id="deck">move back to deck</li>
                        <li class="playcard nocard" id="discards">discard</li>
                      </ul>`;

          we_self.updateStatusWithOptions(`${player_display}: ${we_self.cardToText(card)}`, html, false);
          we_self.attachCardboxEvents(function(action){
            we_self.removeCardFromPool(card, victim);
            if (action == "deck"){
              we_self.addMove(`PUSHONDECK\t${victim}\t${JSON.stringify(we_self.returnLastCard())}`);
              we_self.addMove(`NOTIFY\t${we_self.cardToText("spy")}: ${this.formatPlayer(victim)} reveals a ${we_self.cardToText(card)} and puts it back on top of the deck.`);
            }else{
              we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              we_self.addMove(`NOTIFY\t${we_self.cardToText("spy")}: ${this.formatPlayer(victim)} discards a ${we_self.cardToText(card)}.`);
            }

            we_self.endTurn();
          });
        }else{
          this.removeCardFromPool(card, victim);
          this.updateStatusAndListCards(`${this.cardToText("spy")}: ${this.formatPlayer(spy)} deciding what to do with ${player_display.toLowerCase()}`);
        }
        return 0;
      }

      if (mv[0] == "thief"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        
        let cards = [];
        if (this.game.player !== victim){ return 0;}

        for (let c of this.game.pool[victim-1].hand){
          let cardname = this.game.pool[victim-1].cards[c];
            cards.push(cardname);
        }
        this.addMove(`thief2\t${mv[1]}\t${mv[2]}\t${cards[0]}\t${cards[1]}`);
        this.addMove(`NOTIFY\t${this.cardToText("thief")}: ${this.formatPlayer(victim)} reveals ${this.cardToText(cards[0])} and ${this.cardToText(cards[1])}`);
        this.endTurn();
        this.updateStatusAndListCards(`A ${this.cardToText("thief")} is rummaging through your deck...`, [cards[0], cards[1]]);
        return 0;
      }

      if (mv[0] == "thief2"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        let card1 = mv[3];
        let card2 = mv[4];

        let name = (this.game.player == victim) ? "Your" : `${this.formatPlayer(victim)}'s`;
        this.augmentAttackOverlay(`${name} top two cards:`,card1, card2);        
        if (this.game.player !== player){ return 0;}
        let tcards = [];
        if (this.deck[card1].type == "treasure"){
          tcards.push(card1);
        }
        if (this.deck[card2].type == "treasure"){
          tcards.push(card2);
        }
        if (tcards.length == 0){
          //Tell victim to discard both
          this.addMove(`thief3\t${mv[1]}\t${mv[2]}`);
          this.removeCardFromPool(card1, victim);
          this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
          this.removeCardFromPool(card2, victim);
          this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
          this.endTurn();
        }else if (tcards.length == 1){
          //Tell victim to discard one and trash one
          this.addMove(`thief3\t${mv[1]}\t${mv[2]}\t${tcards[0]}`);
          this.removeCardFromPool(tcards[0], victim);
          this.addMove(`trash\t${victim}\t${this.lastCardKey}\t${this.lastCardValue}\t1`);
          this.addMove(`NOTIFY\t${this.formatPlayer(victim)} trashes a ${this.cardToText(this.lastCardValue)} because of the ${this.cardToText("thief")}`);
          if (tcards[0] == card1){
            this.removeCardFromPool(card2, victim);
          }else{
            this.removeCardFromPool(card1, victim);
          }
          this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
          this.endTurn();
        }else{
          this.updateStatusAndListCards(`Choose a card from ${this.formatPlayer(victim)} to trash:`,tcards);
          this.filterHud("treasure");
          this.attachCardboxEvents(function(card){
            this.addMove(`thief3\t${mv[1]}\t${mv[2]}\t${card}`);
            this.removeCardFromPool(card, victim);
            this.addMove(`trash\t${victim}\t${this.lastCardKey}\t${this.lastCardValue}\t1`);
            this.addMove(`NOTIFY\t${this.formatPlayer(victim)} trashes a ${this.cardToText(this.lastCardValue)} because of the ${this.cardToText("thief")}`);
            if (card == card1){
              this.removeCardFromPool(card2, victim);
            }else{
              this.removeCardFromPool(card1, victim);
            }
            this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
            this.endTurn();
          });
        }

        return 0;
      }

      if (mv[0] == "thief3"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        let card = mv[3];
        if (this.game.player == player){
          if (card){
            this.updateStatusWithOptions(`Would you like to keep the ${this.cardToText(card)} from Player ${victim}?`,
                `<ul><li class="playcard nocard" id="yes">yes, keep</li><li class="playcard nocard" id="no">no, trash</li></ul>`);
            this.attachCardboxEvents(function (action){
              if (action == "yes"){
                we_self.addMove(`NOTIFY\t${this.formatPlayer(player)} decides to keep ${this.formatPlayer(victim)}'s ${this.cardToText(card)}`);
                we_self.addMove(`buy\t${player}\t${card}`);
                we_self.addMove(`create\t${card}`); //A hack to tell players to increment supply
              }
              we_self.endTurn();
            });
          }
        }
        return 0;
      }


      if (mv[0] == "vassal"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        if (this.game.player == player){
          let c = this.game.pool[player-1].hand[0];
          let cname = this.game.pool[player-1].cards[c];

          //this.displayCardInDiscard(cname);

          if (this.deck[cname].type.includes("action")){
            let html = `<ul><li class="card nocard" id="play">play</li><li class="card nocard" id="discards">discard</li></ul>`;
            we_self.updateStatusWithOptions(`You are discarding a ${we_self.cardToText(cname)}, play it first?`, html);
            we_self.attachCardboxEvents(function (action){
              we_self.removeCardFromPool(cname, player);
              if (action == "play"){
                we_self.addMove(`play\t${player}\t${cname}`);
              }else{
                we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              }
              we_self.endTurn();
            });
          }else{
            we_self.updateStatusWithOptions(`You discarded a ${we_self.cardToText(cname)}`, `<ul><li class="card nocard" id="discards">confirm</li></ul>`);
            we_self.attachCardboxEvents(function (action){
              we_self.removeCardFromPool(cname, player);
              we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              we_self.addMove(`NOTIFY\t${this.formatPlayer(mv[1])} discards a ${we_self.cardToText(cname)}`);
              this.endTurn();
            });
          }
        }
        return 0;
      }

      if (mv[0] == "augment"){
        this.game.queue.splice(qe, 1);
        let msg = mv[1];
        let card = mv[2];
        try{
          card = JSON.parse(card);
          this.augmentAttackOverlay(msg, ...card);
        }catch(err){
          this.augmentAttackOverlay(msg, card);
        }
        return 1;
      }

    } // if cards in queue
    
    return 0;

  }

  filterHud(filter = ""){
    document.querySelectorAll("#controls .card").forEach(card => {
      let cardid = card.id;
      if (filter === "" || this.deck[cardid].type == filter || this.deck[cardid].type.includes(filter)){
        card.classList.add("playcard");
      }else{
        card.classList.add("nonplayable");
      }
    });
  }


  playerTurn(){
    let we_self = this;
    
    //this.game.deck[this.game.player - 1].hand = this.sortHand(this.game.deck[this.game.player - 1].hand);

    if ((this.game.state.throneroom || this.game.state.actions > 0) && this.hasActionCard()){
      this.hud.back_button = true;
      this.updateStatusAndListCards(`Pick a card to play${this.game.state.throneroom?" twice":""}`);
      
      //Apply a filter to the cards in the hud
      this.filterHud("action");

      this.bindBackButtonFunction(()=>{
        we_self.game.state.actions = 0;
        we_self.endTurn();
      });

      this.attachCardboxEvents(function(action){
        if (we_self.deck[action].type.includes("action")){

          we_self.cards_in_play.push(we_self.lastCardKey); //In lieau of discard
          we_self.updateStatusAndListCards(`Playing ${we_self.cardToText(action)}...`);
          we_self.putCardInPlay(action);
          we_self.addMove(`play\t${we_self.game.player}\t${action}`);

          if (this.game.state.throneroom){
            this.game.state.throneroom = false;
            we_self.addMove(`play\t${we_self.game.player}\t${action}`);  
          }else{
            we_self.game.state.actions--;            
          }

          we_self.endTurn();
        }
      });

      return;
    }

    this.game.state.actions = 0;
    
    if (this.game.state.buys > 0){

      let available_coins = this.countMoney();

      this.updateStatusAndListCards(`You have ${available_coins} coins and ${this.game.state.buys} card${(this.game.state.buys>1)?"s":""} to buy`);
      this.shop.buyCard(`You have ${available_coins} coins and ${this.game.state.buys} card${(this.game.state.buys>1)?"s":""} to buy`, 
                        available_coins, 
                        true, 
                        (newcard) => {
                          if (we_self.deck[newcard].cost <= available_coins){
                            we_self.addMove(`buy\t${we_self.game.player}\t${newcard}`);
                            we_self.addMove(`NOTIFY\t${this.formatPlayer(we_self.game.player)} bought a ${we_self.cardToText(newcard)}.`);
                            we_self.game.state.buys--;
                            available_coins -= we_self.deck[newcard].cost;
                            we_self.spendMoney(we_self.deck[newcard].cost)
                            we_self.endTurn();
                            return;
                          }else{
                            console.error("Daniel bug 1");
                          }

                        });

      return;
    }

    this.addMove(`cleanup\t${this.game.player}`);
    this.endTurn();
  }

  getNextCardCode(player){
    let current_max = 0;
    for (let c in this.game.deck[player-1].cards){
      if (parseInt(c)>current_max){
        current_max = parseInt(c);
      }
    }
    return current_max + 1;
  }

  acquireCard(max_value, target = ""){
    let we_self = this;

    this.shop.buyCard(`You may select a card worth up to ${max_value}`, 
                      max_value, 
                      false, 
                      (newcard) => {
                        if (we_self.deck[newcard].cost <= max_value){
                          we_self.addMove(`buy\t${we_self.game.player}\t${newcard}\t${target}`);
                          we_self.addMove(`NOTIFY\t${we_self.formatPlayer(we_self.game.player)} acquired a ${we_self.cardToText(newcard)}.`);
                          we_self.endTurn();
                        }else{
                          console.error("Daniel bug 1");
                        }
                      });

  }


  augmentAttackOverlay(text, ...cards){
    let rCol = document.querySelector(".attack_details");
    if (!rCol){ return; }
    let html = rCol.innerHTML;
    if (text){
      html += `<div class="overlay-msg">${text}</div>`;
    }
    for (let i = 0; i < cards.length; i++){
      html += `<div class="overlay-img aoc">${this.returnCardImage(cards[i])}</div>`;
    }
    rCol.innerHTML = html;
  }


  clearActiveCards(player){
    if (!this.browser_active){return;}

    console.log("Clearing Active Card Zone");

    const resetHTML = () => {
      $("#active_card_zone").html("");
      this.finishAnimation();
    }

    let destination = (this.game.player === player) ? "#discardpile" : ".purchase_zone";
    
      Array.from(document.querySelectorAll("#active_card_zone div.card")).forEach(card => {
        let dd = destination;
        if (card.dataset?.destination == "trash"){
          dd = "#trash_can";
        }
        this.animationSequence.push({callback: this.moveGameElement,
                                     params: [this.copyGameElement(card), dd, {resize: 1, insert: 1}, resetHTML]});
      });      
  }

  /*
    displayCardInDiscard(c){

    //Show temporary discard
    let shift = Object.keys(this.game.deck[this.game.player-1].discards) + 1;
    $(`<img src="${this.card_img_dir}/${this.deck[c].img}" style="bottom:${shift}px;right:${shift}px;">`).hide().appendTo("#discardpile").slideDown();

  }*/



  displayDecks(){
    //Show Discard/DrawPiles
    console.log("Update decks");
    $(".animation_helper.done").remove();
    $(".animated_elem.done").remove();

    if (this.game.player == 0) { return; }

    try{
      let html = `<div id="drawpile" class="cardpile">
                    <div>Draw: ${this.game.deck[this.game.player-1].crypt.length}</div>`;
      for (let i = 0; i < this.game.deck[this.game.player-1].crypt.length; i++){
        if (this.game.deck[this.game.player-1].crypt.length - i <= 5){
          html +=   `<img id="draw${this.game.deck[this.game.player-1].crypt.length - i}" src="${this.card_img_dir}/blank.jpg" >`;  
        }else{
          html +=   `<img src="${this.card_img_dir}/blank.jpg" >`;  
        }
      }
      html +=   `</div>`;

      if (document.getElementById("drawpile")){
        this.app.browser.replaceElementBySelector(html, "#drawpile");
      }else{
        this.app.browser.addElementToId(html, "hud-body");
      }

      html = `<div id="discardpile" class="cardpile">
                <div>Discards: <span id="discard_count">${Object.keys(this.game.deck[this.game.player-1].discards).length}</span></div>`;
      let shift = 0;
      for (let card in this.game.deck[this.game.player-1].discards){
        let c = this.game.deck[this.game.player-1].discards[card];
        html += `<img src="${this.card_img_dir}/${this.deck[c].img}">`;
        shift++;
      }

      html += `</div>`;
      
      if (document.getElementById("discardpile")){
        this.app.browser.replaceElementBySelector(html, "#discardpile");
      }else{
        this.app.browser.addElementToId(html, "hud-body");
      }

      $(".hud-body").removeClass("hide-scrollbar");
      $(".hud").removeClass("hide-scrollbar");
    }catch(err){
      console.error(err);
    }
  }



  returnPlayerVP(player){
    if (!this.game.deck[player-1]?.cards){return 0;}

    let numCards = Object.keys(this.game.deck[player-1].cards).length;
    return this.game.state.players[player-1].vp + this.game.state.players[player-1].gardens * Math.floor(numCards/10) - this.game.state.players[player-1].curses; 
  }

  updateScore(){
    let html = "";
    for (let i = 1; i <= this.game.players.length; i++){
      html += `<div class="score">${(i==this.game.player)?"Me":`${this.formatPlayer(i)}`}: ${this.returnPlayerVP(i)}</div>`;
    }
    //this.scoreboard.update(html);
    return `<div class="game-scoreboard">${html}</div>`;
    
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
    if (this.game.player === 0) { return; }
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
    if (this.game.player === 0) { return; }
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
    if (this.game.player === 0) { return; }
    let bank = this.game.state.coins;
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

  async spendMoney(price){
    if (this.game.player === 0) { return; }
    let pi = this.game.player-1;
    let used = [];
    let available_money = this.sortHand(Array.from(this.game.deck[pi].hand));

    for (let i = available_money.length - 1; i >= 0; i--){
      let cardname = this.game.deck[pi].cards[available_money[i]];
      if (this.deck[cardname].type == "treasure"){
        if (parseInt(this.deck[cardname].text) <= price){
          used.push(cardname);
          price -= parseInt(this.deck[cardname].text);
        }
      }
    }
    if (price>0){
      if (price <= this.game.state.coins){
        this.game.state.coins -= price;
      }else{
        console.error("Overspending");
      }
    }

    for (let bill of used){
      this.removeCardFromHand(bill);
      this.addMove(`DISCARD\t${this.game.player}\t${this.lastCardKey}`);
      this.addMove(`spend\t${this.game.player}\t${bill}`)
    }

    this.updateStatus("Buying card...");
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

  cardsToText(cards){
    if (cards.length == 0){
      return "";
    }
    if (cards.length == 1){
      return this.cardToText(cards[0]);
    }
    let text = "";
    for (let c of cards){
      text += this.cardToText(c) + ", ";
    }
    return text.substring(0, text.length - 2);
  }

  /*
  Get the card out of the hand (but don't add it to the discards ...yet)
  */
  discardCard(card, callback){
    this.removeCardFromHand(card);

    if (callback) {
      this.animationSequence.push({callback: this.moveGameElement, 
                                   params: [this.copyGameElement(`#controls #${card}:not(.copied_elem)`), "#discardpile", {}, callback]});
    }else{
      this.moveGameElement(this.copyGameElement(`#controls #${card}:not(.copied_elem)`), "#discardpile", {});
    }  
  }

  putCardInPlay(card){
    this.removeCardFromHand(card);
    this.moveGameElement(this.copyGameElement(`#controls #${card}:not(.copied_elem)`), "#active_card_zone", {insert: 1});
  }

  putCardOnDeck(card){
    let we_self = this;
    this.removeCardFromHand(card);
    this.moveGameElement(this.copyGameElement(`#controls #${card}:not(.copied_elem)`), "#drawpile", {}, 
                       (elem)=>{
                          $(elem).remove();
                          $(we_self.flipCardHTML(card, false)).appendTo("#drawpile").toggleClass("flipped");
                        }); 
  }

  removeCardFromHand(card) {
    if (this.game.player === 0) { return; }
    let pi = this.game.player-1;

    for (let i = this.game.deck[pi].hand.length - 1; i >= 0 ; i--) {
      if (this.game.deck[pi].cards[this.game.deck[pi].hand[i]] === card) {
        this.lastCardKey = this.game.deck[pi].hand[i];
        this.lastCardValue = card;
        this.game.deck[pi].hand.splice(i, 1);

        return 1; //Only remove one copy
      }
    }
    console.log("Card not found");
  }

  removeCardFromPool(card, pool) {
    if (this.game.player == 0) { return; }
    for (let i = 0; i < this.game.pool[pool-1].hand.length; i++) {
      if (this.game.pool[pool-1].cards[this.game.pool[pool-1].hand[i]] == card) {
        this.lastCardKey = this.game.pool[pool-1].hand[i];
        this.lastCardValue = card;
        this.game.pool[pool-1].hand.splice(i, 1);
        return; //Only remove one copy
      }
    }
  }

 playCard(player, card_to_play){
    console.log("Playing card",player,card_to_play);
    console.log(JSON.parse(JSON.stringify(this.game.state)));
    we_self = this;

    //Attacks
    if (this.deck[card_to_play].type.includes("attack")){

      for (let i = 1; i <= this.game.players.length; i++){
        this.game.queue.push(`attack\t${player}\t${i}\t${card_to_play}`);
      }
    }
    //**
    if (card_to_play == "bandit"){
      //Gain a gold. Each other player reveals the top 2 cards of their deck, trashes a revealed Treasure other than Copper, and discards the rest.
      this.game.queue.push(`buy\t${player}\tgold`);
    }
    //**
    if (card_to_play == "bureaucrat"){
      //Gain a Silver onto your deck. Each other player reveals a Victory card from their hand and puts it onto their deck (or reveals a hand with no Victory cards)
      this.game.queue.push(`buy\t${player}\tsilver\tdeck`);
    }
   //**
    if (card_to_play == "militia"){
      //+2 Coin, Each other play discards down to 3 cards in hand
      this.game.state.coins += 2;
    }
    //**
    if (card_to_play == "spy"){
      //+1 Card +1 Action, Each player (including you) reveals the top card of their deck and either discards it or puts it back, your choice.
      this.game.state.actions++;
      this.game.queue.push(`draw\t${player}\t1`) 
    }
    if (card_to_play == "thief"){
      //Each other player reveals the top 2 cards of their deck. If they revealed any Treasure cards, you choose one to trash. You may gain any and all of these trashed cards. Other revealed cards are discarded.      
    }
    //**
    if (card_to_play == "witch"){
      //+2 Cards, each other player gains a curse
      this.game.queue.push(`draw\t${player}\t2`)
    }
 

    //Other Cards

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
        this.acquireCard(5, "hand");
      }
      return 0;
    }
    //**
    if (card_to_play == "cellar"){
      //+1 Action, Discard any number of cards, then draw that many.
      this.game.state.actions++;
      if (this.game.player == player){
        let number = 0;
        this.updateStatusAndListCards(`Select cards to discard (X to finish):`);
        this.bindBackButtonFunction(()=>{
          if (number > 0){
            we_self.prependMove(`draw\t${player}\t${number}`);  
          }
          we_self.endTurn();
          we_self.updateStatusAndListCards(`ing ${number} cards...`);
        });
        this.attachCardboxEvents(function(card){
          number++;
          we_self.discardCard(card);
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
        this.updateStatusWithOptions("Would you like to discard your deck (for an immediate shuffle)?", html);
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
          this.game.queue.push(`draw\t${i}\t1`);    
        }
      }
      this.game.queue.push(`draw\t${player}\t4`);
    }
    //**
    if (card_to_play == "feast"){
      //Trash this card. Gain a card costing up to 5
      if (this.game.player == player){
        this.acquireCard(5);
        this.addMove(`trash\t${player}\t${this.lastCardKey}\t${this.lastCardValue}`);
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
      this.game.queue.push(`draw\t${player}\t1`);
    }
    //**
    if (card_to_play == "laboratory"){
      //+2 Cards, +1 Action      
      this.game.state.actions++;
      this.game.queue.push(`draw\t${player}\t2`)
    }
    //**
    if (card_to_play == "library"){
      //Draw until you have 7 cards in hand, skipping any Action cards you choose to. Set those aside to discard afterwards
      this.game.state.shuffled = false;
      this.game.queue.push(`library\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
    }
    //**
    if (card_to_play == "market"){
      //+1 Card +1 Action +1 Buy +1 Coin
      this.game.state.actions++;
      this.game.state.buys++;
      this.game.state.coins++;
      this.game.queue.push(`draw\t${player}\t1`)
    }
    //**
    if (card_to_play == "merchant"){
      //+1 Card +1 Action The first time you play a Silver this turn, +1 Coin
      this.game.state.merchant = true;
      this.game.state.actions++;
      this.game.queue.push(`draw\t${player}\t1`)
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
          this.updateStatusAndListCards(`You may trash a treasure to acquire one costing 3 more than it. (X to skip)`, tcards);
          this.filterHud("treasure");
          this.attachCardboxEvents(function(tc){
            if (tc == "copper"){
              we_self.addMove(`buy\t${player}\tsilver\thand`);
            }else{
              we_self.addMove(`buy\t${player}\tgold\thand`);
            }
            we_self.trashCard(tc);
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
      this.game.queue.push(`draw\t${player}\t2`) 
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
                we_self.updateStatusAndListCards("Trashing a copper card...");
                we_self.game.state.coins += 3;
                we_self.trashCard("copper");
                we_self.addMove(`trash\t${player}\t${we_self.lastCardKey}\t${we_self.lastCardValue}`);
              }
              we_self.endTurn();
            });
        }else{
          return 1;
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
      for (let s in this.game.state.supply){
        if (this.game.state.supply[s]==0){
          num++;
        }
      }
      this.game.queue.push(`hand\t${player}\t${num}\tdiscards`);
      this.game.queue.push(`draw\t${player}\t1`);
    }
    //**
    if (card_to_play == "remodel"){
      //Trash a card from your hand. Gain a card costing up to 2 more than it
      if (this.game.player == player){
        this.updateStatusAndListCards(`Pick a card to trash in exchange for a new card worth up to 2 more`);
        this.filterHud();
        this.attachCardboxEvents(function(card){
          we_self.trashCard(card);
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
      this.game.queue.push(`SAFEPOOLDEAL\t${player}\t2\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
      this.game.queue.push(`draw\t${player}\t1`)
    }
    //**
    if (card_to_play == "smithy"){
      //+3 Cards      
      this.game.queue.push(`draw\t${player}\t3`)
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
      this.game.queue.push(`SAFEPOOLDEAL\t${player}\t1\t${player}`);
      this.game.queue.push(`POOL\t${player}`);
    }
    //**
    if (card_to_play == "village"){
      //+1 Card, +2 Actions
      this.game.state.actions += 2;
      this.game.queue.push(`draw\t${player}\t1`)
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
 
    return 1;
 }
  

  //!!!!!!!!!!!     DOESNT EXIST OR GET CALLED ANYMORE   !!!!!!!!!!!
  reshuffleNotification(playerDeck, discards){

    this.updateLog("Shuffling discards back into the deck..." + playerDeck);
    if (this.game.player == playerDeck){
      $("#drawpile div").html("");
      

      console.log("RESHUFFLE~");
      
      // IMPORTANT STEP!!!!
      discards = JSON.parse(discards);
      //================

      for (let card in discards){
        this.animationSequence.push({callback: this.moveGameElement,
                                      params: [this.createGameElement(this.flipCardHTML(discards[card], false), "#discardpile"), "#drawpile", 
                                      {
                                        callback: (id) => { $(`#${id} .flippable-card`).toggleClass("flipped");}, 
                                      },
                                      () => { this.finishAnimation(); 
                                              this.animationSpeed = 1500; },
                                      ]});    
      }

      this.animationSpeed = 500;
      this.runAnimationQueue(50);
      $("#discardpile").html("");
      return 0;
    }
    return 1;
  }


  returnDoubleSidedCardList(cardarray = [], deckid = 0){
    if (cardarray.length === 0) {
      for (let i = 0; i < this.game.deck[deckid].hand.length; i++){
        cardarray.push(this.game.deck[deckid].cards[this.game.deck[deckid].hand[i]]);
      }
    }

    if (cardarray.length === 0) {
      console.warn("No cards to render...");
      return "";
    }

    //console.log("cardarray length in returnCardList: " + cardarray.length);

    let html = "";
    for (let i = 0; i < cardarray.length; i++) {
      //console.log("card image: " + this.returnCardImage(cardarray[i], deckid));
      html += this.flipCardHTML(cardarray[i]);
    }
    return html;

  }

  flipCardHTML(card, facedown = true){
    return  `<div id="${card}" class="card hud-card flippable-card${facedown?"":" flipped"}">
              ${this.returnCardImage(card)}
              <img class="cardBack" src="${this.card_img_dir}/${this.card_back}">
             </div>`;
  }
    

  returnCardList(cardarray = [], deckid = 0) {
    let did = this.game.player - 1;
    if (cardarray.length == 0){
      for (let i = 0; i < this.game.deck[did].hand.length; i++){
        cardarray.push(this.game.deck[did].cards[this.game.deck[did].hand[i]]);
      }  
    }
    return super.returnCardList(cardarray, 1);
  }

  returnCardImage(cardname, fullSize = true){
    if (this.deck[cardname]?.img){
      if (fullSize){
        return `<img class="cardimg" src="${this.card_img_dir}/${this.deck[cardname].img}" />`;  
      }else{
        return `<img class="cardimg" src="/${this.name.toLowerCase()}/img/minicards/${this.deck[cardname].img}" />`;  
      }
    }else{
      return ""
    }
  }


  async flipCardAnimation(){
    
    for (card of $("#controls .game-cardgrid").children()) {
      $(card).addClass("flipped");
      await this.timeout(300);
    }
    
    this.finishAnimation();    
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

    state.welcome = 0;
    state.players = [];
    for (let i = 0; i < this.game.players.length; i++){
      let stats = {vp:3, gardens:0, curses:0, turns:0};
      state.players.push(stats);
    }

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

    deck['copper']    = { img : "copper.jpg" , name : "Copper", type : "treasure" , cost : 0 , text: "+1 Coin"};
    deck['silver']    = { img : "silver.jpg" , name : "Silver", type : "treasure" , cost : 3 , text: "+2 Coin"};
    deck['gold']      = { img : "gold.jpg" , name : "Gold", type : "treasure" , cost : 6 , text: "+3 Coin"};
    deck['estate']    = { img : "estate.jpg" , name : "Estate", type : "victory" , cost : 2 , text:"+1 VP"};
    deck['duchy']     = { img : "duchy.jpg" , name : "Duchy", type : "victory" , cost : 5 , text:"+3 VP"};
    deck['province']  = { img : "province.jpg" , name : "Province", type : "victory" , cost : 8 , text: "+6 VP"};
    deck['curse']     = { img : "curse.jpg" , name : "Curse", type : "victory" , cost : 0 , text: "-1 VP"};
    deck['adventurer']= { img : "adventurer.jpg" , name : "Adventurer", type : "action" , cost : 6 , text: "Reveal cards from your deck until you reveal 2 Treasure cards. Put those into your hand and discard the other revealed cards."};
    deck['artisan']   = { img : "artisan.jpg" , name : "Artisan", type : "action" , cost : 6 , text: "Gain a card to your hand costing up to 5. Put a card from you hand onto your deck."};
    deck['bandit']    = { img : "bandit.jpg" , name : "Bandit", type : "action - attack" , cost : 5 , text: "Gain a gold. Each other player reveals the top 2 cards of their deck, trashes a revealed Treasure other than Copper, and discards the rest."};
    deck['bureaucrat']= { img : "bureaucrat.jpg" , name : "Bureaucrat", type : "action - attack" , cost : 4 , text: "Gain a Silver onto your deck. Each other player reveals a Victory card from their hand and puts it onto their deck (or reveals a hand with no Victory cards)."};
    deck['cellar']    = { img : "cellar.jpg" , name : "Cellar", type : "action" , cost : 2 , text: "+1 Action, Discard any number of cards, then draw that many."};
    deck['chancellor']= { img : "chancellor.jpg" , name : "Chancellor", type : "action" , cost : 3 , text: "+2 coin, You may immediately put your deck into your discard pile."};
    deck['chapel']    = { img : "chapel.jpg" , name : "Chapel", type : "action" , cost : 2 , text: "Trash up to 4 cards from your hand."};
    deck['councilroom'] = { img : "councilroom.jpg" , name : "Council Room", type : "action" , cost : 5 , text: "+4 Cards +1 Buy, Each other player draws a card"};
    deck['feast']       = { img : "feast.jpg" , name : "Feast", type : "action" , cost : 4 , text: "Trash this card. Gain a card costing up to 5"};
    deck['festival']    = { img : "festival.jpg" , name : "Festival", type : "action" , cost : 5 , text: "+2 Actions, +1 Buy, +2 Coin"};
    deck['gardens']     = { img : "gardens.jpg" , name : "Gardens", type : "victory" , cost : 4 , text: "+1 VP for 10 cards in deck"};
    deck['harbinger']   = { img : "harbinger.jpg" , name : "Harbinger", type : "action" , cost : 3 , text: "+1 Card, +1 Action, Look through your discard pile. You may put a card from it onto your deck."};
    deck['laboratory']  = { img : "laboratory.jpg" , name : "Laboratory", type : "action" , cost : 5 , text: "+2 Cards, +1 Action"};
    deck['library']     = { img : "library.jpg" , name : "Library", type : "action" , cost : 5 , text: "Draw until you have 7 cards in hand, skipping any Action cards you choose to. Set those aside to discard afterwards"};
    deck['market']      = { img : "market.jpg" , name : "Market", type : "action" , cost : 5 , text: "+1 Card +1 Action +1 Buy +1 Coin"};
    deck['merchant']    = { img : "merchant.jpg" , name : "Merchant", type : "action" , cost : 3 , text: "+1 Card +1 Action The first time you play a Silver this turn, +1 Coin"};
    deck['militia']     = { img : "militia.jpg" , name : "Militia", type : "action - attack" , cost : 4 , text: "+2 Coin, Each other play discards down to 3 cards in hand"};
    deck['mine']        = { img : "mine.jpg" , name : "Mine", type : "action" , cost : 5 , text: "You may trash a Treasure from your hand. Gain a treasure to your hand costing up to 3 more than it"};
    deck['moat']        = { img : "moat.jpg" , name : "Moat", type : "action - reaction" , cost : 2 , text: "+2 Cards, When another player plays an Attack card, you may first reveal this from your hand to be unaffected by it"};
    deck['moneylender'] = { img : "moneylender.jpg" , name : "Moneylender", type : "action" , cost : 4 , text: "You may trash a Copper from your hand for +3 Coin"};
    deck['poacher']     = { img : "poacher.jpg" , name : "Poacher", type : "action" , cost : 4 , text: "+1 Card, +1 Action, +1 Coin, Discard a card per empty Supply pile"};
    deck['remodel']     = { img : "remodel.jpg" , name : "Remodel", type : "action" , cost : 4 , text: "Trash a card from your hand. Gain a card costing up to 2 more than it"};
    deck['sentry']      = { img : "sentry.jpg" , name : "Sentry", type : "action" , cost : 5 , text: "+1 Card +1 Action, Look at the top 2 cards of your deck. Trash and/or discard any number of them. Put the rest back on top in any order"};
    deck['smithy']      = { img : "smithy.jpg" , name : "Smithy", type : "action" , cost : 4 , text: "+3 Cards"};
    deck['spy']         = { img : "spy.jpg" , name : "Spy", type : "action - attack" , cost : 4 , text: "+1 Card +1 Action, Each player (including you) reveals the top card of their deck and either discards it or puts it back, your choice."};
    deck['thief']       = { img : "thief.jpg" , name : "Thief", type : "action - attack" , cost : 4 , text: "Each other player reveals the top 2 cards of their deck. If they revealed any Treasure cards, you choose one to trash. You may gain any and all of these trashed cards. Other revealed cards are discarded."};
    deck['throneroom']  = { img : "throneroom.jpg" , name : "Throne Room", type : "action" , cost : 4 , text: "You may play an Action card from your hand twice"};
    deck['vassal']      = { img : "vassal.jpg" , name : "Vassal", type : "action" , cost : 3 , text: "+2 Coin, Discard the top card of your deck. If it's an Action card, you may play it."};
    deck['village']     = { img : "village.jpg" , name : "Village", type : "action" , cost : 3 , text: "+1 Card, +2 Actions"};
    deck['witch']       = { img : "witch.jpg" , name : "Witch", type : "action - attack" , cost : 5 , text: "+2 Cards, each other player gains a curse"};
    deck['woodcutter']  = { img : "woodcutter.jpg" , name : "Woodcutter", type : "action" , cost : 3 , text: "+1 Buy, +2 Coins"};
    deck['workshop']    = { img : "workshop.jpg" , name : "Workshop", type : "action" , cost : 3 , text: "Gain a card costing up to 4"};

    return deck;

  }

  sortHand(hand){
    if (this.game.player == 0){ return; }
    hand.sort((a,b) =>{
      let c_a = this.deck[this.game.deck[this.game.player-1].cards[a]];
      let c_b = this.deck[this.game.deck[this.game.player-1].cards[b]];

      if (!c_a || !c_b){
        console.log(a, this.game.deck[this.game.player-1].cards[a]);
        console.log(b, this.game.deck[this.game.player-1].cards[b]);
        return 0;
      }
      if (c_a.type < c_b.type){
        return -1;
      }
      if (c_a.type > c_b.type){
        return 1;
      }
      if (c_a.cost > c_b.cost){
        return -1;
      }
      if (c_a.cost < c_b.cost){
        return 1;
      }
      return 0;
    });

    return hand;
    
  }


  returnGameRulesHTML(){
    return ShogunGameRulesTemplate(this.app, this);
  }

  returnAdvancedOptions() {
    return ShogunGameOptionsTemplate(this.app, this);
  }

  //Animation functions


  async finishAnimation(delay = 0, cont = true){
    console.info("Animation finished? Queues:", this.animation_queue.length, this.animationSequence.length);
    if (this.animation_queue.length + this.animationSequence.length === 0){
  
      if (delay){
        await this.timeout(delay);
      }
      //Tighten up display
      this.displayDecks();
      //Redraw controls with removed/added cards 
      //(so that things don't bounce back when we remove the classes that hide them during animation)
      this.updateStatusAndListCards();

      if (cont){
        this.restartQueue();    
      }else{
        this.halted = 0;
        this.endTurn();
      }
      
    }else{
      console.log("Nevermind, let's wait a bit");
    }
    
  }



  augmentQueueCommands(){

    //We double define DEAL so we can attach an animation while the players are communicating
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "DEAL") {
        let deckidx = parseInt(gmv[1]);
        let recipient = parseInt(gmv[2]);
        let cards = parseInt(gmv[3]);

        if (recipient == game_self.game.player && game_self.browser_active){
          game_self.displayDecks();

          console.log("ANIMATE CARD DEALING");

          for (let i = 0; i < cards; i++){
            let target = `#drawpile #draw${i+1}`;
            let destination = `#slot${++this.newDeal}`;
            game_self.animationSequence.push({callback: game_self.moveGameElement,
                                  params: [game_self.copyGameElement(target), destination, {insert:1}, () => { game_self.restartQueue(); }]});
          }
          game_self.runAnimationQueue(100);

          return 0;
        }
      }
      return 1;
    });

  }

  shuffleDeck(deckidx = 1){
    super.shuffleDeck(deckidx);

    if (deckidx == this.game.player){
      console.log("Shuffling my discards...");
    }
  }


} // end Shogun class



module.exports = Shogun;
