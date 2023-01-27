const GameTemplate = require('../../lib/templates/gametemplate');
const GameRulesTemplate = require("./lib/game-rules.template");
const GameOptionsTemplate = require("./lib/game-options.template");


//////////////////
// CONSTRUCTOR  //
//////////////////
class Steamed extends GameTemplate {

  constructor(app) {
    super(app);

    this.app             = app;

    this.name  		       = "Steamed";
    this.gamename        = "Steam Bonanza";

    this.description     = `Win the industrial revolution by building and liquidating factories`;
    this.status          = "Alpha";
    
    this.card_height_ratio = 1.5;

    this.interface     = 1; //Display card graphics
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 2;

    this.slug   = this.name.toLowerCase();
    this.card_img_dir = `/${this.slug}/img/cards/`;
    this.categories 	 = "Games Boardgame Cardgame";
    this.factory  = this.returnFactoryRules();
    this.animationSequence = [];
    //this.animationSpeed = 1500;
  }



  returnWelcomeOverlay(){
   let html = `<div id="welcome_overlay" class="welcome_overlay splash_overlay rules-overlay">
           <img src="/${this.name.toLowerCase()}/img/splash_welcome.jpg"/>
               </div>`;
   
    return html;
  }


 
 initializeHTML(app) {

    if (this.browser_active == 0) { return; }
    if (this.initialize_game_run) { return; }

    document.title = this.name;
    var s = document.createElement("link");
    s.rel = "stylesheet";
    s.type = "text/css";
    s.href = `/${this.name.toLowerCase()}/style.css`;
    document.querySelector('head').appendChild(s);

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

    this.menu.addChatMenu();
    this.menu.render();

    this.log.render();

    $(".score_card").css("background-image", `url('${this.card_img_dir}SB_reward.png')`);
    
}


  ////////////////
  // initialize //
  ////////////////
initializeGame(game_id) {

  if (this.game.status != "") { this.updateStatus(this.game.status); }

  //
  // initialize
  //
  if (!this.game.state) {

    this.game.state = {};
    Object.assign(this.game.state, this.returnState());

    console.log("\n\n\n\n");
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("------ INITIALIZE GAME ----");
    console.log(`-----------${this.name}----------`);
    console.log("---------------------------");
    console.log("---------------------------");
    console.log("\n\n\n\n");

    this.updateStatus("<div class='status-message'>Generating the Game</div>");

    this.game.queue = [];
    this.game.queue.push(`turn\t1`);
    this.game.queue.push("READY");

    //Main Deck
    this.game.queue.push("deal");
    this.game.queue.push("SIMPLEDEAL\t5\t1\t"+JSON.stringify(this.returnCards()));

  } 
}




  //
  // Core Game Logic
  //
  handleGameLoop() {

    let we_self = this;
    
    this.saveGame(this.game.id);

    console.log(JSON.parse(JSON.stringify(this.game.state)));

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      this.displayAll();
      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");

      /*
      Copy players hand into state.hand
      */
      if (mv[0] == "deal") {
        this.game.queue.splice(qe, 1);

        for (let i = this.game.deck[0].hand.length; i > 0 ; i--){
            let card = this.game.deck[0].hand.pop();
            card = this.game.deck[0].cards[card].type;
            this.game.state.hand.unshift(card);
            this.animationSequence.push({callback: this.createAndMove, 
                                params: [this.twoSidedCard(card), "#draw_deck", `#cardfan`, 
                                            (id)=>{ $(`#${id} .flipped`).removeClass("flipped"); $(`#${id}`).css("z-index", `${i}`).css("transform", `rotate(${10*i-40}deg) translateX(${50*i-150}px)`);}, 
                                            ()=>{ console.log("Next card"); this.finishAnimation(500);}]});

        }
        
        //Animate the draw
        if (this.browser_active && this.animationSequence.length > 0){
          this.runAnimationQueue();
          return 0;
        }else{
          this.animationSequence = [];
        }

        return 1;

      }

      if (mv[0] == "turn"){
        if (!this.browser_active) {return 0;}


        //For the beginning of the game only...
        if (this.game.state.welcome == 0) {
          try {
            this.overlay.show(this.app, this, this.returnWelcomeOverlay());
            document.querySelector(".welcome_overlay").onclick = () => { this.overlay.hide(); };
          } catch (err) {}
          this.game.state.welcome = 1;
        }

        if (this.browser_active){
           this.displayAll();
        }


        let player = parseInt(mv[1]);
        $(".active").removeClass("active");
        if (this.game.player === player){
          $("#self").addClass("active");
        }else{
          $("#opponent").addClass("active");
        }


        this.game.queue.splice(qe, 1);

        this.game.queue.push("checkgameover\t" + mv[1]);
        this.game.queue.push("deal");
        this.game.queue.push(`DEAL\t1\t${mv[1]}\t2`);
        this.game.queue.push("phase3\t" + mv[1]);
        this.game.queue.push("flush_market");
        this.game.queue.push("POOLDEAL\t1\t3\t1");
        this.game.queue.push("phase2\t" + mv[1]);

        this.game.state.planted = 0;

        return 1;
      }

      if (mv[0] === "gameover"){
        this.game.queue.splice(qe, 1);
        $("#opponent").remove();
        $("#self .field_slot").css("display", "none");
        $(".status").css("width", "");
        $(".cardfan").fadeOut();

        let i_won = false;       
        if (this.game.state.gold[0] == this.game.state.gold[1]){
          if (this.game.player == 2) { 
            i_won = true; 
         }
          this.endGame(this.game.players[1], "Second Player wins tie");
        }if (this.game.state.gold[0] > this.game.state.gold[1]){
          i_won = true;
          this.endGame(this.game.players[this.game.player-1], "High Score");
        }else{
          this.endGame(this.game.players[2-this.game.player], "High Score");
        }
        this.updateLog(`The Game is over and I ${i_won ? "won":"lost"}!`);
        return 0;
      }

      if (mv[0] == "checkgameover"){
        this.removeEvents();
        this.game.queue.splice(qe, 1);       
        if (this.game.deck[0].crypt.length == 0){
          $(".active").removeClass("active");
          $(".status").css("display", "block");

          this.updateStatus("<div class='status-message'>Liquidating remaining factories to tally final score</div>");
          this.game.queue.push("gameover");
          this.game.queue.push(`liquidate\t1\t1`);
          this.game.queue.push(`liquidate\t1\t2`);
          this.game.queue.push(`liquidate\t1\t3`);
          this.game.queue.push(`liquidate\t2\t1`);
          this.game.queue.push(`liquidate\t2\t2`);
          this.game.queue.push(`liquidate\t2\t3`);

        }else{
          this.game.queue.push("turn\t" + this.returnNextPlayer(parseInt(mv[1])));
        }
        return 1;
      }

      if (mv[0] === "phase3"){

        let player = parseInt(mv[1]);

        if (this.game.player == player){
          $(".status").css("display", "block");
          this.playerTurn();
        }else{
          this.removeEvents();
          $(".status").css("display", "none");
        }
        return 0;

     }

     if (mv[0] === "flush_market"){
        this.game.queue.splice(qe, 1);
        let message = "";
        while (this.game.state.market.length > 0){
          let card = this.game.state.market.shift();
          message += card + ", ";
          this.game.state.discards.push(card);
        }

        this.game.state.planted = 3;
        console.log(JSON.stringify(this.game.state.discards));

        if (message){
          message = message.substring(0, message.length-2);
          this.updateLog(message + " are discarded from the offers.");
          Array.from(document.querySelectorAll(".offer img")).forEach(async c => {
            this.animateGameElementMove(c, "#discards", ()=>{this.dealCard();});
            await this.timeout(250);
          });
        }else{
          this.dealCard();
        }

        return 0;
     }

     if (mv[0] === "phase2"){

      let player = parseInt(mv[1]);

      if (this.game.player === player){
        $(".status").css("display", "block");
        this.playerTurn();
      }else{
        this.removeEvents();
        $(".status").css("display", "none");
      }
      return 0;

     }    

     // A slight variation of the resolve command
     if (mv[0] === "continue"){
      //Remove the "continue"
      this.game.queue.pop();

      //Remove the next step
      let nextMove = this.game.queue.pop();

      if (nextMove && nextMove.substring(0,5) !== "phase"){
        console.warn("Unexpected queue order for CONTINUE", nextMove);
        this.game.queue.push("continue");
        this.game.queue.push(nextMove);
      }

      return 1;
     }

     if (mv[0] === "plant"){
      let player = parseInt(mv[1]);
      let card = mv[2];
      let slot = parseInt(mv[3]);
      let source = mv[4];

      this.game.queue.splice(qe, 1);


      this.updateLog(`${(this.game.player == player)? "You build": "Your Opponent builds"} a ${card} factory`);

      if (this.game.player !== player){
        this.game.state.opponent[slot].push(card);

        if (source === "market"){
          this.animateGameElementMove(`.offer .card[data-id="${card}"]`, `#o${slot+1}`, ()=>{this.finishAnimation();});
          for (let i = 0; i < this.game.state.market.length; i++){
            if (this.game.state.market[i] == card){
              this.game.state.market.splice(i,1);
              break;
            }
          }
        }else{
          $(this.cardToHTML(card)).hide().appendTo(`#o${slot+1}`).slideDown(1500, ()=>{this.finishAnimation();});
        }
        this.game.halted = 1;
        return 0;
      }

      return 1;
     }

     if (mv[0] === "liquidate"){
      let player = parseInt(mv[1]);
      let slot = parseInt(mv[2]) - 1; //ID from clicking field
      this.game.queue.splice(qe, 1);
      let steamSelf = this;
      let gold = this.calculateProfit(player, slot);

      //$("#deal").children().animate({left: "1000px"}, 1200, "swing", function(){$(this).remove();});
      let children = [];
      let destination = "";

      if(this.game.player === player){
        this.updateLog(`You sell ${this.game.state.self[slot].length} ${this.game.state.self[slot][0]} factories for ${gold} gold.`);
        for (let i = gold; i < this.game.state.self[slot].length; i++){
          this.game.state.discards.push(this.game.state.self[slot][0]);
        }
        
        if (document.querySelector(`#s${mv[2]} div.field_slot`)){
          document.querySelector(`#s${mv[2]} div.field_slot`).remove();
          $(this.cardToHTML(this.game.state.self[slot][0], 10*(this.game.state.self[slot].length-1))).appendTo(`#s${mv[2]}`);
        }

        this.game.state.self[slot] = [];

        children = document.querySelectorAll(`#s${mv[2]} img.card`);
        destination = "#my_score";
      }else{
        this.updateLog(`Your opponent sells ${this.game.state.opponent[slot].length} ${this.game.state.opponent[slot][0]} factories for ${gold} gold.`);
        for (let i = gold; i < this.game.state.opponent[slot].length; i++){
          this.game.state.discards.push(this.game.state.opponent[slot][0]);
        }

        if (document.querySelector(`#o${mv[2]} div.field_slot`)){
          document.querySelector(`#o${mv[2]} div.field_slot`).remove();
          $(this.cardToHTML(this.game.state.opponent[slot][0], 10*(this.game.state.opponent[slot].length-1))).appendTo(`#s${mv[2]}`);
        }
        this.game.state.opponent[slot] = [];

        children = document.querySelectorAll(`#o${mv[2]} img.card`);
        destination = "#opponent_score";
      }

      for (let i = 0; i < children.length; i++){
        children[i].id = `c${i}`; 
        console.log(JSON.stringify(children[i]));
        if (i < gold){
          this.animationSequence.unshift({callback: this.animateGameElementMove, params: [`#c${i}`, destination, ()=>{console.log("Discard2"); this.finishAnimation();}]});            
        }else{
          this.animationSequence.unshift({callback: this.animateGameElementMove, params: [`#c${i}`, `#discards`, ()=>{console.log("Discard1"); this.finishAnimation();}]});            
        }
      }

      this.game.state.gold[Math.abs(this.game.player - player)] += gold;

      this.runAnimationQueue();

      return 0;
     }

      return 1;
    } // if cards in queue
    
    return 0;

  }

  async runAnimationQueue(){
    console.log(`Sequencing ${this.animationSequence.length} Animations`);
    this.game.halted = 1;
    while (this.animationSequence.length > 0){
      let {callback, params} = this.animationSequence.shift();
      await this.timeout(500);
      callback.apply(this, params);
    }

  }
  async finishAnimation(delay = 0){
    //this.displayAll();
    console.log("Kickstarting the queue:", this.animation_queue.length, this.animationSequence.length);
    if (this.animation_queue.length + this.animationSequence.length === 0){
      if (delay){
        await this.timeout(delay);
      }
      this.restartQueue();  
    }else{
      console.log("Nevermind, let's wait a bit");
    }
    
  }


  dealCard(){
    if (this.game.pool[0].hand.length == 0){
      this.runAnimationQueue();
      return 1;
    }

    $("#draw_deck").html("");
    let newCard = this.game.pool[0].hand.pop();
    newCard = this.game.deck[0].cards[newCard].type;
    console.log(`Add ${newCard} to market`);
    this.game.state.market.push(newCard);

    $(`<div class="slot_holder" id="sh${this.game.state.market.length}"></div>`).appendTo(".offer");

    this.animationSequence.push({callback: this.createAndMove, 
                                 params: [this.twoSidedCard(newCard), "#draw_deck", `#sh${this.game.state.market.length}`, (id)=>{ $(`#${id} .flipped`).removeClass("flipped"); }, ()=>{ console.log("Hello"); this.finishAnimation();}]});

    this.checkNextDiscard();

    return 0;
  }

  createAndMove(html, start, end, callback1 = null, callback2 = null){

    let source_stats = document.querySelector(start).getBoundingClientRect();
    let destination_stats = document.querySelector(end).getBoundingClientRect();

    //console.log(start, `${source_stats.top}px`, `${source_stats.left}px`);
    //console.log(end, `${destination_stats.top}px`, `${destination_stats.left}px`);

    let as = `${this.animationSpeed/1000}s`;


    this.animation_queue.push(0);
    let divid = `ae${this.animation_queue.length}`;

    this.app.browser.addElementToSelector(`<div id="${divid}" class="animated_elem fresh" style="top: ${source_stats.top}px; left: ${source_stats.left}px; width: fit-content;">${html}</div>`, ".gameboard");

    let game_self = this;

    $(".animated_elem.fresh").css("transition", `left ${as}, top ${as}, transform ${as} ease`);

    $(".animated_elem.fresh").delay(50).queue(function(){
        $(this).removeClass("fresh");
        if (callback1){
          callback1(divid);
        }
        $(this).css("top",`${destination_stats.top}px`).css("left", `${destination_stats.left}px`).dequeue();
      }).delay(game_self.animationSpeed).queue(function(){
          console.log("CreateAndMove finsihed");
          game_self.animation_queue.shift();
          if (game_self.animation_queue.length == 0 && callback2){
            console.log("Running callback");
            callback2();
          }
      });
  }

  checkNextDiscard(){
    if (this.game.state.discards.length > 0){
    
      let used = false;
      let discardedCard = this.game.state.discards.pop();
      for (let card of this.game.state.market){
        if (card === discardedCard){
          used = true;
          break;
        }
      }

      if (used){
        this.game.state.market.push(discardedCard);
        
        $(`<div class="slot_holder" id="sh${this.game.state.market.length}"></div>`).appendTo(".offer");
        this.animationSequence.push({callback: this.animateGameElementMove, params: ["#discards img:last-child", `sh${this.game.state.market.length}`, ()=>{console.log("Hello2"); this.finishAnimation();}]});

        this.checkNextDiscard();
        return;
      }else{
        this.game.state.discards.push(discardedCard);
      }
    }
    this.dealCard();
  }

  hasPlayableField(){
    let card = null;
    if (this.game.state.hand.length > 0){
     card = this.game.state.hand[this.game.state.hand.length-1];
    }

    for (let i = 0 ; i < 3; i++){
      if (this.game.state.self[i].length == 0){
        return true;
      }else if (this.game.state.self[i][0] === card){
        return true;
      }
    }
    return false;
  }

  canLiquidate(){
   for (let i = 0 ; i < 3; i++){
      if (this.game.state.self[i].length > 0){
        return true;
      }
    }
    return false; 
  }

  playerTurn(){
  
    this.app.browser.replaceElementById(this.newDrawDeck(), "draw_deck");
    this.attachBoardEvents();

    if (!this.hasPlayableField() && this.game.state.planted == 0){
      this.updateStatus("<div class='status-message'>You must liquidate a factory so you can start a new plant");  
      return;
    }

    let html = `<div class="status-message">`;
    if (this.game.state.planted == 0){
      html += `Build the first plant from your hand (mandatory)`;
    }else if (this.game.state.planted == 1){
      html += `Build the next plant from your hand or available offers (options)`;
    }else if (this.game.state.market.length > 0){
      html += `Build any available offers (optional)`;
    }else if (this.game.state.planted == 2){
      html += `Deal 3 new offers from the deck`;
    }else{
      html += `Draw 2 cards and end your turn`;
    }

    html += `</div>`;
    
    this.updateStatus(html);
  }



  attachBoardEvents(){
    let steamSelf = this;
    this.removeEvents();
    console.log("Attach board events");
    //
    //Define Helper Function
    //
    const plantCard = async (card, div = null) => {
      let openSlot = -1;
      let source = (div) ? "market" : "hand";
        
      //Check if you have started the factory
      for (let i = 2; i >= 0; i--){
        if (this.game.state.self[i].length > 0){
          if (this.game.state.self[i][0] == card){
            openSlot = i;
            break;
          }
        }else{
          openSlot = i;
        }
      }

      //Failure condition
      if (openSlot === -1){
        this.displayModal("You have no available fields to place that factory");
  
        if (div){
          //this.game.state.market.push(card);
          for (let i = 0; i < this.game.state.market.length; i++){
            if (!this.game.state.market[i]){
              this.game.state.market[i] = card;
              break;
            }
          }
        }else{
          this.game.state.hand.push(card);
        }
        return;

      }
     
      if (!div){
        this.game.state.planted++;
        div = document.querySelector(`#cardfan img:last-child`);
        div.style.transform = "unset";
        await this.timeout(50);
      }

      this.game.state.self[openSlot].push(card);
      this.addMove(`plant\t${this.game.player}\t${card}\t${openSlot}\t${source}`);
      this.animateGameElementMove(div, `#s${openSlot+1}`, ()=>{
        console.log("Sending move(s) to plant");
        this.endTurn();
      });
      this.attachBoardEvents(); 
      
    };

    if (this.game.state.planted < 2){
      $(".cardfan").addClass("jumpy");
      $(".cardfan").addClass("active_element");
      
      let xpos, ypos;

      $(".cardfan").on("mousedown", function (e) {
        xpos = e.clientX;
        ypos = e.clientY;
      });

      $(".cardfan").on("mouseup", function (e) {
        if (Math.abs(xpos - e.clientX) > 4) {
          return;
        }
        if (Math.abs(ypos - e.clientY) > 4) {
          return;
        }

        if (steamSelf.game.state.planted >= 2){
          steamSelf.displayModal("You have already planted the maximum from your hand this turn");
          return;
        }
        plantCard(steamSelf.game.state.hand.pop());
      });
    }

    $(".offer img").addClass("active_element");
    $(".offer img").on("click", function(){
      $(this).off();
      let card = $(this).attr("data-id");
      let id = $(this).attr("id").substring(2);
      console.log(id);
      steamSelf.game.state.market[parseInt(id)] = "";
      //steamSelf.game.state.market.splice(parseInt(id), 1);
      plantCard(card, this);
    });

    if (this.game.state.planted > 0){
      $("#draw_deck").addClass("active_element");  
    }
    
    $("#draw_deck").on("click", function(){
      if (steamSelf.game.state.planted > 0){
        steamSelf.removeEvents();
        steamSelf.updateStatus("<div class='status-message'>Dealing new cards...</div>");
        steamSelf.prependMove("continue");
        if (steamSelf.animation_queue.length == 0){
          steamSelf.endTurn();          
        }else{
          console.log(`${steamSelf.animation_queue.length} animations still running....`);
        }
      }else{
        steamSelf.displayModal("You have to build the first plant in your hand before moving on");
      }
    })

    $("#self > .field_slot").addClass("active_element");
    $("#self > .field_slot").on("click", function(){
      console.log($(this).attr("id"));
      let id = $(this).attr("id");
      //So stupid, I had a selector that would trigger on a child element so the id would be undefined
      //Probably don't need this "safety" check any more
      if (!id || !id.match(/s\d/)){
        console.warn("Inappropriate click event");
        return;
      }
      let slot = parseInt(id[1]);
      if (steamSelf.game.state.self[slot-1].length === 0){
        return;
      }
      if (steamSelf.isProtected(slot)){
        steamSelf.displayModal("You cannot sell a single plant when you have a larger factory");
      }else{
        steamSelf.removeEvents();
        steamSelf.prependMove(`liquidate\t${steamSelf.game.player}\t${slot}`);
        if (steamSelf.animation_queue.length == 0){
          steamSelf.endTurn();          
        }else{
          console.log(`${steamSelf.animation_queue.length} animations still running....`);
        }
      }
    });


  }

  isProtected(slot){
    
    if (this.game.state.self[slot-1].length > 1){
      return false;
    }

    for (let i = 0; i < 3; i++){
      if (this.game.state.self[i].length > 1){
        return true;
      }
    }

    return false;
  }

  removeEvents(){
    $("#self > .field_slot").off();
    $("#draw_deck").off(); 
    $(".offer img").off();
    $(".cardfan").off();
    $(".active_element").removeClass("active_element");
    $(".jumpy").removeClass("jumpy");
  }


  /*
   * DISPLAY FUNCTIONS 
   */

  calculateProfit(player, slot){
    let factory = (this.game.player === player) ? this.game.state.self[slot] : this.game.state.opponent[slot];
    let resource = factory[0];
    let reward = this.factory[resource];
    return (factory.length < reward.length) ? reward[factory.length] : reward[reward.length-1];
  }



  cardToHTML(card, offsety = 0, offsetx = 0){
    if (card && this.factory[card]){
      return `<img class="card" data-id="${card}" src="${this.card_img_dir}SB_${card}.png" style="top: ${offsety}px; left: ${offsetx}px;"/>`;  
    }else{
      return "";
    }
  }

  twoSidedCard(card){
    if (card && this.factory[card]){
      return `<div class="flip-card flipped" data-id="${card}" >
                <img class="card cardBack" src="${this.card_img_dir}SB_${card}.png"/>
                <img class="card cardFront" src="${this.card_img_dir}SB_Reward.png"/>      
              </div>`;
    }
    return "";
  }

  /*cardWithCountToHTML(card, amt){
    if (amt !== 0){
      return `<div class="hud-card card_count${(amt < 0)?" disabled":""}" data-id="${card}" data-cnt="${amt}" style="background-image:url('${this.card_img_dir}${card}.png');">${Math.abs(amt)}</div>`;  
    }else{
      return "";
    }
  }*/

  newDrawDeck(){
    let html = `<div id="draw_deck" class="field_slot tip" style="background-image: url('${this.card_img_dir}SB_reward.png');">
                ${this.game.deck[0].crypt.length}
                <div class="tiptext">`;

    if (this.game.state.planted == 0){
      html += "You have to plant your first card before you can move on";
    }else if (this.game.state.planted <= 2){
      html += "Click here to draw three cards into the pool";
    }else{
      html += "Click to draw two cards and end your turn";
    }
    html += `</div></div>`;

    return html;
  }


  displayAll(){
    this.displayBoard();
    this.displayScore();
    this.displayFields();
    this.displayHand();
  }

  displayBoard(){
    
    //Get rid of any remaining animation stuff
    $(".animated_elem").remove();

    $("#draw_deck").css("background-image", `url("${this.card_img_dir}SB_reward.png")`);
    if (this.game.deck[0].crypt.length > 0){
      $("#draw_deck").html(this.game.deck[0].crypt.length + `<div class="tiptext">The game will end when all ${this.game.deck[0].crypt.length} have been drawn</div>`);  
    }else{
      $("#draw_deck").css("visibility", "hidden");
    }
    

    let html = "";
    
    this.game.state.market = this.game.state.market.filter(e => e !== "");

    for (let i = 0; i < this.game.state.market.length; i++){
      let card = this.game.state.market[i];
      html += `<img class="card" data-id="${card}" id="m_${i}" src="${this.card_img_dir}SB_${card}.png"/>`;
    }
    $(".offer").html(html);

    html = "";
    for (let c = 0; c < this.game.state.discards.length; c++){
      html += this.cardToHTML(this.game.state.discards[c], -2*c, -2*c);
    }
    $("#discards").html(html);
  }


  displayScore(){
    $("#my_score").html(this.game.state.gold[0]);
    $("#opponent_score").html(this.game.state.gold[1]);
  }

  displayHand(){
    let cards_html = this.game.state.hand.map((card) => `<img class="card" data-id="${card}" src="${this.card_img_dir}SB_${card}.png">`).join("");

    this.cardfan.render(cards_html);
    this.cardfan.addClass("bighand");  
  }

  displayFields(){
    //Maybe temporary display before animations
    let html_stack;
    for (let i = 0; i < 3; i++){
      html_stack = ""
      if (this.game.state.opponent[i].length > 0){
        for (let j = 0; j < this.game.state.opponent[i].length - 1; j++){
          html_stack += this.cardToHTML(this.game.state.opponent[i][j], 10*j);
        }
        let gold = this.calculateProfit(3-this.game.player, i);
        if (gold > 0){
          html_stack += `<div class="field_slot" style="background-image: url('${this.card_img_dir}SB_${this.game.state.opponent[i][0]}.png'); top: ${10*(this.game.state.opponent[i].length - 1)}px;">
                            <div class="profit${gold}"></div>
                          </div>`;
        }else{
          html_stack += this.cardToHTML(this.game.state.opponent[i][0], 10*(this.game.state.opponent[i].length-1));
        }
      }

      $(`#o${i+1}`).html(html_stack);

    }

    for (let i = 0; i < 3; i++){
      html_stack = ""
      if (this.game.state.self[i].length > 0){
        for (let j = 0; j < this.game.state.self[i].length - 1; j++){
          html_stack += this.cardToHTML(this.game.state.self[i][j], 10*j);
        }
        let gold = this.calculateProfit(this.game.player, i);
        if (gold > 0){
          html_stack += `<div class="field_slot" style="background-image: url('${this.card_img_dir}SB_${this.game.state.self[i][0]}.png'); top: ${10*(this.game.state.self[i].length - 1)}px;">
                            <div class="profit${gold}"></div>
                          </div>`;
        }else{
          html_stack += this.cardToHTML(this.game.state.self[i][0], 10*(this.game.state.self[i].length-1));
        }
      }

      $(`#s${i+1}`).html(html_stack);

    }

  }






  ////////////////////
  // Core Game Data //
  ////////////////////
  returnState() {

    let state = {};
    state.market = [];  //Cards available to take
    state.discards = [];
    state.hand = [];    //My hand -- in order
    state.gold = [0, 0];//Running total of player scores
                //The ordered data structures for the factories as they grow
    state.opponent = [[], [], []];
    state.self = [[], [], []];

    state.welcome = 0;
          
    return state;

  }


  returnCards() {

    var deck = {};

    let definition = { cement: 16, coal: 18, coke: 14, cotton: 10, iron: 12, lightbulb: 6, pottery: 8};
    for (let res in definition){
      for (let i = 0; i < definition[res]; i++){
        deck[`${res}${i}`] = { type: res };
      }
    }

    return deck;

  }


  returnFactoryRules(){
    let factory = {};
    factory["cement"]   = [0,0,0,1,1,2,2,3,4];
    factory["coal"]     = [0,0,0,1,1,1,2,2,3,4];
    factory["coke"]     = [0,0,0,1,1,2,3,4];
    factory["cotton"]   = [0,0,1,1,2,3,4];
    factory["iron"]     = [0,0,1,1,2,2,3,4];
    factory["lightbulb"]= [0,0,2,3];
    factory["pottery"]  = [0,0,1,2,3,4];
    return factory;
  }


  returnGameRulesHTML(){
    return GameRulesTemplate(this.app, this);
  }

  returnGameOptionsHTML(){
    return GameOptionsTemplate(this.app, this);
  }


} // end Jaipur class

module.exports = Steamed;



