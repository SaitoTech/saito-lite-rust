var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');
const SpiderGameRulesTemplate = require("./lib/spider-game-rules.template");
const SpiderGameOptionsTemplate = require("./lib/spider-game-options.template");


//////////////////
// CONSTRUCTOR  //
//////////////////
class Spider extends GameTemplate {

  constructor(app) {

    super(app);

    this.name            = "Spider";
    this.game_length     = 10; //Estimated number of minutes to complete a game
    this.description     = 'Two deck solitaire card game that traps you in a web of addiction';
    this.categories       = "Games Cardgame one-player";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;
    this.status          = "Beta";
    this.difficulty      = 2; //default medium, 1 = easy, 4 = hard
    this.app = app;
  }

  // Create an exp league by default
  respondTo(type){
    if (type == "default-league") {
      let obj = super.respondTo(type);
      obj.type = "exp";
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
    
    if (this.game.queue.length == 0){
        this.game.queue.push("play");
    }
    
    //Set difficulty
    let input_dif = this.game.options?.difficulty || "medium";
    this.changeDifficulty(input_dif);
      
    this.game.queue.push("READY");

    if (this.browser_active){
      // Insert game board
      $(".gameboard").html(this.returnBoard());
    }
  }


  changeDifficulty(dif){
    let saved_dif = this.app.options?.gameprefs["spider_difficulty"] || "none";
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
      this.newRound();  
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
    //console.log("REFRESH BOARD");
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
      $(".undo").css("display","block");
    }else{
      $(".undo").css("display","none");
    }

    let html = "";

    for (let i = 0; i < this.game.state.draws_remaining; i++){
      html += `<img style="bottom:${0.5*i}vh; right:${0.5*i}vh;" src="/spider/img/cards/red_back.png" />`;
    }
    if (!html){
      html = "Start New Game";
    }
    document.querySelector(".draw-pile").innerHTML = html;


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

    this.attachEventsToBoard();
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
    this.game.state.score = 100;

    //Reset/Increment State
    this.game.state.round++;
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
        game_mod.endGame();
        game_mod.newRound();
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
        game_mod.endTurn();
      }
    });
   
    this.menu.addSubMenuOption("game-difficulty",{
      text: `Two Suits (Medium) ${(this.game.options.difficulty=="medium")?"✔":""}`,
      id:"game-confirm-medium",
      class:"game-confirm-medium",
      callback: function(app,game_mod){
         game_mod.changeDifficulty("medium");
         game_mod.endTurn();   
      }
    });

    this.menu.addSubMenuOption("game-difficulty",{
      text: `Four Suits (Expert) ${(this.game.options.difficulty=="hard")?"✔":""}`,
      id:"game-confirm-hard",
      class:"game-confirm-hard",
      callback: function(app,game_mod){
       game_mod.changeDifficulty("hard");
       game_mod.endTurn();
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "How to Play",
      id : "game-intro",
      class : "game-intro",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnGameRulesHTML());
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnStatsHTML());
      }
    });

    this.menu.addChatMenu();
    this.menu.render();

  }

  exitGame(){
    this.updateStatusWithOptions("Saving game to the blockchain...");
    this.prependMove("exit_game\t"+this.game.player);
    this.endTurn();
  }

  updateScore(change = -1){
    this.game.state.score += change;
    this.scoreboard.update(`<div class="score">Score: ${this.game.state.score}</div>`);
    if (this.game.state.score <= 0){
      this.prependMove("lose");
      this.endTurn();
    }
  }
  
  returnState() {

    let state = {};

    state.round = 0;
    state.wins = 0;
    state.moves = 0;
    state.score = 100;
    state.recycles_remaining = 5;
    state.completed_stacks = [];
    state.board = [];
    for (let i = 0; i < 10; i++){
      state.board.push([]);
    }
    return state;

  }


  returnStatsHTML(title = "Game Statistics"){
    let html = `<div class="rules-overlay">
    <h1>${title}</h1>
    <table>
    <tbody>
    <tr><th>Latest Score:</th><td>${this.game.state.score}</td></tr>
    <tr><th>Games Played:</th><td>${this.game.state.round-1}</td></tr>
    <tr><th>Games Won:</th><td>${this.game.state.wins}</td></tr>
    <tr><th>Win Percentage:</th><td>${(this.game.state.round>1)? Math.round(1000* this.game.state.wins / (this.game.state.round-1))/10 : 0}%</td></tr>
    </tbody>
    </table>
    </div>`;
    return html;
  }


  attachEventsToBoard(){
    let spider_self = this;

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
        spider_self.endGame();
        spider_self.newRound();
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
    let selected_stack_size = 0;

    //Manipulate cards
    $('.card').off();
    $('.card').on('click', function(e) {
      e.stopPropagation();

      let card_pos = $(this).attr("id").replace("c","");

      selected_stack_size = spider_self.canSelectStack(card_pos);
      
      if (selected_stack_size > 0){

        for (let i = 1; i < 10; i++){
          let colInd = (parseInt(card_pos[0]) + i) % 10
          if (spider_self.canMoveStack(card_pos, colInd.toString())){
            spider_self.commitMove(card_pos, colInd, selected_stack_size);
            return;
          }
        }
      }

    });

  }

  commitMove(source, target, count){

    this.untoggleAll();
    this.updateScore();
    this.prependMove(`move\t${source}\t${target}\t${count}`);
    this.moveStack(source, target.toString());

    let key = this.revealCard(source[0]); 
    if (key){
      this.prependMove(`flip\t${source[0]}\t${key}`);  
    }
    this.checkStack(target);

  }


  attachEventsToBoardManual(){
    let spider_self = this;
    let selected_stack = null;
    let selected_stack_size = 0;
   

    $(".card-stack-array").off();
    $(".card-stack-array").on('click', function(){
      spider_self.untoggleAll();
      selected_stack = null;
    });

    //Manipulate cards
    $('.card').off();
    $('.card').on('click', function(e) {
      e.stopPropagation();

      let card_pos = $(this).attr("id").replace("c","");

      if (selected_stack){
        
        //Deselect/Change
        if (card_pos[0] == selected_stack[0]){ // Same stack
          spider_self.untoggleAll();
          selected_stack = null;
        }else{
          //Can we move the selected_stack to this place
          if (spider_self.canMoveStack(selected_stack, card_pos)){
            spider_self.commitMove(selected_stack, parseInt(card_pos[0]), selected_stack_size);
          }else{
            spider_self.displayWarning("Invalid Move");
          }            
        }
      }else{
        //Can we select this stack
        selected_stack_size = spider_self.canSelectStack(card_pos);
        if (selected_stack_size > 0){
          selected_stack = card_pos;
          spider_self.toggleCard(selected_stack, e);
        }
      }
    });
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
  canMoveStack(card, slot) {
    let indices = slot.split("_");
    let stackNum = parseInt(indices[0]);

    //Is the slot empty
    let numCards = this.game.state.board[stackNum].length;
    if (numCards === 0){
      return true;
    }

    let bottomCard = this.game.state.board[stackNum][numCards - 1];
    
    //Does the stack fit on the target
    let cardValueTarget = parseInt(bottomCard.substring(1)); //this.returnCardNumber(slot);  
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
        $(index).append($(this.returnCardImageHTML(this.game.deck[0].cards[topCard]))).delay(30).queue(function (){ 
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
  async checkStack(stackNum){
    if (this.game.state.board[stackNum].length < 13){
      return;
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
    }else{
      this.updateScore(50);
      await this.animateStackVictory(stackNum);
      this.game.state.completed_stacks.push(suit);
      this.displayBoard();
      console.log(this.game.state.completed_stacks);
      this.prependMove(`complete\t${stackNum}\t${suit}`);
      let temp = this.revealCard(stackNum);
      if (temp){
        this.prependMove(`flip\t${stackNum}\t${temp}`);       
      }
      if (this.game.state.completed_stacks.length == 8){
        this.prependMove("win");
        this.endTurn();
      }
    }
    
  }


  async animateDeal(){
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    for (let i = 0; i < 10; i++){
      this.revealCard(i);
      await timeout(250);
      //this.displayBoard();
    }
  }

  async animateStackVictory(stackNo){
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    let cardWidth = document.querySelector(".card img").getBoundingClientRect().width;
    let cardHeight = document.querySelector(".card img").getBoundingClientRect().height;
    let completedStack = Array.from(document.querySelector("#card-stack"+stackNo).children);
    for (let i = completedStack.length - 13; i < completedStack.length; i++) {
      let card_to_move = completedStack[i];
    }
    let newTop = Math.min(document.querySelector(".completed_stack_box").getBoundingClientRect().top, window.innerHeight - cardHeight);
    let newLeft = Math.min(cardWidth,95) * this.game.state.completed_stacks.length;
    
    for (let i = 0; i < 13; i++){
      let card_to_move = completedStack.pop();
      let bcr = card_to_move.querySelector("img").getBoundingClientRect();
      //$(".gameboard").append(card_to_move);
      card_to_move.style.position = "absolute";
      card_to_move.style.left = bcr.left+"px";
      card_to_move.style.top = bcr.top+"px";
      card_to_move.style.width = bcr.width+"px";
      card_to_move.style.height = bcr.height+"px";
      card_to_move.style.transition = "left 1.25s, top 1.25s";
      card_to_move.classList.add("prepare_to_move");
      await timeout(25);
      card_to_move.style.left = newLeft + "px";
      card_to_move.style.top = newTop + "px"; 
      await timeout(175);
    }
    $(".prepare_to_move").addClass("completed_card");
    $(".prepare_to_move").removeClass("prepare_to_move");
      //card_to_move.classList.add("completed_card");
  }

  async animateFinalVictory(){
    const timeout = ms => new Promise(res => setTimeout(res, ms));

    $(".card.completed_card").css("width","100px");
    $(".gameboard").append($(".card.completed_card"));

    let cards = document.querySelectorAll(".card.completed_card");
    let max_x = window.innerWidth - 50;
    let max_y = window.innerHeight - 100;

    for (let i = 0; i < cards.length; i++){
      cards[i].style.left = Math.floor(Math.random() * max_x) + 25;
      cards[i].style.top = Math.floor(Math.random() * max_y) + 50;
      await timeout(50);
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

  toggleCard(index, e) {
    let coord = index.split("_");
    let stack = parseInt(coord[0]);

    this.source = "#card-stack"+coord[0];

    if (!document.getElementById("helper")){
      $(".gameboard").append(`<div id="helper" class="card-stack"></div>`);      
    }

    let offsetY = e.clientY - Math.round(e.currentTarget.getBoundingClientRect().y) - 10;
    let offsetX = e.clientX - Math.round(e.currentTarget.getBoundingClientRect().x) - 10;

    $("#helper").css({ top: e.clientY - offsetY, left: e.clientX - offsetX });

    for (let i = parseInt(coord[1]); i <= this.game.state.board[stack].length; i++){
      let divname = '#c' + stack + "_" + i;
      $(divname).addClass("selected");
      $("#helper").append($(divname));
    }

    $(document).on("mousemove", function (e) {
        $("#helper").css({ top: e.clientY - offsetY, left: e.clientX - offsetX });
    });

    
  }

  untoggleAll(){
    $(".selected").removeClass("selected");
    $(this.source).append($("#helper").children());
    $("#helper").remove();
    $(document).off();
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
        this.displayModal("You Lose!", "Too many moves");
        this.endGame();
        this.newRound();
        return 1;
      }

      if (mv[0] === "win"){
        this.game.queue.splice(qe, 1);
        this.game.state.wins++;
        this.animateFinalVictory();
        this.endGame(this.app.wallet.returnPublicKey());
        this.overlay.show(this.app, this, this.returnStatsHTML("Winner!"), ()=>{
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
          this.game.queue.splice(qe, 1);
          /* We want to deal the cards onto the table, each stack is an array*/
          let indexCt = 0;

          while (this.game.deck[0].hand.length > 0){
            let card = this.game.deck[0].hand.pop();
            this.game.state.board[indexCt].push(card);
            indexCt = ( indexCt + 1 ) % 10;
          }
          this.displayBoard();

          //Flip bottom row
          this.animateDeal();
                    
        }        
        return 0;
      }

      if (mv[0] === "exit_game"){
        this.game.queue.splice(qe, 1);
        this.game.queue.push("play");
        let player = parseInt(mv[1])
        this.saveGame(this.game.id);

        if (this.game.player === player){
          super.exitGame();
          //window.location.href = "/arcade";
        }else{
          this.updateStatus("Player has exited the building");
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

  /* So player can delete game from Arcade, no need to send a message*/
  resignGame(game_id = null, reason = "forfeit") {
    console.log("Mark game as closed");
    this.loadGame(game_id);
    this.game.over = 2;
    this.saveGame(game_id);
    this.app.connection.emit("arcade-remove-game", game_id);
  }

   receiveGameoverRequest(blk, tx, conf, app) {
    console.log("The game never ends in Spider Solitaire");
    return;
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

