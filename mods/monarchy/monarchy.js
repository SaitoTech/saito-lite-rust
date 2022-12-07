const GameTemplate = require('../../lib/templates/gametemplate');
const MonarchyGameRulesTemplate = require("./lib/monarchy-game-rules.template");
const MonarchyGameOptionsTemplate = require("./lib/monarchy-game-options.template");
const SaitoOverlay = require("../../lib/saito/new-ui/saito-overlay/saito-overlay");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Monarchy extends GameTemplate {

  constructor(app) {
    super(app);

    this.app             = app;

    this.name  		       = "Dominion";

    this.description     = `Strategy deck-building game: acquire money and land to assert dominion over the realm.`;
    this.status          = "Alpha";
    this.card_height_ratio = 1.6; // height is 1.6x width

    this.interface     = 1; //Display card graphics
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 4;
    this.game_length   = 20; //Estimated number of minutes to complete a game
    this.categories 	 = "Games Boardgame Strategy Deckbuilding";

    this.hud.mode = 0;  // long-horizontal
    //this.hud.enable_mode_change = 1;
    this.hud.card_width = 120;
    this.hud.respectDocking = true;
    this.attackOverlay = new SaitoOverlay(app, true, false);
    
    this.cards_in_play = [];
    this.is_testing = false;
    this.animation_queue = [];
    
    this.turn_count = 1;
    this.card_img_dir = `/${this.name.toLowerCase()}/img/cards`;
    this.card_back = "blank.jpg";
    this.last_discard = null;
    this.back_button_html = `<i class="fas fa-window-close" id="back_button"></i>`;
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

  returnWelcomeOverlay(){
   let html = `<div id="welcome_overlay" class="welcome_overlay splash_overlay rules-overlay">
           <img src="/${this.name.toLowerCase()}/img/welcome_splash.jpg"/>
               </div>`;
    return html;
  }

  showDecks(){
    this.menu.addMenuOption("game-decks", "Decks");
    
    for (let i = 1; i <= this.game.players.length; i++){
      let title = (this.game.player == i) ? "My Deck" : `Player ${i}'s Deck`;
      this.menu.addSubMenuOption("game-decks", {
        text : `Player ${i}${(this.game.player == i)?" (Me)":""}`,
        id : "decks-player-"+i,
        class : "decks-cards",
        callback : function(app, game_mod) {
           game_mod.menu.hideSubMenus();
           game_mod.overlay.show(game_mod.app, game_mod, game_mod.formatDeck(game_mod.game.state.decks[i], title)); 
        }
      });
    }
    this.menu.render(this.app, this);

    console.log(JSON.parse(JSON.stringify(this.game.state.decks)));
  }

 
 initializeHTML(app) {

    if (this.browser_active == 0) { return; }

    super.initializeHTML(app);

    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-rules",
      class : "game-rules",
      callback : function(app, game_mod) {
         game_mod.menu.hideSubMenus();
         game_mod.overlay.show(game_mod.app, game_mod, game_mod.returnGameRulesHTML()); 
      }
    });


    this.menu.addChatMenu(app, this);

    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.cardbox.render(app, this);
    this.cardbox.attachEvents(app, this);
    this.cardbox.makeDraggable();

    this.sizer.render(this.app, this);
    this.sizer.attachEvents(this.app, this, ".cardstacks");

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.skip_card_prompt = 0;
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("logcard", "", null);
    this.cardbox.addCardType("card", "", this.cardbox_callback);

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

    
    this.hud.render(app, this);
    this.hud.attachEvents(app, this);

    this.scoreboard.render(app, this);
    this.scoreboard.attachEvents(app, this);
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
    console.log("----------Dominion---------");
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

  if (this.browser_active){
     this.displayBoard();
     this.updateScore();
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

      //if (this.browser_active){
      //   this.displayBoard();
     // }
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
          supply = ["bandit", "bureaucrat", "spy", "thief", "witch", "moat", "adventurer", "library", "vassal", "harbinger"];
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

        this.turn_count++;

        //For the beginning of the game only...
        if (this.game.state.welcome == 0) {
          try {
            this.overlay.show(this.app, this, this.returnWelcomeOverlay());
            document.querySelector(".welcome_overlay").onclick = () => { this.overlay.hide(); };
          } catch (err) {}
          this.game.state.welcome = 1;
        }

        let player = parseInt(mv[1]);
        if (this.game.player == player){
          this.playerTurn();
        }else{
          $(".cardstacks").css("opacity", "1");
          this.displayBoard();
          this.sortHand();
          if (this.turn_count === 1){
            this.updateStatusWithNewDeal(`Waiting for Player ${player} to take their turn`, this.game.player - 1);
          }else{
            this.updateStatusAndListCards(`Waiting for Player ${player} to take their turn`);
          }
          
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
        if (deckidx == this.game.player){
          this.last_discard = this.game.deck[deckidx-1].cards[card];
        }
        this.game.queue.splice(qe, 1);
        return 1;
      }

      if (mv[0] == "trash"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let ckey = mv[2];
        let cvalue = mv[3];
        if (!mv[4]){
          this.updateLog(`Player ${player} trashes a ${this.cardToText(cvalue)}`);
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
          this.updateScore();
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

        this.clearActiveCards();
        
        console.log(this.game.player,player,JSON.parse(JSON.stringify(this.game.deck[player-1])));
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
          if (this.game.player == player){
            this.hud.updateStatusHeaderOnly(this.formatStatusHeader("Drawing a new hand..."));
            this.addMove("turn\t"+this.returnNextPlayer(player));
            this.turn_count = 0;
            //Deal 5 New Cards
            this.addMove(`SAFEDEAL\t${player}\t${player}\t5`);
                 
            //Discard all cards in hand
            for (let c of this.cards_in_play){
              this.addMove(`DISCARD\t${player}\t${c}`);
            }
            
            for (let j = this.game.deck[player-1].hand.length - 1; j >= 0; j--){
              this.removeCardFromHand(this.game.deck[player-1].cards[this.game.deck[player-1].hand[j]], ".discardpile", true);
              this.addMove(`DISCARD\t${player}\t${this.lastCardKey}`);
            }
            if (this.game.deck[player-1].hand.length > 0){
              console.error("Cards left in hand");
              console.log(JSON.parse(JSON.stringify(this.game.deck[player-1])));
            }
            this.cards_in_play = [];
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

        let code = this.getNextCardCode(player);
        //Manuall insert card into players discard pile
        this.game.deck[player-1].cards[code.toString()] = card_to_buy;
        if (direct_to_hand){
          this.game.deck[player-1].hand.push(code);
        }else if (add_to_deck){
          let cobj = {};
          cobj[code] = card_to_buy;
          this.game.queue.push(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(cobj)}`);
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
          this.updateScore();
        }

        //Animation
        if (!this.browser_active){return 1;}  
        const game_self = this;
       
        if (player !== this.game.player){
            $(`.cardstacks #${card_to_buy}.passivecard`).animate({bottom: '500px', left:"300px", opacity: '0.4'}, 1200, function(){
              $(this).remove();
            });    
        }else{

          if (card_to_buy === "curse" || !document.querySelector(`.cardstacks #${card_to_buy}.passivecard`)){
            this.displayCardInDiscard(card_to_buy);  
            return 1;
          }

          this.game.halted = 1;
          let callback = () => { this.restartQueue(); };
          if (direct_to_hand){
            callback = () => {
              $(".discardpile:last-child").fadeOut();
              this.hud.insertCard(html, () => { this.restartQueue();});
            }
          }
          /*if (add_to_deck){
            $(".discardpile:last-child").remove();
            $(".discardpile").append(this.flipCardHTML(card_to_buy));
            $(`.discardpile .flippable-card#${card_to_buy}`).addClass
          }*/
          this.animateGameElementMove(`.cardstacks #${card_to_buy}.passivecard`, ".discardpile", callback);
          return 0;
        }

        return 1;
      }

      if (mv[0] == "play"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let card_to_play = mv[2];
        let msg = "You";

        if (this.game.player !== player){
          msg = `Player ${player}`;
          this.displayCardInZone(card_to_play);
        }

        this.updateLog(`${msg} played ${this.cardToText(card_to_play)}`);

        return this.playCard(player, card_to_play);
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
        }
        return 1;
      }

      if (mv[0] == "update_hand"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let number = parseInt(mv[2]);
        
        if (this.game.player == player){
          let did = this.game.player - 1;

          //Make sure incoming moves from opponent are queued until the animation finishes
          this.game.halted = 1;

          for (let i = this.game.deck[did].hand.length - number; i < this.game.deck[did].hand.length; i++){
            let card_html = this.flipCardHTML(this.game.deck[did].cards[this.game.deck[did].hand[i]]);
            this.hud.insertCard(card_html, () => { 
              this.restartQueue();
            });
          }
        
          return 0;
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
          this.updateStatusAndListCards(`Select (${number}) cards to move to ${target}:`,[],optional);
          if (optional){
            this.bindBackButtonFunction(()=>{
              if (card_list.length > 0){
                we_self.addMove(`NOTIFY\tPlayer ${player} moved ${we_self.cardsToText(card_list)} to the their ${target}.`);  
              }
              we_self.endTurn();
              we_self.updateStatusAndListCards(`Finished moving cards to ${target}...`);
            });
          }
          this.attachCardboxEvents(function(card){
            number--;
            card_list.push(card);
            we_self.removeCardFromHand(card);

            switch(target){
              case "deck": we_self.addMove(`PUSHONDECK\t${mv[1]}\t${JSON.stringify(we_self.returnLastCard())}`); break;
              case "trash": we_self.addMove(`trash\t${mv[1]}\t${we_self.lastCardKey}\t${we_self.lastCardValue}\t1`); break;
              case "discards": we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`); break;
            }     
            if (number <= 0){
              we_self.addMove(`NOTIFY\tPlayer ${player} moved ${we_self.cardsToText(card_list)} to the their ${target}.`);
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
              this.removeCardFromHand("moat");
              this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
              this.addMove(`NOTIFY\tPlayer ${victim} is protected from ${this.cardToText(card_to_play)} by a ${this.cardToText("moat")}.`);
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
                  this.addMove(`augment\tPlayer ${victim} must discard two cards`);
                  break;
                case "thief":
                  this.addMove(`thief\t${player}\t${victim}\t`);
                  this.addMove(`SAFEPOOLDEAL\t${victim}\t2\t${victim}`);
                  this.addMove(`POOL\t${victim}`);
                  break;
                case "witch":
                  this.addMove(`augment\tPlayer ${victim} gains a curse\tcurse`);
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

        this.augmentAttackOverlay(`Player ${victim}'s top cards:`, ...top_cards);
        if (trash.length > 1){
          if (this.game.pool[victim-1].cards[trash[0]] == "silver"){
            discard.push(trash.shift());
          }else{
            discard.push(trash.pop());
          }
        }
        
        for (let t of trash){
          this.game.queue.push(`trash\t${victim}\t${t}\t${this.game.pool[victim-1].cards[t]}\t1`);
          this.game.queue.push(`NOTIFY\tPlayer ${mv[2]} trashes a ${this.cardToText(this.game.pool[victim-1].cards[t])} because of the ${this.cardToText("bandit")}`);
        }
        for (let t of discard){
          this.game.queue.push(`DISCARD\t${victim}\t${t}`);
          this.game.queue.push(`NOTIFY\tPlayer ${mv[2]} discards a ${this.cardToText(this.game.pool[victim-1].cards[t])} because of the ${this.cardToText("bandit")}`);
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
          this.removeCardFromHand(vpcards[0]);
          this.addMove(`PUSHONDECK\t${mv[2]}\t${JSON.stringify(this.returnLastCard())}`)
          this.addMove(`augment\tPlayer ${victim}\t${vpcards[0]}`);
          this.addMove(`NOTIFY\t${this.cardToText("bureaucrat")}: Player ${victim} puts a ${this.cardToText(vpcards[0])} back on top of the deck.`);
        }else{
          this.addMove(`augment\tPlayer ${victim} does not have a victory card in their hand\t${JSON.stringify(hand)}`);
          this.addMove(`NOTIFY\t${this.cardToText("bureaucrat")}: Player ${victim} does not have a victory card in their hand.`);
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
          this.updateStatusAndListCards(`Select a card to put on top of your deck or cancel (X):`,my_discards, true);
          $(".discardpile").fadeOut("fast");
          this.attachCardboxEvents(function(oldcard){
            console.log("DECK1:",JSON.parse(JSON.stringify(this.game.deck)));
            let index = my_discards.indexOf(oldcard);
            let card = {};
            card[my_keys[index]] = my_discards[index];
            delete we_self.game.deck[player-1].discards[my_keys[index]];
            this.addMove(`PUSHONDECK\t${player}\t${JSON.stringify(card)}`);
            console.log("DECK2:",JSON.parse(JSON.stringify(this.game.deck)));
            $(".discardpile").fadeIn("fast");
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

        if (this.game.pool[player-1].hand.length > 0){
          let c = this.game.pool[player-1].hand.pop();
          let cardname = this.game.pool[player-1].cards[c];
          if (this.deck[cardname].type.includes("action")){
            this.updateStatusWithOptions(`You drew ${this.cardToText(cardname)}:`, `<ul><li class="card nocard" id="keep">keep in hand</li><li class="card nocard" id="nope">set aside</li></ul>`);
            this.attachCardboxEvents(function (action){
              if (action == "keep"){
                this.game.deck[player-1].hand.push(c);  
                this.restartQueue();
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
          }
        }

        if (this.game.deck[player-1].hand.length == 7 || (this.game.state.shuffled && this.game.deck[player-1].crypt.length == 0)){
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
          
          this.addMove(`sentry\t${player}`);
          let html = `<ul>
                        <li class="card nocard" id="deck">deck</li>
                        <li class="card nocard" id="discards">discard</li>
                        <li class="card nocard" id="trash">trash</li>
                      </ul>`;
          this.updateStatusAndListCards("The top cards from your deck:",this.game.pool[player-1].hand.map(x=>this.game.pool[player-1].cards[x]),false);
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
        let player_display = (this.game.player === victim) ? "My top card:" : `Player ${victim}'s top card:`; 
        this.augmentAttackOverlay(player_display,card);

        if (this.game.player == spy){
          if (this.game.pool[victim-1].hand.length == 0){
            this.endTurn();
            return;
          }
          let html = `<ul>
                        <li class="card nocard" id="deck">move back to deck</li>
                        <li class="card nocard" id="discards">discard</li>
                      </ul>`;

          we_self.updateStatusWithOptions(`${player_display}: ${we_self.cardToText(card)}`, html, false);
          we_self.attachCardboxEvents(function(action){
            we_self.removeCardFromPool(card, victim);
            if (action == "deck"){
              we_self.addMove(`PUSHONDECK\t${victim}\t${JSON.stringify(we_self.returnLastCard())}`);
              we_self.addMove(`NOTIFY\t${we_self.cardToText("spy")}: Player ${victim} reveals a ${we_self.cardToText(card)} and puts it back on top of the deck.`);
            }else{
              we_self.addMove(`DISCARD\t${mv[1]}\t${we_self.lastCardKey}`);
              we_self.addMove(`NOTIFY\t${we_self.cardToText("spy")}: Player ${victim} discards a ${we_self.cardToText(card)}.`);
            }

            we_self.endTurn();
          });
        }else{
          this.removeCardFromPool(card, victim);
          this.updateStatusAndListCards(`${this.cardToText("spy")}: Player ${spy} deciding what to do with ${player_display.toLowerCase()}`);
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
        this.addMove(`NOTIFY\t${this.cardToText("thief")}: Player ${victim} reveals ${this.cardToText(cards[0])} and ${this.cardToText(cards[1])}`);
        this.endTurn();
        this.updateStatusAndListCards(`A ${this.cardToText("thief")} is rummaging through your deck...`);
        return 0;
      }

      if (mv[0] == "thief2"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        let victim  = parseInt(mv[2]);
        let card1 = mv[3];
        let card2 = mv[4];

        let name = (this.game.player == victim) ? "Your" : `Player ${victim}'s`;
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
          this.addMove(`NOTIFY\tPlayer ${victim} trashes a ${this.cardToText(this.lastCardValue)} because of the ${this.cardToText("thief")}`);
          if (tcards[0] == card1){
            this.removeCardFromPool(card2, victim);
          }else{
            this.removeCardFromPool(card1, victim);
          }
          this.addMove(`DISCARD\t${victim}\t${this.lastCardKey}`);
          this.endTurn();
        }else{
          this.updateStatusAndListCards(`Choose a card from Player ${victim} to trash:`,tcards);
          this.attachCardboxEvents(function(card){
            this.addMove(`thief3\t${mv[1]}\t${mv[2]}\t${card}`);
            this.removeCardFromPool(card, victim);
            this.addMove(`trash\t${victim}\t${this.lastCardKey}\t${this.lastCardValue}\t1`);
            this.addMove(`NOTIFY\tPlayer ${victim} trashes a ${this.cardToText(this.lastCardValue)} because of the ${this.cardToText("thief")}`);
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
                `<ul><li class="card nocard" id="yes">yes, keep</li><li class="card nocard" id="no">no, trash</li></ul>`);
            this.attachCardboxEvents(function (action){
              if (action == "yes"){
                we_self.addMove(`NOTIFY\tPlayer ${player} decides to keep Player ${victim}'s ${this.cardToText(card)}`);
                we_self.addMove(`buy\t${player}\t${card}`);
                we_self.addMove(`create\t${card}`); //A hack to tell players to increment supply
              }
              we_self.endTurn();
            });
          }
        }else{
          this.displayDecks();
        }
        return 0;
      }


      if (mv[0] == "vassal"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1]);
        if (this.game.player == player){
          let c = this.game.pool[player-1].hand[0];
          let cname = this.game.pool[player-1].cards[c];

          this.displayCardInDiscard(cname);

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
              we_self.addMove(`NOTIFY\tPlayer ${mv[1]} discards a ${we_self.cardToText(cname)}`);
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


  playerTurn(){
    let we_self = this;
    this.sortHand();

    if ((this.game.state.throneroom || this.game.state.actions > 0) && this.hasActionCard()){
      this.cardbox.detachCardEvents();
      $(".cardstacks").css("opacity", "0");
      $(".showcard").removeClass("showcard");
      this.updateStatusAndListCards(`Pick a card to play${this.game.state.throneroom?" twice":""}`,[],true);
      this.attachCardboxEvents(function(action){
        if (we_self.deck[action].type.includes("action")){
          we_self.removeCardFromHand(action, "#active_card_zone"); 
          we_self.cards_in_play.push(we_self.lastCardKey); //In lieau of discard
          we_self.updateStatusAndListCards(`Playing ${we_self.cardToText(action)}...`);
          //we_self.addMove(`DISCARD\t${we_self.game.player}\t${we_self.lastCardKey}`);
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
      this.bindBackButtonFunction(()=>{
        we_self.game.state.actions = 0;
        we_self.endTurn();
      });
      return;
    }

    this.game.state.actions = 0;
    
    if (this.game.state.buys > 0){

      let available_coins = this.countMoney();
      this.updateStatusAndListCards(`You have ${available_coins} coins and ${this.game.state.buys} card${(this.game.state.buys>1)?"s":""} to buy`,[],true);
      this.filterBoardDisplay(available_coins);
      this.cardbox.addCardType("buyme","buy", function(newcard){
        if (we_self.game.state.supply[newcard] <= 0){
          we_self.displayModal(`No ${we_self.cardToText(newcard)} available!`);
          return;
        }
        if (we_self.deck[newcard].cost <= available_coins){
          we_self.cardbox.removeCardType("buyme");
          we_self.addMove(`buy\t${we_self.game.player}\t${newcard}`);
          we_self.addMove(`NOTIFY\tPlayer ${we_self.game.player} bought a ${we_self.cardToText(newcard)}.`);
          we_self.game.state.buys--;
          available_coins -= we_self.deck[newcard].cost;
          we_self.spendMoney(we_self.deck[newcard].cost);
          we_self.endTurn();
        }
      });
      this.attachCardboxEvents();

      this.bindBackButtonFunction(()=>{
        we_self.game.state.buys = -1;
        we_self.endTurn();
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
    this.updateStatus(this.formatStatusHeader(`You may select a card worth up to ${max_value}`));
    this.filterBoardDisplay(max_value);

    this.cardbox.addCardType("buyme","take", function(newcard){
      if (we_self.game.state.supply[newcard] <= 0){
        we_self.displayModal(`No ${we_self.cardToText(newcard)} available!`);
        return;
      }
      if (we_self.deck[newcard].cost <= max_value){
        we_self.cardbox.removeCardType("buyme");
        we_self.addMove(`buy\t${we_self.game.player}\t${newcard}\t${target}`);
        we_self.addMove(`NOTIFY\tPlayer ${we_self.game.player} acquired a ${we_self.cardToText(newcard)}.`);
        we_self.endTurn();
      }
    });
    this.attachCardboxEvents();

  }

  returnAttackOverlay(card){
    let html = `<div class="attack_overlay">
                  <div class="h2">Attack! -- ${this.deck[card].name}</div>
                  <div class="overlay_content">
                    <div class="overlay-img">${this.returnCardImage(card)}</div>
                    <div class="attack_details"></div>
                  </div>
                </div>`;

    return html;
  }

  augmentAttackOverlay(text, ...cards){
    let rCol = document.querySelector(".attack_details");
    if (!rCol){ return; }
    let html = rCol.innerHTML;
    if (text){
      html += `<div class="overlay-msg">${text}</div>`;
    }
    for (let i = 0; i < cards.length; i++){
      html += `<div class="aoc">${this.returnCardImage(cards[i])}</div>`;
    }
    rCol.innerHTML = html;
    this.attackOverlay.show(this.app, this);
  }

  displayCardInZone(card){
    $(this.returnCardImage(card)).hide().appendTo("#active_card_zone").fadeIn();
  }

  clearActiveCards(){
    if (!this.browser_active){return;}

    $("#active_card_zone").children().fadeOut("slow", function() {
            $("#active_card_zone").html("") ;
          });
  }

  displayCardInDiscard(c){

    //Show temporary discard
    let shift = Object.keys(this.game.deck[this.game.player-1].discards) + 1;
    $(`<img src="/${this.name.toLowerCase()}/img/cards/${this.deck[c].img}" style="bottom:${shift}px;right:${shift}px;">`).hide().appendTo(".discardpile").slideDown();

  }


  displayBoard(){
    console.log("Redrawing board");
    let html = "";
    let cardClass = " showcard";
    for (let c in this.game.state.supply){
      if (c !== "curse"){
        html += `<div class="cardpile tip${cardClass}" id="${c}">`;
        let count = this.game.state.supply[c]; 
        if (count > 0){
          for (let i = 0; i < count - 1; i++){
            let shift = (count > 12) ? i : i*2;
            html += `<img src="/${this.name.toLowerCase()}/img/cards/${this.deck[c].img}" style="bottom:${shift}px;right:${shift}px;">`;  
          }
            let shift = (count > 12) ? count : count*2;
          html += `<img class="passivecard" id="${c}" src="/${this.name.toLowerCase()}/img/cards/${this.deck[c].img}" style="bottom:${shift}px;right:${shift}px;">`;
          html += `<div class="tiptext">Remaining Supply: ${this.game.state.supply[c]}</div>`;
        }else{
          //html += `<img class="passivecard" src="/${this.name.toLowerCase()}/img/cards/blank.jpg">`;
          html += `<div class="tiptext">No more ${this.cardToText(c,true)}</div>`;
        }
        html += "</div>";  
      }
    }

    html += `<i id="board-display" class="board-display fas fa-recycle"></i>`;

    if (document.querySelector(".cardstacks")){
      $(".cardstacks").html(html);
    }else{
      this.app.browser.addElementToId(`<div class="cardstacks">${html}</div>`, "main");
      $(".cardstacks").draggable();
    }
    this.attachCardboxEvents();

    //Toggle card pile configuration

    $("#board-display").off();
    $("#board-display").on("click", ()=>{
      if ($(".cardstacks").hasClass("large")){
        $(".cardstacks").removeClass("large");
        $(".cardstacks").addClass("long");
      }else if ($(".cardstacks").hasClass("long")){
        $(".cardstacks").removeClass("long");
      }else{
        $(".cardstacks").addClass("large");
      }
    });

    this.displayDecks();
  }

  displayDecks(){
    //Show Discard/DrawPiles
    $(".animation_helper").remove();
    $(".animated_elem").remove();

    try{
      let html = `<div class="player_decks tip">`;
      html += `<div class="drawpile cardpile">`;
      for (let i = 0; i < this.game.deck[this.game.player-1].crypt.length; i++){
        html += `<img src="/${this.name.toLowerCase()}/img/cards/blank.jpg" style="bottom:${i}px;right:${i}px;">`;
      }
      html += `</div>
              <div class="discardpile cardpile">
      `;
      let shift = 0;
      for (let card in this.game.deck[this.game.player-1].discards){
        let c = this.game.deck[this.game.player-1].discards[card];
        html += `<img src="/${this.name.toLowerCase()}/img/cards/${this.deck[c].img}" style="bottom:${shift}px;right:${shift}px;">`;
        shift++;
      }
      html += `</div>
              <div class="tiptext">
                Deck: ${this.game.deck[this.game.player-1].crypt.length}, Discards: ${Object.keys(this.game.deck[this.game.player-1].discards).length}
              </div>
            </div>`

      if (document.querySelector(".player_decks")){
        this.app.browser.replaceElementBySelector(html, ".player_decks");
      }else{
        this.app.browser.addElementToId(html, "main");
      }
    }catch(err){
      console.error(err);
      console.log(JSON.parse(JSON.stringify(this.game.deck[this.game.player-1])));
    }
  }


  filterBoardDisplay(max){
    this.displayBoard();
    this.cardbox.detachCardEvents();
    $(".cardstacks").css("opacity", "1");
    $(".showcard").removeClass("showcard");
    for (let c in this.game.state.supply){
      if (c !== "curse"){
        if (this.deck[c].cost > max){
          $(`#${c}.cardpile img`).css("filter","brightness(0.45) grayscale(100%)");
        }else{
          $(`#${c}.cardpile img`).css("filter","brightness(0.95)");
          $(`#${c}.cardpile`).addClass("buyme");
        }
      }
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
      html += `<div class="score">${(i==this.game.player)?"Me":`Player ${i}`}: ${this.returnPlayerVP(i)}</div>`;
    }
    this.scoreboard.update(html);
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
    let pi = this.game.player-1;
    let used = [];
    for (let i = this.game.deck[pi].hand.length - 1; i >= 0; i--){
      let cardname = this.game.deck[pi].cards[this.game.deck[pi].hand[i]];
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

    const timeout = ms => new Promise(res => setTimeout(res, ms));

    for (let bill of used){
      this.removeCardFromHand(bill);

      //We need a little pause in execution so that the Jquery animation on the card removal
      //can complete before we loop around again and accidentally select the same card
      await timeout(150);

      this.cards_in_play.push(this.lastCardKey);
    }
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
  removeCardFromHand(card, target = ".discardpile", pause = false) {
    if (this.game.player === 0) { return; }
    let pi = this.game.player-1;

    for (let i = this.game.deck[pi].hand.length - 1; i >= 0 ; i--) {
      if (this.game.deck[pi].cards[this.game.deck[pi].hand[i]] === card) {
        this.lastCardKey = this.game.deck[pi].hand[i];
        this.lastCardValue = card;
        this.game.deck[pi].hand.splice(i, 1);

        let callback = null;
        if (pause) {
          this.game.halted = 1;
          this.gaming_active = 1;
          this.animation_queue.push("remove");

          callback = ()=> {
            this.animation_queue.shift();

            if (this.animation_queue.length == 0){
              this.gaming_active = 0;
              this.displayDecks();
              this.restartQueue();  
            }
          } 
        }  

        this.animateGameElementMove(`#status #${card}`, target, callback);

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
      this.attackOverlay.show(this.app, this, this.returnAttackOverlay(card_to_play));
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
        this.updateStatusAndListCards(`Select cards to discard (X to finish):`,[],true);
        this.bindBackButtonFunction(()=>{
          if (number > 0){
            we_self.prependMove(`draw\t${player}\t${number}`);  
          }
          we_self.endTurn();
          we_self.updateStatusAndListCards(`Dealing ${number} cards...`);
        });
        this.attachCardboxEvents(function(card){
          number++;
          we_self.removeCardFromHand(card);
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
        this.updateStatusWithOptions("Would you like to discard your deck (for an immediate reshuffle)?", html);
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
          this.updateStatusAndListCards(`You may trash a treasure to acquire one costing 3 more than it. (X to skip)`, tcards, true);
          this.attachCardboxEvents(function(tc){
            we_self.removeCardFromHand(tc);
            if (tc == "copper"){
              we_self.addMove(`buy\t${player}\tsilver\thand`);
            }else{
              we_self.addMove(`buy\t${player}\tgold\thand`);
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
    return super.returnCardList(cardarray, did);
  }

  returnCardImage(cardname){
    if (this.deck[cardname]?.img){
      return `<img class="cardimg" src="/${this.name.toLowerCase()}/img/cards/${this.deck[cardname].img}" />`;
    }else{
      return ""
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

  sortHand(){
    if (this.game.player == 0){ return; }
    this.game.deck[this.game.player-1].hand.sort((a,b) =>{
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
      if (c_a.cost < c_b.cost){
        return -1;
      }
      if (c_a.cost > c_b.cost){
        return 1;
      }
      return 0;
    });
    
  }


  returnGameRulesHTML(){
    return MonarchyGameRulesTemplate(this.app, this);
  }

  returnGameOptionsHTML(){
    return MonarchyGameOptionsTemplate(this.app, this);
  }


} // end Monarchy class

module.exports = Monarchy;



