const OnePlayerGameTemplate = require("../../lib/templates/oneplayergametemplate");
const BeleagueredGameRulesTemplate = require("./lib/beleaguered-game-rules.template");

//////////////////
// CONSTRUCTOR  //
//////////////////
class Beleaguered extends OnePlayerGameTemplate {
  constructor(app) {
    super(app);

    this.name = "Beleaguered";
    this.gamename = "Beleaguered Castle";
    this.slug = "beleaguered";
    this.description = "Stack all cards by suit from aces to kings to win this game";
    this.categories = "Games Cardgame One-player";
    this.publisher_message =
      "developed by Pawel (twitter: @PawelPawlak14). Feel free to pm me with any suggestions/feedback";

    this.app = app;
    this.status = "Beta";
    this.sides = ["r", "l"];
  }

  returnGameRulesHTML() {
    return BeleagueredGameRulesTemplate(this.app, this);
  }

  initializeGame(game_id) {
    console.log("SET WITH GAMEID: " + game_id);

    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = this.returnState();
      this.game.queue = [];
      this.game.queue.push("round");
      this.game.queue.push("READY");
    }

    console.log(JSON.parse(JSON.stringify(this.game)));

    if (this.browser_active) {
      $(".slot").css("min-height", $(".card").css("min-height"));
    }
  }

  newRound() {
    //Set up queue
    this.game.queue = [];
    this.game.queue.push("play");
    this.game.queue.push("DEAL\t1\t1\t48");
    this.game.queue.push("SHUFFLE\t1\t1");
    this.game.queue.push("DECK\t1\t" + JSON.stringify(this.returnDeck()));

    //Clear board
    this.game.board = {};
  }



  async render(app) {
    //console.trace("Initialize HTML");
    if (!this.browser_active) {
      return;
    }

    await super.render(app);

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");

    this.menu.addSubMenuOption("game-game", {
      text: "Start New Game",
      id: "game-new",
      class: "game-new",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.prependMove("lose");
        game_mod.endTurn();
      },
    });
    /*this.menu.addSubMenuOption("game-game", {
      text: "Play Mode",
      id: "game-play",
      class: "game-play",
      callback: function (app, game_mod) {
        game_mod.menu.showSubSubMenu("game-play");
      }
    });
    */

    this.menu.addSubMenuOption("game-game", {
      text: "How to Play",
      id: "game-intro",
      class: "game-intro",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnGameRulesHTML());
      },
    });

    this.menu.addSubMenuOption("game-game", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnStatsHTML());
      },
    });

    await this.menu.addChatMenu();
    this.menu.render();
  }

  getSlotSide(id) {
    if (id.length === 6) {
      return "m";
    } else {
      return id.substring(10, 11);
    }
  }

  getSlotNumber(id) {
    if (id.length !== 6) {
      return parseInt(id.substring(11));
    }
  }

  getSlotRow(id) {
    return parseInt(id.substring(3, 4));
  }

  attachEventsToBoard() {
    let beleaguered_self = this;

    $(".slot").off();
    $(".slot").on("click", function () {
      let slot = $(this).attr("id");

      if (beleaguered_self.game.selected == "") {
        // can only click valid (outermost) cards
        if (!beleaguered_self.game.availableMoves.includes(slot)) {
          return;
        }
        beleaguered_self.game.selected = slot;
        beleaguered_self.toggleCard(slot);
        // reset availableMoves
        beleaguered_self.calculateAvailable(slot);
      } else {
        // clicking the same card - untoggle and recalculate available moves
        if (beleaguered_self.game.selected === slot) {
          beleaguered_self.untoggleCard(slot);
          beleaguered_self.game.selected = "";
          beleaguered_self.calculateAvailable("");
        } else {
          if (beleaguered_self.game.availableMoves.includes(slot)) {
            beleaguered_self.game.board[slot] =
              beleaguered_self.game.board[beleaguered_self.game.selected];
            beleaguered_self.game.board[beleaguered_self.game.selected] = "E";
            beleaguered_self.untoggleCard(beleaguered_self.game.selected);

            let moveToSide = beleaguered_self.getSlotSide(slot);
            let moveToRow = beleaguered_self.getSlotRow(slot);

            let moveFromSide = beleaguered_self.getSlotSide(beleaguered_self.game.selected);
            let moveFromRow = beleaguered_self.getSlotRow(beleaguered_self.game.selected);
            if (moveToSide !== "m") {
              beleaguered_self.game.outerMost[`${moveToSide}${moveToRow}`] =
                beleaguered_self.game.outerMost[`${moveToSide}${moveToRow}`] + 1;
            }

            beleaguered_self.game.outerMost[`${moveFromSide}${moveFromRow}`] =
              beleaguered_self.game.outerMost[`${moveFromSide}${moveFromRow}`] - 1;

            beleaguered_self.game.selected = "";
            beleaguered_self.displayBoard();
            beleaguered_self.calculateAvailable("");
          } // else - do nothing (invalid move)
        }
      }
    });
  }

  calculateAvailable(selectedSlot) {
    let outerMost = Object.keys(this.game.outerMost);
    // calculate available when nothing is selected
    if (selectedSlot === "") {
      this.removeAllAvailable();
      // check if any of the side stacks have no cards - if that's the case
      // then all other side stacks' outermost cards are available moved
      let stacksWithCards = [];
      for (let i = 0; i < outerMost.length; i++) {
        if (this.game.outerMost[outerMost[i]] !== -1) {
          let side = outerMost[i][0];
          let row = outerMost[i][1];
          stacksWithCards.push(`row${row}_slot_${side}${this.game.outerMost[outerMost[i]]}`);
        }
      }
      // at least one side stack without cards found
      if (stacksWithCards.length < 8) {
        // win
        if (stacksWithCards.length === 0) {
          this.displayModal("Congratulations!", "You win the deal!");
          this.prependMove("win");
          this.endTurn();
        }
        for (let i = 0; i < stacksWithCards.length; i++) {
          this.makeVisible(stacksWithCards[i]);
          this.enableAvailable(stacksWithCards[i]);
        }
        return; // no more checks required
      }
      // get outermost cards
      for (let i = 0; i < outerMost.length; i++) {
        let side = outerMost[i][0];
        let row = outerMost[i][1];
        let cardSlot = `row${row}_slot_${side}${this.game.outerMost[outerMost[i]]}`;
        let cardSuit = this.returnCardSuite(cardSlot);
        let cardNumber = parseInt(this.returnCardNumber(cardSlot));

        // outermost card is a valid move, if one greater than its suits' middle stack
        let middleStackCurrentCard = "row1_m";
        if (cardSuit === "D") {
          middleStackCurrentCard = "row2_m";
        } else if (cardSuit === "H") {
          middleStackCurrentCard = "row3_m";
        } else if (cardSuit === "S") {
          middleStackCurrentCard = "row4_m";
        }
        let middleStackCurrentCardNumber = parseInt(this.returnCardNumber(middleStackCurrentCard));
        if (middleStackCurrentCardNumber + 1 === cardNumber) {
          this.enableAvailable(cardSlot);
          continue;
        }

        // if another outermost card is one greater than currently checked other outermost card,
        // add current card to available moves
        for (let j = 0; j < outerMost.length; j++) {
          let comparedCardSide = outerMost[j][0];
          let comparedCardRow = outerMost[j][1];
          let comparedCardSlot = `row${comparedCardRow}_slot_${comparedCardSide}${
            this.game.outerMost[outerMost[j]]
          }`;
          let comparedCardNumber = parseInt(this.returnCardNumber(comparedCardSlot));
          if (comparedCardNumber - 1 === cardNumber) {
            this.enableAvailable(cardSlot);
            continue;
          }
        }
      }
    } else {
      // calculate available for selected card
      this.removeAllAvailable();
      let cardSuit = this.returnCardSuite(selectedSlot);
      let cardNumber = parseInt(this.returnCardNumber(selectedSlot));
      // move to a function
      let middleStackCurrentCard = "row1_m";
      if (cardSuit === "D") {
        middleStackCurrentCard = "row2_m";
      } else if (cardSuit === "H") {
        middleStackCurrentCard = "row3_m";
      } else if (cardSuit === "S") {
        middleStackCurrentCard = "row4_m";
      }
      let middleStackCurrentCardNumber = parseInt(this.returnCardNumber(middleStackCurrentCard));
      // add middle slot to available moves
      if (middleStackCurrentCardNumber + 1 === cardNumber) {
        this.enableAvailable(middleStackCurrentCard);
      }
      for (let i = 0; i < outerMost.length; i++) {
        let side = outerMost[i][0];
        let row = outerMost[i][1];
        if (this.game.outerMost[outerMost[i]] === -1) {
          // empty slot
          emptySlot = `row${row}_slot_${side}0`;
          this.makeVisible(emptySlot);
          this.enableAvailable(emptySlot);
        } else {
          // check if current side and row outermost is one higher than selected card
          let rowAndSideOuter = `row${row}_slot_${side}${this.game.outerMost[outerMost[i]]}`;
          let availableSlot = `row${row}_slot_${side}${this.game.outerMost[outerMost[i]] + 1}`;
          if (parseInt(this.returnCardNumber(rowAndSideOuter)) - 1 === cardNumber) {
            this.makeVisible(availableSlot);
            this.enableAvailable(availableSlot);
          }
        }
      }
    }
    console.log("this.game.availableMoves");
    console.log(this.game.availableMoves);
    if (this.game.availableMoves.length === 0) {
      this.displayWarning("Game over", "There are no more available moves to make.", 9000);
    }
  }

  enableAvailable(divname) {
    if (!this.game.availableMoves.includes(divname)) {
      $(`#${divname}`).addClass("valid");
      this.game.availableMoves.push(divname);
    }
  }

  removeAvailable(divname) {
    let index = -1;
    for (let i = 0; i < this.game.availableMoves.length; i++) {
      if (this.game.availableMoves[i] === divname) {
        index = i;
        $(`#${this.game.availableMoves[i]}`).removeClass("valid");
        break;
      }
    }
    if (index > -1) {
      this.game.availableMoves.splice(index, 1);
    }
  }

  removeAllAvailable() {
    if (this.game.availableMoves !== undefined) {
      for (let i = 1; i <= 4; i++) {
        for (let j = 0; j <= 17; j++) {
          for (let s = 0; s < this.sides.length; s++) {
            $(`#row${i}_slot_${this.sides[s]}${j}`).removeClass("valid");
          }
        }
      }
      $("#row1_m").removeClass("valid");
      $("#row2_m").removeClass("valid");
      $("#row3_m").removeClass("valid");
      $("#row4_m").removeClass("valid");
    }
    this.game.availableMoves = [];
  }

  toggleCard(divname) {
    $(`#${divname}`).addClass("selected");
    $(".gameboard").addClass("selected_state");
  }

  untoggleAll() {
    $(".slot").css("opacity", "1.0");
    $(".selected_state").removeClass("selected_state");
  }

  untoggleCard(divname) {
    $(`#${divname}`).removeClass("selected");
    $(".selected_state").removeClass("selected_state");
  }

  hideCard(divname) {
    divname = "#" + divname;
    $(divname).css("opacity", "0.0");
  }

  /* Copy hand into board*/
  handToBoard() {
    this.game.availableMoves = [];
    this.removeAllAvailable();
    if (!("board" in this.game) || Object.values(this.game.board).length === 0) {
      this.game.outerMost = []; // track the outermost card for each row and side
      let indexCt = 0;
      this.game.board["row1_m"] = "C1";
      this.game.board["row2_m"] = "D1";
      this.game.board["row3_m"] = "H1";
      this.game.board["row4_m"] = "S1";
      for (let i = 1; i <= 4; i++) {
        for (let j = 0; j <= 17; j++) {
          for (let s = 0; s < this.sides.length; s++) {
            this.game.outerMost[`${this.sides[s]}${i}`] = 5;
            let position = `row${i}_slot_${this.sides[s]}${j}`;
            if (j < 6) {
              this.game.board[position] =
                this.game.deck[0].cards[this.game.deck[0].hand[indexCt++]];
              this.makeVisible(position);
            } else {
              this.game.board[position] = "E";
            }
          }
        }
      }
    } else {
      this.game.outerMost = [];
      for (let i = 1; i <= 4; i++) {
        for (let s = 0; s < this.sides.length; s++) {
          for (let j = 0; j <= 17; j++) {
            let position = `row${i}_slot_${this.sides[s]}${j}`;
            if (this.game.board[position] === "E") {
              this.game.outerMost[`${this.sides[s]}${i}`] = j - 1;
              j = 18; // break the innermost loop
            }
          }
        }
      }
    }

    this.game.selected = "";
    this.calculateAvailable("");
    this.game.previousMoves = [];
  }

  parseIndex(slot) {
    let coords = slot.split("_");
    let x = coords[0].replace("row", "");
    let y = coords[1].replace("slot", "");
    return 10 * (parseInt(x) - 1) + parseInt(y) - 1;
  }

  async handleGameLoop(msg = null) {
    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      console.log(JSON.stringify(mv));

      if (mv[0] === "round") {
        this.removeAllAvailable();
        this.newRound();
      }

      if (mv[0] === "win") {
        this.game.state.session.round++;
        this.game.state.session.wins++;
        this.game.queue.push("round");
        this.game.queue.push(
          `ROUNDOVER\t${JSON.stringify([this.publicKey])}\t${JSON.stringify(
            []
          )}`
        );
      }

      if (mv[0] === "lose") {
        this.game.state.session.round++;
        this.game.state.session.losses++;
        this.game.queue.push("round");
        this.game.queue.push(
          `ROUNDOVER\t${JSON.stringify([])}\t${JSON.stringify([
            this.publicKey
          ])}`
        );
      }

      if (mv[0] === "play") {
        //this.game.queue.splice(qe, 1);
        if (this.browser_active) {
          this.handToBoard();
          this.displayBoard();
          this.displayUserInterface();
        }
        return 0;
      }

      if (mv[0] === "move") {
        this.game.queue.splice(qe, 1);
        let card = mv[1]; //rowX_slotY
        let emptySlot = mv[2]; //rowX_slotY

        let x = this.parseIndex(card);
        let y = this.parseIndex(emptySlot);

        let temp = this.game.deck[0].hand[x];
        this.game.deck[0].hand[x] = this.game.deck[0].hand[y];
        this.game.deck[0].hand[y] = temp;
      }
    }
    return 1;
  }

  displayBoard() {
    if (this.browser_active == 0) {
      return;
    }
    for (let i in this.game.board) {
      let divname = "#" + i;
      $(divname).html(this.returnCardImageHTML(this.game.board[i]));
      this.untoggleCard(i);
      if (this.game.board[i][0] == "E") {
        this.makeInvisible(divname);
      }
    }

    this.attachEventsToBoard();
  }

  makeInvisible(divname) {
    $(`${divname}`).addClass("invisible");
    $(`${divname}`).removeClass("selected");
  }

  makeVisible(divname) {
    $(`#${divname}`).removeClass("invisible");
  }

  /*
  no status atm, but this is to update the hud
  */
  displayUserInterface() {
    let html =
      '<span class="hidable">Place all cards ascending by number on their suit stacks to win the game.<br>' +
      "Cards can be moved around on higher cards on the side stacks regardless of their suit. Any card can be placed on the empty side stack</span>";

    this.updateStatusWithOptions(html, "");
  }

  returnCardImageHTML(name) {
    // return '<img src="/beleaguered/img/cards/C1.png"/>'
    if (name[0] == "E") {
      return "";
    } else {
      return '<img src="/beleaguered/img/cards/' + name + '.png" />';
    }
  }

  returnDeck() {
    let suits = ["S", "C", "H", "D"];
    var deck = {};
    for (let i = 0; i < 4; i++)
      for (let j = 2; j <= 13; j++) {
        let name = suits[i] + j;
        deck[name] = name;
      }

    return deck;
  }

  returnCardSuite(slot) {
    let card = this.game.board[slot];
    return card[0];
  }

  cardSuitHTML(suit) {
    switch (suit) {
      case "D":
        return "&diams;";
      case "H":
        return "&hearts;";
      case "S":
        return "&spades;";
      case "C":
        return "&clubs;";
      default:
        return "";
    }
  }

  returnCardNumber(slot) {
    let card = this.game.board[slot];
    if (card[0] === "E")
      //empty slot
      return 0;
    return card.substring(1);
  }
}

module.exports = Beleaguered;

