var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
class Mahjong extends GameTemplate {

  constructor(app) {
    super(app);

    this.name            = "Mahjong";

    this.description     = '144 tiles are randomly folded into a multi-layered shape.' +
                           'The goal of this game is to remove all tiles of the same pair by matching the pairs and clicking at them in sequence' +
                           'THere are layers of tiles and tiles stacked on top of other tiles make these tiles underneath invisible.' +
                           'The game is finished when all pairs of tiles have been removed from the board.';
    this.categories      = "Games Cardgame one-player";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;
    this.status          = "Beta";

  }

  returnGameRulesHTML(){
    return `<div class="rules-overlay">
            <h1>Mahjong</h1>
            <ul>
            <li>144 tiles are randomly folded into a multi-layered shape.</li>
            <li>The goal of this game is to remove all tiles of the same pair by matching the pairs and clicking at them in sequence</li>
            <li>THere are layers of tiles and tiles stacked on top of other tiles make these tiles underneath invisible.</li>
            <li>The game is finished when all pairs of tiles have been removed from the board.</li>
            </ul>
            </div>
            `;

  }


  //
  // runs the first time the game is created / initialized
  //
  initializeGame(game_id) {

    console.log("GAMEID: " + game_id);

    //
    // to persist data between games, such as board state, write it to 
    // the game.state object. if this object does not exist, that tells
    // us this is the first time we have initialized this game.
    //
    if (!this.game.state) {

      this.game.state = this.returnState();

      //
      // we can pop moves onto the queue and execute them one-by-one. this
      // is more useful in 2P++ games. all games keep their QUEUE in order
      // using the structured inputs provided by the network.
      //
      this.game.queue.push("play");
      this.game.queue.push("READY");
      this.game.queue.push("DEAL\t1\t1\t10");
      this.game.queue.push("SHUFFLE\t1\t1");
      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnDeck()));

    }
    
    this.saveGame(this.game.id);

    if (this.browser_active){
      $('.slot').css('min-height', $('.card').css('min-height'));  
    }

  }

  isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
  }

  emptyCells = [
    [1,1], [1,14],
    [2,1], [2,2], [2,3], [2,12], [2,13], [2,14],
    [3,1], [3,2], [3,13], [3,14],
    [5,1], [5,14],
    [6,1], [6,2], [6,13], [6,14],
    [7,1], [7,2], [7,3], [7,12], [7,13], [7,14],
    [8,1], [8,14],
    // 2nd layer
    [9,1], [9,2], [9,3], [9,4], [9,11], [9,12], [9,13], [9,14],
    [10,1], [10,2], [10,3], [10,4], [10,11], [10,12], [10,13], [10,14],
    [11,1], [11,2], [11,3], [11,4], [11,11], [11,12], [11,13], [11,14],
    [12,1], [12,2], [12,3], [12,4], [12,11], [12,12], [12,13], [12,14],
    [13,1], [13,2], [13,3], [13,4], [13,11], [13,12], [13,13], [13,14],
    [14,1], [14,2], [14,3], [14,4], [14,11], [14,12], [14,13], [14,14],
    // 3rd layer
    [15,1], [15,2], [15,3], [15,4], [15,5], [15,10], [15,11], [15,12], [15,13], [15,14],
    [16,1], [16,2], [16,3], [16,4], [16,5], [16,10], [16,11], [16,12], [16,13], [16,14],
    [17,1], [17,2], [17,3], [17,4], [17,5], [17,10], [17,11], [17,12], [17,13], [17,14],
    [18,1], [18,2], [18,3], [18,4], [18,5], [18,10], [18,11], [18,12], [18,13], [18,14],
    // 4th layer
    [19,1], [19,2], [19,3], [19,4], [19,5], [19,6], [19,9], [19,10], [19,11], [19,12], [19,13], [19,14],
    [20,1], [20,2], [20,3], [20,4], [20,5], [20,6], [20,9], [20,10], [20,11], [20,12], [20,13], [20,14],
    //5th layer (top)
    [21,1], [21,2], [21,3], [21,4], [21,5], [21,6], [21,9], [21,10], [21,11], [21,12], [21,13], [21,14],
  ];

  // displayBoard
  async displayBoard(timeInterval = 1) {

    let index = 0;
    this.game.board = {}
    console.log("display board");
    console.log(Object.values(this.game.deck[0].cards));
    for (let i = 1; i <= 21; i++){
      for (let j = 1; j <= 14; j++){
        let position = `row${i}_slot${j}`;
        if (!this.isArrayInArray(this.emptyCells, [i,j])) {
          this.game.board[position] = Object.values(this.game.deck[0].cards)[index];
          index++;
        } else {
          this.game.board[position] = "E";
        }
      }
    }
    this.game.cardsLeft = index;
    this.game.selected = "";
    this.game.hidden=[];
    console.log(this.game);
    if (this.browser_active == 0) { return; }
    $(".slot").removeClass("empty");
    index = 0;
    try {
      //Want to add a timed delay for animated effect
      const timeout = ms => new Promise(res => setTimeout(res, ms));
      for (let i = 1; i <= 21; i++){
        for (let j = 1; j <= 14; j++){
          var divname = `row${i}_slot${j}`;
          if (!this.isArrayInArray(this.emptyCells, [i,j])) {
            await timeout(timeInterval);
            $('#' + divname).html(this.returnCardImageHTML(Object.values(this.game.deck[0].cards)[index++]));
          } else {
            this.makeInvisible(divname);
          }
        }
      }
      this.attachEventsToBoard();
    } catch (err) {
      console.log(err);
      console.log(this.game);
    }
  }

  makeInvisible(divname) {
    $('#' + divname).css('box-shadow','none');
    $('#' + divname).css('-moz-box-shadow','none');
    $('#' + divname).css('-webkit-box-shadow','none');
    $('#' + divname).css('-o-box-shadow','none');
    $('#' + divname).css('opacity','0.0');
    $('#' + divname).css('pointer-events','none');
  }

  returnCardImageHTML(name) {
    if (name[0] == 'E') { return ""; }
    else { return '<img src="/mahjong/img/tiles/white/'+name+'.png" />'; }
  }

  returnBackgroundImageHtml() {
    return '<img src="/mahjong/img/tiles/Export/Regular/Front.png" />';
  }

  //
  // runs whenever we load the game into the browser. render()
  //
  initializeHTML(app) {

    if (!this.browser_active) { return; }
    
    super.initializeHTML(app);


    //
    // Want Menus ?
    //
    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      }
    });
    this.menu.addSubMenuOption("game-game",{
      text : "Start New Game",
      id : "game-new",
      class : "game-new",
      callback : function(app, game_mod) {
      alert("New Game");
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "How to Play",
      id : "game-intro",
      class : "game-intro",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnGameRulesHTML());
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        game_mod.updateStatusWithOptions("Saving game to the blockchain...");
        game_mod.prependMove("exit_game\t"+game_mod.game.player);
        game_mod.endTurn();
      }
    });

    //
    // fullscren toggle?
    //
    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
    });

    //
    // chat menu?
    //
    this.menu.addChatMenu(app, this);

    //
    // render menu
    //
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    //
    // sidebar log
    //
    this.log.render(this.app, this);
    this.log.attachEvents(this.app, this);



    //
    // display the board?
    //
    this.displayBoard();

  }

  returnState() {

    let state = {};
    return state;

  }

  attachEventsToBoard() {

    let mahjong_self = this;
    console.log('mahjong_self');
    console.log(mahjong_self);

    $('.slot').off();
    $('.slot').on('click', function() {

      let card = $(this).attr("id");
      if (mahjong_self.game.board[card] !== "E") {
        switch (card) {
          case 'row19_slot7':
          case 'row20_slot7':
            if (!mahjong_self.game.hidden.includes('row21_slot7')) {
              return;
            } else {
              break;
            }
          case 'row19_slot8':
          case 'row20_slot8':
            if (!mahjong_self.game.hidden.includes('row21_slot8')) {
              return;
            } else {
              break;
            }
        }
      } else {
        return;
      }

      // console.log('mahjong_self.game');
      // console.log(mahjong_self.game);
      // console.log('mahjong_self.board');
      // console.log(mahjong_self.board);
      // console.log('mahjong_self.game.board[card]');
      // console.log(mahjong_self.game.board[card]);
      // console.log('selected');
      // console.log(mahjong_self.game.selected);
      if (mahjong_self.game.selected === card) { //Selecting same card again
        mahjong_self.untoggleCard(card);
        mahjong_self.game.selected = "";
        return;
      } else {
        if (mahjong_self.game.selected === "") { // New Card
          console.log('mahjong_self.selected');
          console.log(mahjong_self.game.selected);
          mahjong_self.game.selected = card;
          mahjong_self.toggleCard(card);
          return;
        } else {
          if (mahjong_self.game.board[card] === mahjong_self.game.board[mahjong_self.game.selected]) {
            mahjong_self.makeInvisible(card);
            mahjong_self.makeInvisible(mahjong_self.game.selected);
            mahjong_self.game.hidden.push(card);
            mahjong_self.game.hidden.push(mahjong_self.game.selected);
            mahjong_self.game.cardsLeft = mahjong_self.game.cardsLeft - 2;
            if (mahjong_self.game.cardsLeft === 0) {
              mahjong_self.game.state.wins++;
              mahjong_self.displayModal("Congratulations!", "You won!");
            }
            mahjong_self.game.selected = "";
            return;
          } else {
            // mahjong_self.untoggleCard(mahjong_self.game.selected);
            // mahjong_self.game.selected = "";
            // add invalid move effect
            mahjong_self.toggleInvalidCard(card);
            return;
          }
        }
        //  if (!selected) { //New Card

        // } else{
        //   //Change selection
        //   if (mahjong_self.game.board[card][0]!=="E"){ 
        //     mahjong_self.untoggleCard(selected);
        //     console.log('mahjong_self.game.board[0][card]');
        //     console.log(mahjong_self.game.board[card]);
        //     console.log('mahjong_self.game.board[0][selected]');
        //     console.log(mahjong_self.game.board[selected]);
        //     mahjong_self.toggleCard(card);
        //     selected=card;
            
        //     return;
        //   } 

        // // Move card to empty slot if it is legal
        // // selected must work in this context
        // if (mahjong_self.canCardPlaceInSlot(selected, card)) {
        //   mahjong_self.prependMove(`move\t${selected}\t${card}`);
        //   //mahjong_self.endTurn();
            
        //   let x = JSON.stringify(mahjong_self.game.board[selected]);
        //   let y = JSON.stringify(mahjong_self.game.board[card]);

        //   mahjong_self.game.board[selected] = JSON.parse(y);
        //   mahjong_self.game.board[card] = JSON.parse(x);
          
        //   mahjong_self.untoggleCard(card);
        //   mahjong_self.untoggleCard(selected);
       
        //   $("#"+selected).html(mahjong_self.returnCardImageHTML(mahjong_self.game.board[selected]));
        //   $("#"+card).html(mahjong_self.returnCardImageHTML(mahjong_self.game.board[card]));
        //   $("#"+selected).toggleClass("empty");
        //   $("#"+card).toggleClass("empty");
        //   $("#rowbox").removeClass("selected");
        //   selected = "";
          
        //   //Use recycling function to check if in winning state
        //   mahjong_self.displayUserInterface();

        //   if (mahjong_self.scanBoard(false)) {
        //     //salert("Congratulations! You win!");
        //     mahjong_self.displayModal("Congratulations!", "You win the deal!");
        //     mahjong_self.prependMove("win");
        //     mahjong_self.endTurn();
        //   }else if (!mahjong_self.hasAvailableMoves()){
        //     if (mahjong_self.game.state.recycles_remaining == 0){
        //       mahjong_self.displayWarning("Game over", "There are no more available moves to make.", 9000);
        //       //salert("No More Available Moves, you lose!");
        //     }else{
        //       mahjong_self.shuffleFlash();
        //     }
        //   }
        //   return;
  
        // } else {
        //   //SmartTip, slightly redundant with internal logic of canCardPlaceInSlot
        //   let smartTip;
        //   let predecessor = mahjong_self.getPredecessor(card);
        //   if (predecessor){
        //     let cardValue = parseInt(mahjong_self.returnCardNumber(predecessor))+1;
        //     if (cardValue < 11)
        //       smartTip = "Hint: Try a "+cardValue+" of "+mahjong_self.cardSuitHTML(mahjong_self.returnCardSuite(predecessor));
        //     else smartTip = "Unfortunately, no card can go there";
        //   }else{
        //     smartTip = "Hint: Try a 2 of any suit";
        //   }
        //   //Feedback
        //   mahjong_self.displayWarning("Invalid Move", "Sorry, "+mahjong_self.cardSuitHTML(mahjong_self.returnCardSuite(selected))+mahjong_self.returnCardNumber(selected)+" cannot go there... ");
        //   //salert("Sorry, "+mahjong_self.cardSuitHTML(mahjong_self.returnCardSuite(selected))+mahjong_self.returnCardNumber(selected)+" cannot go there... </p><p>"+smartTip+"</p>");
        //   mahjong_self.untoggleCard(selected);
        //   selected = "";
        //   $("#rowbox").removeClass("selected");
        //   return;
        // }
      // }
      }
    });
  }

  toggleCard(divname) {
    console.log("toggleCard");
    console.log(divname);
    divname = '#' + divname;
    $(divname).css('box-shadow', '0px 0px 0px 3px #00ff00');
    $(divname).css('-moz-box-shadow', '0px 0px 0px 3px #00ff00');
    $(divname).css('-webkit-box-shadow', '0px 0px 0px 3px #00ff00');
    $(divname).css('-o-box-shadow', '0px 0px 0px 3px #00ff00');
  }

  toggleInvalidCard(divname) {
    let mahjong_self = this;
    console.log("toggleInvalidCard");
    console.log(divname);
    $('#' + divname).css('box-shadow', '0px 0px 0px 3px #ff0000');
    $('#' + divname).css('-moz-box-shadow', '0px 0px 0px 3px #ff0000');
    $('#' + divname).css('-webkit-box-shadow', '0px 0px 0px 3px #ff0000');
    $('#' + divname).css('-o-box-shadow', '0px 0px 0px 3px #ff0000');
    setTimeout(() => {
      mahjong_self.untoggleCard(divname);
    }, 1000);
  }

  // untoggleAll(){
  //   $(".slot").css("opacity","1.0");
  // }

  untoggleCard(divname) {
    console.log("untoggleCard");
    console.log(divname);
    divname = '#' + divname;
    if (divname === "#row4_slot1" || divname === "#row4_slot14") {
      $(divname).css('box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-moz-box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-webkit-box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-o-box-shadow', '0px 10px 12px 1px #000000');
    } else {
      $(divname).css('box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-moz-box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-webkit-box-shadow', '0px 10px 12px 1px #000000');
      $(divname).css('-o-box-shadow', '0px 10px 12px 1px #000000');
    }
  }


  ////////////////////
  // VERY IMPORTANT //
  ////////////////////
  //
  // this is the main function for queue-based games. cryptographic logic
  // and shared commands (DEAL, SHUFFLE, etc.) are powered by the underlying
  // game engine, which kicks instructions here if it doesn't recognize them.
  //
  // the convention is for game-level instructions to be lowercase and game-
  // engine commands to be UPPERCASE so as to easily.
  //
  // return 0 -- halts execution
  // return 1 -- continues execution
  //
  // clear the queue manually and return 1 if there is no user-input at this
  // point in the game. if there is user-input, return 0 and the QUEUE will 
  // being to execute again the next time a move is received over the network.
  //
  handleGameLoop(msg=null) {

    // let mahjong_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      if (mv[0] === "play"){

        //
        // perhaps wait until game is being viewed to execute?
        //
        if (!this.browser_active) { return 0; }

        console.log("OUR CARDS: ");
        console.log(JSON.stringify(this.game.deck[0].hand));
        // alert("play handleGameLoop() -- why not replace this with an init function?");

        this.updateLog("add notes to log");
        this.updateStatus("display in status message box");

        this.game.queue.splice(qe, 1);
        return 1;

      }

      if (mv[0] === "exit_game"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1])
        this.saveGame(this.game.id);

        if (this.game.player === player){
          window.location.href = "/arcade";
        }else{
          this.updateStatus("Player has exited the building");
        }
        return 0;
      }

      return 1;

    } 

    //
    // nothing in queue, return 0 and halt
    //
    return 0; 

  }


  returnDeck() {

    let cards = [
      "Chun",
      "Hatsu",
      "Man1",
      "Man2",
      "Man3",
      "Man4",
      "Man5-Dora",
      "Man5",
      "Man6",
      "Man7",
      "Man8",
      "Man9",
      "Nan",
      "Pei",
      "Pin1",
      "Pin2",
      "Pin3",
      "Pin4",
      "Pin5-Dora",
      "Pin5",
      "Pin6",
      "Pin7",
      "Pin8",
      "Pin9",
      "Shaa",
      "Sou1",
      "Sou2",
      "Sou3",
      "Sou4",
      "Sou5-Dora",
      "Sou5",
      "Sou6",
      "Sou7",
      "Sou8",
      "Sou9",
      "Ton"
    ];

    let deck = {};
    
    for (let j=0; j<4; j++){
      cards.sort(() => Math.random() - 0.5);
      for (let i = 0; i<cards.length; i++) {
        let name = cards[i];
        deck[`${name}_${j}`] = name;
      }
    }

    return deck;

  }


}

module.exports = Mahjong;

