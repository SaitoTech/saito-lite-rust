const OnePlayerGameTemplate = require('../../lib/templates/oneplayergametemplate');
const SpiderGameRulesTemplate = require("./lib/spider-game-rules.template");
const SpiderGameOptionsTemplate = require("./lib/spider-game-options.template");


//////////////////
// CONSTRUCTOR  //
//////////////////
class Spider extends OnePlayerGameTemplate {

  constructor(app) {

    super(app);

    this.app = app;
    this.name            = "Spider";
    this.gamename        = "Spider Solitaire";
    this.game_length     = 10; //Estimated number of minutes to complete a game
    this.description     = 'Two deck solitaire card game that traps you in a web of addiction';
    this.categories       = "Games Cardgame One-player";

    this.status          = "Beta";
    this.difficulty      = 2; //default medium, 1 = easy, 4 = hard
    this.animationSpeed  = 1000;
  }

  // Create an exp league by default
  respondTo(type){
    if (type == "default-league") {
      let obj = super.respondTo(type);
      obj.ranking_algorithm = "HSC";
    return obj;
    }
    return super.respondTo(type);
  }
  

  returnGameRulesHTML(){
    return SpiderGameRulesTemplate(this.app, this);
  }


  returnSingularGameOption(app){
    return SpiderGameOptionsTemplate(this.app, this);
  }
    
  //Single player games don't allow game-creation and options prior to join
  returnGameOptionsHTML() {


    /* to do -- add auto play mode
            <p>Play Mode:</p>
            <div><input type="radio" id="auto" value="auto" name="play_mode" checked>
            <label for="auto">Cards move to available slots</label></div>
            <div><input type="radio" id="manual" value="manual" name="play_mode">
            <label for="manual">Click empty slot to move card</label></div>
    */
    return "";
  }


  initializeGame(game_id) {

    console.log("SET WITH GAMEID: " + game_id);

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = this.returnState();
      this.game.queue = [];
    }

    console.log(JSON.parse(JSON.stringify(this.game)));
    
    
    //Set difficulty
    let input_dif = this.game.options?.difficulty || "medium";
 
    if (this.browser_active){
      // Insert game board
      $(".gameboard").html(this.returnBoard());
    }
 
    this.changeDifficulty(input_dif);
      
    this.game.queue.push("READY");


  }


  changeDifficulty(dif){
    let saved_dif = this.loadGamePreference("spider_difficulty") || "none";
    this.game.options["difficulty"] = dif;
    if (dif == "easy"){
      this.difficulty = 1;
    }else if (dif == "hard"){
      this.difficulty = 4;
    }else{
      this.difficulty = 2;
    }
    if (saved_dif !== dif || this.game.deck.length == 0 || this.game.deck[0].length == 0){
      console.log("Original Difficulty = "+saved_dif + ", new difficulty: " +dif);

      this.saveGamePreference("spider_difficulty", dif);
      this.game.queue.push("lose");
      this.endTurn();
    }
  }



  returnBoard(){
    let html = `<div class="card-stack-array">`;
    for (let i = 0; i < 10; i++){
      html += `<div id="card-stack${i}" class="card-stack"></div>`
    }
    html += "</div>";
    html += `<div class="spider-footer">
              <div class="completed_stack_box"></div>
              <div class="undo"><i class="fas fa-undo fa-border"></i></div>
              <div class='draw-pile'>New Game</div>
            </div>
            `;
    return html;
  }


  /* Want to copy info from game.state.board onto DOM*/
  displayBoard() {
    console.log("REFRESH BOARD");
    if (this.browser_active == 0) { return; }
     
    for (let i = 0; i < 10; i++){
      let cardStack = this.game.state.board[i];
      let divname = `card-stack${i}`;
      let html = "";
      for (let j = 0; j < cardStack.length; j ++){
        let card = cardStack[j];
        html += `<div class="card ${(this.isFaceDown(card))?"facedown":"flipped"}" id="c${i}_${j+1}">${this.returnCardImageHTML(card)}</div>`;
      }
      if (!html){
        html = `<div class="card empty_slot" id="c${i}_0"></div>`
      }
      document.getElementById(divname).innerHTML = html;
        
    }

    if (this.moves.length > 0){
      $(".undo").css("visibility","visible");
    }else{
      $(".undo").css("visibility","hidden");
    }

    let html = "";

    /*for (let i = 0; i < this.game.state.draws_remaining; i++){
      html += `<img style="bottom:${0.5*i}vh; right:${0.5*i}vh;" src="/spider/img/cards/red_back.png" />`;
    }*/
    let dp = document.querySelector(".draw-pile");
    if (dp){
      if (this.game.state.draws_remaining > 0){
        dp.style.backgroundImage = "url(/spider/img/cards/red_back.png)";
        html = `<div>${this.game.state.draws_remaining}</div><div>Deal${this.game.state.draws_remaining>1?"s":""}</div>`;
      }else{
        dp.style.backgroundImage = "unset";
        html = "<span>Start</span><span>New</span><span>Game</span>";
      }
      dp.innerHTML = html;
    }



    //Completed stacks
    html = "";
    for (let i = 0; i < this.game.state.completed_stacks.length; i++){
      html += `<div class="completed_stack">`;
      for (let j = 1; j <= 13; j++){
         html += `<div class="card completed_card" style="position:absolute;left=${j}px;top=${j}px">${this.returnCardImageHTML(this.game.state.completed_stacks[i]+j)}</div>`;    
      }  
      html += "</div>";
    }
    if (html){
      document.querySelector(".completed_stack_box").innerHTML = html;
    }

  }


  returnState() {

    let state = super.returnState();

    state.moves = 0;
    state.score = 100 * this.difficulty;
    state.recycles_remaining = 5;

    state.completed_stacks = [];
    state.board = [];
    
    state.scores = [];

    for (let i = 0; i < 10; i++){
      state.board.push([]);
    }
    return state;

  }


  newRound(){
    //Set up queue
    this.game.queue = [];
    this.game.queue.push("play");
    this.game.queue.push("DEAL\t1\t1\t54");
    this.game.queue.push("SHUFFLE\t1\t1");
    this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnDeck(this.difficulty)));

    //Clear board - 
    this.game.state.board = [];
    for (let i = 0; i < 10; i++){
      this.game.state.board.push([]);
    }

    this.game.state.moves = 0;
    this.game.state.completed_stacks = [];
    this.game.state.score = 100 * this.difficulty;

    //Reset/Increment State
    this.game.state.draws_remaining = 5;
    
    if (this.browser_active){
      this.updateScore(0);
    }
  }


  initializeHTML(app) {
    //console.trace("Initialize HTML");
    if (!this.browser_active) { return; }
    
    super.initializeHTML(app);

    this.preloadImages();

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
    this.menu.addMenuOption("game-info", "Info");

    this.menu.addSubMenuOption("game-game",{
      text : "Start New Game",
      id : "game-new",
      class : "game-new",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.prependMove("lose");
        game_mod.endTurn();
      }
    });
    

    this.menu.addSubMenuOption("game-game", {
      text : "Play Mode",
      id : "game-play",
      class : "game-play",
      callback : function(app, game_mod) {
        game_mod.menu.showSubSubMenu("game-play"); 
      }
    });

    this.menu.addSubMenuOption("game-play",{
      text: `Auto ${(this.game.options.play_mode=="auto")?"✔":""}`,
      id:"game-confirm-newbie",
      class:"game-confirm-newbie",
      callback: function(app,game_mod){
        game_mod.game.options["play_mode"] = "auto";
        game_mod.attachEventsToBoard(); //change the click style
        try{
          document.querySelector("#game-confirm-newbie").textContent = "Auto ✔";
          document.querySelector("#game-confirm-expert").textContent = "Manual";   
        }catch(err){}
      }
    });
   
    this.menu.addSubMenuOption("game-play",{
      text: `Manual ${(this.game.options.play_mode=="auto")?"":"✔"}`,
      id:"game-confirm-expert",
      class:"game-confirm-expert",
      callback: function(app,game_mod){
       game_mod.game.options["play_mode"] = "manual";
       game_mod.attachEventsToBoard(); //change the click style
       try{
        document.querySelector("#game-confirm-newbie").textContent = "Auto";
        document.querySelector("#game-confirm-expert").textContent = "Manual ✔";  
       }catch(err){}
      }
    });
    

    this.menu.addSubMenuOption("game-game", {
      text : "Difficulty",
      id : "game-difficulty",
      class : "game-difficulty",
      callback : function(app, game_mod) {
        game_mod.menu.showSubSubMenu("game-difficulty"); 
      }
    });

    this.menu.addSubMenuOption("game-difficulty",{
      text: `One Suit (Easy) ${(this.game.options.difficulty=="easy")?"✔":""}`,
      id:"game-confirm-easy",
      class:"game-confirm-easy",
      callback: function(app,game_mod){
        game_mod.changeDifficulty("easy");
      }
    });
   
    this.menu.addSubMenuOption("game-difficulty",{
      text: `Two Suits (Medium) ${(this.game.options.difficulty=="medium")?"✔":""}`,
      id:"game-confirm-medium",
      class:"game-confirm-medium",
      callback: function(app,game_mod){
         game_mod.changeDifficulty("medium");
      }
    });

    this.menu.addSubMenuOption("game-difficulty",{
      text: `Four Suits (Expert) ${(this.game.options.difficulty=="hard")?"✔":""}`,
      id:"game-confirm-hard",
      class:"game-confirm-hard",
      callback: function(app,game_mod){
       game_mod.changeDifficulty("hard");
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-intro",
      class : "game-intro",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnGameRulesHTML());
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnStatsHTML());
      }
    });

    this.menu.addChatMenu();
    this.menu.render();

  }


  updateScore(change = -1){
    this.game.state.score += change;
    this.scoreboard.update(`<div class="score">Score: ${this.game.state.score}</div>`);
    if (this.game.state.score <= 0){
      this.displayModal("You Lose!", "Too many moves");
      this.prependMove("lose");
      this.endTurn();
    }
  }
  



  attachEventsToBoard(){
    let spider_self = this;
    console.log("Attach events");
    //Undo last move
    $(".undo").off();
    $(".undo").on('click', function(){
      spider_self.updateScore();
      spider_self.undoMove();
    });

    //Deal another round of cards
    $('.draw-pile').off();
    $('.draw-pile').on('click', async function(){
      if (spider_self.moves.length == 0){
        let c = await sconfirm("Are you sure you want to do that?");
        if (!c){
          return;
        }
      }
      if (spider_self.game.state.draws_remaining > 0){
        if (spider_self.canDraw()){
          spider_self.updateScore();
          spider_self.prependMove("draw");
          spider_self.endTurn();  
        }else{
          spider_self.displayWarning("Invalid Move","You cannot deal with open slots!");
        }
      }else{
        spider_self.prependMove("lose");
        spider_self.endTurn();  
      }
    });

    if (this.game.options.play_mode == "auto"){
      this.attachEventsToBoardAutomatic();
    }else{
      this.attachEventsToBoardManual();
    }
  }

  attachEventsToBoardAutomatic(){
    let spider_self = this;

    //Manipulate cards
    $('.card').off();
    $('.card').on('click', function(e) {
      e.stopPropagation();

      let card_pos = $(this).attr("id").replace("c","");
      let stackSize = spider_self.canSelectStack(card_pos);
      if (stackSize > 0){

        for (let i = 1; i < 10; i++){
          let colInd = (parseInt(card_pos[0]) + i) % 10
          
          if (spider_self.canMoveStack(card_pos, colInd)){
            spider_self.commitMove(card_pos, colInd, stackSize);
            return;
          }
        }
      }

    });

  }

  commitMove(source, target, stackSize){

    this.untoggleAll();
    this.updateScore();
    this.prependMove(`move\t${source}\t${target}\t${stackSize}`);
    this.moveStack(source, target.toString()); //redraws board

    let key = this.revealCard(source[0]); 
    if (key){
      this.prependMove(`flip\t${source[0]}\t${key}`);  
    }
    
    if (!this.checkStack(target)){
      setTimeout(this.attachEventsToBoard.bind(this), 50);
    }

  }


  attachEventsToBoardManual(){
    let spider_self = this;
    let selected_stack = null;
    let selected_stack_size = 0;
   
    /*
    So we need to know the width and borders of each card stack
    and as we move the mouse determine which stack we are hovering over
    and update a class to provide feedback...
    */
    let width = document.querySelector(".card-stack-array .card-stack").getBoundingClientRect().width;
    let stacks = [];
    Array.from(document.querySelectorAll(".card-stack-array .card-stack")).forEach(el => {
      let card = el.lastChild;
      let cardImg = card.firstChild;
      let bottom = card.getBoundingClientRect().bottom;
      if (cardImg){
        bottom = cardImg.getBoundingClientRect().bottom;
      }
      stacks.push({left: Math.round(el.getBoundingClientRect().left), bottom: Math.round(bottom)});
    });

    $(".card-stack-array").off();
    $(".card").off();
    
    $(".card.flipped").on("mouseleave", function(e){
      $(".hover").removeClass("hover");
    });
    $(".card.flipped").on("mouseenter", function(e){
        let card_pos = $(this).attr("id").replace("c","");
      
        if (spider_self.canSelectStack(card_pos)) {
          let coord = card_pos.split("_");
          for (let i = parseInt(coord[1]); i <= spider_self.game.state.board[parseInt(coord[0])].length; i++){
            let divname = '#c' + coord[0] + "_" + i;
            $(divname).addClass("hover");
          }
        }
    });

    //Manipulate cards

    $(".card-stack-array").on('click', function(e) {
      if (selected_stack){
        
        let target_stack = document.querySelector(".hover")?.id.substring(1, 2);

        //Deselect/Change
        if (!target_stack || target_stack == selected_stack[0] ){ // Same stack
          spider_self.untoggleAll();
          spider_self.displayBoard();
          spider_self.attachEventsToBoard();
        }else{
          //Can we move the selected_stack to this place
          if (spider_self.canMoveStack(selected_stack, parseInt(target_stack))){
            spider_self.commitMove(selected_stack, parseInt(target_stack), selected_stack_size); 
          }else{
            spider_self.displayWarning("Invalid Move");
          }            
        }
      }
    });

    $(".card.flipped").on('click', function(e){
      if (!selected_stack){
        e.stopPropagation();
        let card_pos = $(this).attr("id").replace("c","");
        //Can we select this stack
        let coord = card_pos.split("_");
        let stack = parseInt(coord[0]);

        selected_stack_size = spider_self.canSelectStack(card_pos);
        if (selected_stack_size > 0){
          spider_self.source = "#card-stack"+coord[0];

          selected_stack = card_pos;
          try{
            
            if (!document.getElementById("helper")){
              $(".gameboard").append(`<div id="helper" class="card-stack"></div>`);      
            }

            $(".gameboard").addClass("selection");
            let offsetY = e.clientY - Math.round(e.currentTarget.getBoundingClientRect().y) - 10;
            let offsetX = e.clientX - Math.round(e.currentTarget.getBoundingClientRect().x) - 10;
            let current = -1;
            $(".card").off();

            $(".card-stack-array").on("mousemove", function (e) {
                let xposition = e.clientX - offsetX;
                let yposition = e.clientY - offsetY;
                $("#helper").css({ top: yposition, left: xposition });
                for (let i = 0; i < stacks.length; i++){
                  if (xposition < stacks[i].left + width/2){
                    if (i != current) {
                      current = i;
                      $(".hover").removeClass("hover");
                    }
                    break;
                  }
                }
                if (yposition > stacks[current].bottom){
                  $(".hover").removeClass("hover");
                }else{
                  $(`#card-stack${current} .card:last-child`).addClass("hover");
                }
            });


            $("#helper").css({ top: e.clientY - offsetY, left: e.clientX - offsetX });

            for (let i = parseInt(coord[1]); i <= spider_self.game.state.board[stack].length; i++){
              let divname = '#c' + stack + "_" + i;
              $(divname).addClass("selected");
              $("#helper").append($(divname));
            }

          }catch(err){
            console.error("Toggle Card", err);
          }
          
        }
      }
    });
  }


  untoggleAll(){
    $(".selected").removeClass("selected");
    $(this.source).append($("#helper").children());
    $("#helper").remove();
    $(".hover").removeClass("hover");
    $(".selection").removeClass("selection");
    $(".card-stack-array").off();
    $(".card.flipped").off();

  }



  canSelectStack(card){
    let indices = card.split("_");
    let stackNum = parseInt(indices[0]);
    let stackPos = parseInt(indices[1]);

    if (stackPos == 0){
      return 0;  //No stack to select
    }

    let mySuit = this.returnCardSuite(card);
    let myRank = this.returnCardNumber(card);
    let stackSize = 1;
    for (let i = stackPos; i < this.game.state.board[stackNum].length; i++){
      if (this.game.state.board[stackNum][i][0] !== mySuit){
        return 0;
      }
      let newRank = parseInt(this.game.state.board[stackNum][i].substring(1));
      if (newRank !== myRank - 1){
        return 0;
      }
      myRank = newRank;
      stackSize++;
    }

    return stackSize;
  }


  /*
  Can click the column to move the stack
  */
  canMoveStack(card, stackNum) {
    //Is the slot empty
    let numCards = this.game.state.board[stackNum].length;
    if (numCards === 0){
      return true;
    }

    let bottomCard = this.game.state.board[stackNum][numCards - 1];
    
    //Does the stack fit on the target
    let cardValueTarget = parseInt(bottomCard.substring(1)); 
    let oldStackValue = this.returnCardNumber(card);
    if (oldStackValue + 1 == cardValueTarget){
      return true;
    }

    return false;
  }

  /*
  Slot is target
  */
  moveStack(card, slot){
    let indices = card.split("_");
    let oldstackNum = parseInt(indices[0]);
    let oldstackPos = parseInt(indices[1]);

    let newstackNum = parseInt(slot[0]);
    
    let stack = this.game.state.board[oldstackNum].splice(oldstackPos-1);
    for (let c of stack){
      this.game.state.board[newstackNum].push(c);
    }
          
    this.displayBoard();
    this.game.state.moves++;
  }

  revealCard(stackNum){
    stackNum = parseInt(stackNum);
    //Reveal card under stack (if necessary)
    if (this.game.state.board[stackNum].length > 0){
      let topCard = this.game.state.board[stackNum].pop();
      if (this.isFaceDown(topCard)){
        this.game.state.board[stackNum].push(this.game.deck[0].cards[topCard]);
        let index = `#c${stackNum}_${this.game.state.board[stackNum].length}`; 
        $(index).html($(this.returnCardImageHTML(this.game.deck[0].cards[topCard]))).delay(30).queue(function (){ 
          $(index).removeClass("facedown").addClass("flipped").dequeue();
        });
        return topCard;
      }else{
        this.game.state.board[stackNum].push(topCard);
      }
    }
    return null;
  }

  canDraw(){
    for (let i = 0; i < 10; i++){
      if (this.game.state.board[i].length == 0){
        return false;
      }
    }
    return true;
  }

  /*
    Check if we have completed a stack
  */
  checkStack(stackNum){
    if (this.game.state.board[stackNum].length < 13){
      return false;
    }
    let tempStack = [];
    let success = true;
    let suit = this.returnCardSuite(`${stackNum}_${this.game.state.board[stackNum].length}`);
    
    for (let i = 1; i <= 13 && success; i++){
      let card = this.game.state.board[stackNum].pop();
      tempStack.push(card);
      if (this.isFaceDown(card)){ success = false; break;}
      if (suit !== card[0]){ success = false; break;}
      if (parseInt(card.substring(1))!==i){ success = false; break;}
    }
    //Put the cards back
    if (!success){
      while (tempStack.length > 0){
        card = tempStack.pop();
        this.game.state.board[stackNum].push(card);
      }
      return false;
    }else{
      this.updateScore(50);
      this.game.state.completed_stacks.push(suit);

      let numComplete = this.game.state.completed_stacks.length;
      console.log(this.game.state.completed_stacks);
      this.prependMove(`complete\t${stackNum}\t${suit}`);

      $(".completed_stack_box").append(`<div id="cs${numComplete}" class="completed_stack"></div>`);

     let depth = this.game.state.board[stackNum].length;

      for (let i = 1; i <= 13; i++){
        this.animationSequence.unshift({callback: this.moveGameElement, 
                                    params:[this.copyGameElement(`#c${stackNum}_${depth+i}`), 
                                        `#cs${numComplete}`, {resize: 1, insert: 1}]});
      }
      
      this.animationSequence.push({callback: ()=>{
        setTimeout(()=>{
          this.displayBoard();
          $(".animated_elem").remove();
          this.game.halted = 0;
          let temp = this.revealCard(stackNum);
          if (temp){
            this.prependMove(`flip\t${stackNum}\t${temp}`);       
          }

          if (this.game.state.completed_stacks.length == 8){
            this.prependMove("win");
            this.endTurn();
          }else{
            this.attachEventsToBoard();
          }

        }, 1000);
      }, params: null});

      this.runAnimationQueue(100);
      return true;
    }
    
  }


  
  async animateFinalVictory(){

    $(".card.completed_card").css("width","100px");
    $(".gameboard").append($(".card.completed_card"));

    let cards = document.querySelectorAll(".card.completed_card");
    let max_x = window.innerWidth - 50;
    let max_y = window.innerHeight - 100;

    for (let i = 0; i < cards.length; i++){
      cards[i].style.left = Math.floor(Math.random() * max_x) + 25;
      cards[i].style.top = Math.floor(Math.random() * max_y) + 50;
      await this.timeout(50);
    }
  }


  isFaceDown(card){
    if (card[0] == "S" || card[0] == "C" || card[0] == "H" || card[0] == "D")
      return false;
    else return true;
  }


  getAvailableMoves(card){

  }

  /* scan board to see if any legal moves available*/
  hasAvailableMoves(){
    
    return false;
  }


  flipCards(){
      $(".animated_elem").remove();
      this.displayBoard();

      //Flip bottom row
      for (let i = 0; i < 10; i++){
        this.animationSequence.push({callback: this.revealCard, params: [i]})
      }
      
      this.animationSequence.push({callback: this.finishAnimation, params: null});
      this.runAnimationQueue(100);
  }
  
  finishAnimation(){
    setTimeout(()=>{
      $(".animated_elem").remove();
      this.displayBoard();
      this.attachEventsToBoard();
      this.game.halted = 0;
    }, 400);
  }

  handleGameLoop(msg=null) {
    let spider_self = this;

    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      console.log(JSON.stringify(mv));

      if (mv[0] === "lose"){
        this.game.queue.splice(qe, 1);
        if (this.game.state.moves > 0){
          this.game.state.session.round++;
          this.game.state.session.losses++;
          let final_score = this.game.state.score; 
          this.game.state.scores.push(final_score);
          this.endGame([], final_score.toString());  
        }
        this.newRound();
        return 1;
      }

      if (mv[0] === "win"){
        this.game.queue.splice(qe, 1);
        this.game.state.session.round++;
        this.game.state.session.wins++;
        this.animateFinalVictory();
        let final_score = this.game.state.score + 400;
        this.game.state.scores.push(final_score);
        this.endGame(this.app.wallet.returnPublicKey(), final_score.toString());
        this.overlay.show(this.returnStatsHTML("Winner!"), ()=>{
          this.newRound();
          $(".completed_card").remove();
          this.restartQueue();
        });
        return 0;
      }

      if (mv[0] === "draw"){
        this.game.state.draws_remaining--;
        this.game.queue.splice(qe, 1);
        this.game.queue.push("play");
        this.game.queue.push(`DEAL\t1\t1\t10`);
      }

      /*
        Build the board from the shuffled deck
      */
      if (mv[0] === "play") {
        
        if (this.browser_active){
          /* We want to deal the cards onto the table, each stack is an array*/
          let indexCt = 0;

          this.displayBoard();

          if (this.game.deck[0].hand.length == 0){
            this.attachEventsToBoard();
            return 0;
          }

          $(".empty_slot").remove();

          while (this.game.deck[0].hand.length > 0){
            let card = this.game.deck[0].hand.pop();
            this.game.state.board[indexCt].push(card);
          
            $(`#card-stack${indexCt}`).append(`<div class="card facedown placeholder" id="c${indexCt}_${this.game.state.board[indexCt].length}"></div>`);

            //let destination = `#card-stack${indexCt}`;
            //if ($(`#card-stack${indexCt}`).children().length > 0) {
            //  destination = $(`#card-stack${indexCt}`).children().last()[0];
            // }
            this.animationSequence.push({callback: this.moveGameElement, 
                                      params: [this.createGameElement(`<img class="cardBack" src="/spider/img/cards/red_back.png"/>`, ".draw-pile"),  
                                                `#c${indexCt}_${this.game.state.board[indexCt].length}`, 
                                                {resize: 1, insert: 1},
                                                
                                              ]});

            indexCt = ( indexCt + 1 ) % 10;
          }

          this.animationSequence.push({delay: 500});
          
          //Flip bottom row
          for (let i = 0; i < 10; i++){
            this.animationSequence.push({callback: this.revealCard, params: [i]})
          }
          
          this.animationSequence.push({callback: this.finishAnimation, params: null});


          this.runAnimationQueue(120);
                    
        }        
        return 0;
      }

      if (mv[0] === "flip"){
        this.game.queue.splice(qe, 1);
        if (this.game.player !== 1){
          this.displayBoard();
          this.revealCard(mv[1]);
        }
      }

      if (mv[0] === "complete"){
        this.game.queue.splice(qe, 1);
        let slot = parseInt(mv[1]);     //rowX_slotY
        if (this.game.player !== 1){
          for (let i = 0; i < 13; i++){
            this.game.state.board[slot].pop();
          }
        }
      } 

      if (mv[0] === "move"){
        this.game.queue.splice(qe, 1);
        let card = mv[1];     //rowX_slotY
        let emptySlot = mv[2];//rowX_slotY

        if (this.game.player !== 1){
          this.moveStack(card, emptySlot);
        }

      }

      return 1;

    } 
    return 0; 
  }

  undoMove(){
    let mv = this.moves.shift().split("\t");
    if (mv[0] === "flip"){
      let key = mv[2];
      let slot = parseInt(mv[1]);
      let card = this.game.state.board[slot].pop();
      this.game.state.board[slot].push(key);
      mv = this.moves.shift().split("\t");
    }
    if (mv[0] == "complete"){
      this.game.state.completed_stacks.pop();
      let slot = parseInt(mv[1]);
      for (let i = 13; i > 0; i--){
        this.game.state.board[slot].push(`${mv[2]}${i}`);
      }
      this.undoMove();
    }
    let original_card_pos = mv[1];
    let slot = parseInt(mv[2]);
    let stackSize = parseInt(mv[3]);
    console.log(mv);
    let pseudoSelect = this.game.state.board[slot].length - stackSize + 1;
    this.moveStack(`${slot}_${pseudoSelect}`, original_card_pos);
    this.attachEventsToBoard();
  }



  returnCardImageHTML(name) {
    if ('SHCD'.includes(name[0])) { 
      return `<img class="cardFront" src="/spider/img/cards/${name}.png" />
              <img class="cardBack" src="/spider/img/cards/red_back.png" />`;
    } else { return '<img class="cardBack" src="/spider/img/cards/red_back.png" />';}
  }



  returnDeck(numSuits) {
    let suits = ["S","D","C","H"];
    var deck = {};
    /* WTF is with this indexing system??? */
    //2-10 of each suit, with indexing gaps on the 1's
    let index = 1;
    let numLoops = 104 / (13*numSuits);
    
    for (let k = 0; k < numLoops; k++){
      for (let i = 0; i<numSuits; i++){
        for (let j=1; j<=13; j++){
          deck[index.toString()] = suits[i]+j;
          index ++;
        }  
      }
    }

    return deck;
   }



 
  returnCardFromBoard(slot){
    let indices = slot.split("_");
    let i = parseInt(indices[0]);
    let j = parseInt(indices[1])-1;

    return this.game.state.board[i][j];
  }

  returnCardNumber(slot) {
    let card = this.returnCardFromBoard(slot);
    return parseInt(card.substring(1));
  }

  returnCardSuite(slot) {
    let card = this.returnCardFromBoard(slot);
    return card[0];
  }

  cardSuitHTML(suit){
    switch (suit){
      case "D": return "&diams;"
      case "H": return "&hearts;"
      case "S": return "&spades;"
      case "C": return "&clubs;"
      default: return "";
    }
  }


  preloadImages(){
    let suits = ["S","D","C","H"];

    var allImages = [];
    for (let i = 0; i<this.difficulty; i++){
      for (let j=1; j<=13; j++){
        allImages.push( suits[i]+j );
      }  
    }
    this.preloadImageArray(allImages, 0);
  }

   preloadImageArray(imageArray, idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/spider/img/cards/" + imageArray[idx] + ".png";
    }
  }



}

module.exports = Spider;

