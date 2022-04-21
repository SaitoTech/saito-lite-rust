const GameTemplate = require("../../lib/templates/gametemplate");

class Wordblocks extends GameTemplate {

  constructor(app) {
    super(app);

    this.name = "Wordblocks";
    this.gamename = "Wordblocks";

    this.wordlist = [];
    this.letterset = {};
    this.mydeck = {};
    this.score = "";
    this.app = app;
    this.name = "Wordblocks";
    this.description = `Wordblocks is a word game in which two to four players score points by placing TILES bearing a single letter onto a board divided into a grid of squares. The tiles must form words that, in crossword fashion, read left to right in rows or downward in columns, and be included in a standard dictionary or lexicon.`;
    this.categories = "Game Arcade Entertainment";
    //
    // Game Class VARS
    //
    this.minPlayers = 2;
    this.maxPlayers = 4;
    this.type = "Wordgame";

    this.boardWidth = 1000;
    this.tileHeight = 163;
    this.tileWidth = 148;
    this.letters = {};
    this.moves = [];
    this.firstmove = 1;
    this.last_played_word = [];

    this.defaultMsg = `Click on the board to enter a word from that square, click a tile to select it for play, or <span class="link tosstiles" title="Double click tiles to select them for deletion">discard tiles</span> if you cannot move.`;

    return this;
  }
  // requestInterface(type) {
  //
  //   if (type == "arcade-sidebar") {
  //     return { title: this.name };
  //   }
  //   return null;
  // }
  //
  // manually announce arcade banner support
  //
  respondTo(type) {
    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }
    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/wordblocks/img/arcade/arcade-banner-background.png";
      obj.title = "Wordblocks";
      return obj;
    }

    return null;
  }

  initializeHTML(app) {

    if (!this.browser_active) { return; }

    super.initializeHTML(app);

    this.app.modules.respondTo("chat-manager").forEach((mod) => {
      mod.respondTo("chat-manager").render(this.app, this);
    });

    this.menu.addMenuOption({
      text: "Game",
      id: "game-game",
      class: "game-game",
    });
    this.menu.addSubMenuOption("game-game", {
      text: "How to Play",
      id: "game-intro",
      class: "game-intro",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(
          game_mod.app,
          game_mod,
          game_mod.returnGameRulesHTML()
        );
      },
    });

    this.menu.addSubMenuOption("game-game", {
      text: "Log",
      id: "game-log",
      class: "game-log",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Stats",
      id: "game-stats",
      class: "game-stats",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(
          game_mod.app,
          game_mod,
          game_mod.returnStatsOverlay()
        );
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Exit",
      id: "game-exit",
      class: "game-exit",
      callback: function (app, game_mod) {
        window.location.href = "/arcade";
      },
    });

    this.menu.addChatMenu(app, this);
    this.menu.addMenuIcon({
      text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id: "game-menu-fullscreen",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      },
    });
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.hud.auto_sizing = 0; //turn off default sizing
    this.hud.render(app, this);
    this.hud.attachEvents(app, this); //Enable dragging

    this.restoreLog();
    this.log.render(app, this);
    this.log.attachEvents(app, this);


    try {
      //Let's Try a PlayerBox instead of hud
      this.playerbox.render(app, this);
      this.playerbox.attachEvents(app);

      this.playerbox.groupOpponents(false);
      $("#opponentbox *").disableSelection();

      for (let i = 1; i <= this.game.players.length; i++) {
        this.playerbox.refreshName(i);
        this.playerbox.refreshInfo(
          `<span>Player ${i}:</span> <span class="playerscore" id="score_${i}">${this.getPlayerScore(
            i
          )}</span>`,
          i
        );

        let lastMove = this.getLastMove(i);
        let html = `<div class="lastmove" id="lastmove_${i}"><span>Last:</span><span class="playedword" style="text-decoration:none">${lastMove.word}</span> <span class="wordscore">${lastMove.score}</span></div>`;
        this.playerbox.refreshLog(html, i);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        this.hammer.render(this.app, this);
        this.hammer.attachEvents(this.app, this, ".gameboard");
      } else {
        this.sizer.render(this.app, this);
        this.sizer.attachEvents(this.app, this, ".gameboard");
      }
    } catch (err) {
      console.error(err);
    }


  }

  returnGameRulesHTML() {
    let overlay_html = `
      <div class="rules-overlay">
      <div class="intro">
      <h1>Wordblocks</h1>
      <p>Wordblocks is a crossword puzzle spelling game, similar to the classic boardgame.</p> 
      <p>Players take turns spelling words using the seven letters in their tile rack and available space on the game board. The game ends when one player finishes all the letters in their rack and there are no remaining tiles to draw. The player with the highest score wins!</p>
      <p>Words must be at least two letters in length and connect to an already played letter. Players may discard any number of tiles from their rack in lieu of playing a word.</p>
      <p>Words are checked against a dictionary for validity. You may select the dictionary in the advanced options.</p>
      <h2>Scoring</h2>
      <p>Each letter is worth the number of points indicated on the tile. The score for the word is the sum of point values of its letters, which may be affected by playing the word over bonus spaces on the board. There are bonus spaced that double or triple the point value of a single letter or the entire word.</p>
      <p>If you use all 7 tiles in one play, you receive 10 additional points to the letter score and a +1 multiple on the overall word score.</p>
      <p>Good luck and happy spelling!</p>
      </div></div>`;
    return overlay_html;
  }

  returnMath(play) {
    let sum = 0;
    let html = `<div class="score-overlay"><table>
              <thead><tr><td>Word</td><td>Calculation</td><td>Points</td></tr></thead><tbody>`;
    for (let word of play) {
      html += `<tr><td>${word.word}</td><td>${word.math}</td><td>${word.score}</td></tr>`;
      sum += word.score;
    }

    html += `</tbody><tfoot><tr><td colspan="3"><hr></td></tr><tr><td>Total:</td><td></td><td>${sum}</td></tr></tfoot></table></div>`;
    return html;
  }

  returnStatsOverlay() {
    let html = `<div class="stats-overlay"><table cellspacing="10px" rowspacing="10px"><tr><th>Round</th>`;
    for (let i = 0; i < this.game.opponents.length + 1; i++) {
      html += `<th colspan="2">Player ${i + 1}</th>`;
    }

    let totals = new Array(this.game.opponents.length + 1); //Each players total...
    totals.fill(0);
    console.log(this.game.opponents);
    for (let z = 0; z < this.game.words_played[0].length; z++) {
      html += `</tr><tr><td>${z + 1}</td>`;
      for (let i = 0; i < this.game.opponents.length + 1; i++) {
        //totals.push(0); //Initialize
        //let words_scored_html = '<table>';
        if (this.game.words_played[i][z] != undefined) {
          html +=
            "<td>" +
            this.game.words_played[i][z].word +
            "</td><td>" +
            this.game.words_played[i][z].score +
            "</td>";
          totals[i] += this.game.words_played[i][z].score;
        }
      }
      //words_scored_html += '</table>';
      //html += `<td>${words_scored_html}</td>`;
    }
    console.log(totals);
    html +=
      '</tr><tr><td colspan="10"><hr></td></tr><tfoot><tr><td>Totals</td>';
    for (let total of totals) {
      html += `<td colspan="2">${total}</td>`;
    }
    html += "</tr></tfoot></table></div>";
    return html;
  }

  initializeGame(game_id) {

    // OBSERVER MODE
    //if (this.game.player == 0) { return; }

    this.updateStatus("loading game...");
    this.loadGame(game_id);

    if (this.wordlist == "") {
      //TODO -- Dynamically read letter tiles so wordblocks can more easily add new languages
      try {
        var dictionary = this.game.options.dictionary;
        let durl = "/wordblocks/dictionaries/" + dictionary + "/" + dictionary + ".json";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", durl, false); //true -> async 
        //xhr.responseType = "json"; //only in async
        xhr.send();
        //xhr.onload = ()=>{
        if (xhr.status != 200) {
          salert(`Network issues downloading dictionary -- ${durl}`);
        } else {
          this.wordlist = Array.from(JSON.parse(xhr.response));
          //console.log("\n\n\nDOWNLOADED WORDLIST: " + JSON.parse(JSON.stringify(xhr.response)));
          console.log("My word list is a :", typeof this.wordlist);
        }
        //};
      } catch (err) {
        // instead of onerror
        console.error(err);
        salert("Network issues downloading dictionary, error caught");
      }
    }


    //
    // deal cards
    //
    if (this.game.deck.length == 0 && this.game.step.game == 1) {
      this.updateStatus("Generating the Game");

      this.game.queue.push("READY");
      for (let i = this.game.players.length; i > 0; i--) {
        this.game.queue.push(`DEAL\t1\t${i}\t7`);
      }
      for (let i = this.game.players.length; i > 0; i--) {
        this.game.queue.push(`DECKENCRYPT\t1\t${i}`);
      }
      for (let i = this.game.players.length; i > 0; i--) {
        this.game.queue.push(`DECKXOR\t1\t${i}`);
      }
      this.game.queue.push("DECK\t1\t" + JSON.stringify(this.returnDeck()));
    }
    //
    // stop here if initializing
    //
    if (this.game.initializing == 1) {
      return;
    }

    //
    // return letters
    //
    this.letters = this.returnLetters();


    //
    // load any existing tiles
    //
    if (this.game.board == undefined) {
      //
      // new board
      //
      this.game.board = this.returnBoard();
    } else {
      //
      // load board
      //
      for (var i in this.game.board) {
        let divname = "#" + i;
        let letter = this.game.board[i].letter; // $(divname).html(this.returnTile(letter));
        this.addTile($(divname), letter);
        if (!(letter == "_") && !(letter == "")) {
          try {
            $(divname).addClass("set");
          } catch (err) { }
        }
      }
    }

    //
    // has a move been made
    //
    for (let i = 1; i < 16; i++) {
      for (let k = 1; k < 16; k++) {
        let boardslot = i + "_" + k;
        if (this.game.board[boardslot].letter != "_") {
          this.firstmove = 0;
        }
      }
    }

    /*This starts the game*/
    if (this.game.target == this.game.player) {
      this.updateStatusWithTiles("YOUR GO! " + this.defaultMsg);
      this.enableEvents();
    } else {
      this.updateStatusWithTiles(
        `Waiting for Player ${this.game.target} to move.`
      );
    }

  }

  /*
  A utility function to return the given players score with ample validity checking and dynamic creation of property
  */
  getPlayerScore(player) {
    if (this.game.score == undefined) {
      this.game.score = [];
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.score[i] = 0;
      }
      return 0;
    } else {
      if (player >= 1 && player <= this.game.players.length) {
        return this.game.score[player - 1];
      }
    }
    return 0;
  }

  /*
  A utility function to return the given players last played word with ample validity checking and dynamic creation of property
  */
  getLastMove(player) {
    if (this.game.words_played == undefined) {
      this.game.words_played = [];
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.words_played[i] = [];
      }
    } else {
      if (player >= 1 && player <= this.game.players.length) {
        let playersMoves = this.game.words_played[player - 1];
        if (playersMoves.length > 0) {
          return playersMoves[playersMoves.length - 1];
        }
      }
    }
    return { word: "", score: 0 };
  }

  updateStatusWithTiles(status) {
    try {
      let tile_html = "";
      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
        tile_html += this.returnTileHTML(
          this.game.deck[0].cards[this.game.deck[0].hand[i]].name
        );
      }

      let html = `
      <div class="hud-status-update-message">${status}</div>
      <div class="status_container">
        <div class="rack" id="rack">
          <div class="tiles" id="tiles">
            ${tile_html}
          </div>
        </div>
        <div class="subrack" id="subrack">
          <div class="rack-controls">
            <div id="shuffle" class="shuffle">Shuffle: <i class="fa fa-random"></i></div>
            <div id="deletectrl" class="hidden deletectrl"><i class="fa fa-trash" aria-hidden="true" id="delete"></i><i id="canceldelete" class="far fa-window-close"></i></div>
            <div>Remaining Tiles: ${this.game.deck[0].crypt.length}</div>
          </div>
        </div>
      </div
    `;

      this.updateStatus(html); //Attach html to #status box
      this.limitedEvents(); //Baseline functionality
    } catch (err) {
      console.error(err);
    }
  }

  returnTileHTML(letter) {
    let html = "";
    let letterScore = this.returnLetters();
    if (letterScore[letter]) {
      //html =`<div class="tile ${letter} sc${letterScore[letter].score}">${letter}</div>`;
      html = `<div class="tile"><div class="letter sc${letterScore[letter].score}">${letter}</div></div>`;
    }
    return html;
  }

  addTile(obj, letter) {
    if (letter !== "_") {
      obj.find(".bonus").css("display", "none");
      obj.append(this.returnTileHTML(letter));
    }
  }

  /*
  Basic events for all players to interact with their hud even when not their turn
  */
  limitedEvents() {
    let wordblocks_self = this;

    if (this.browser_active == 1) {
      $(".slot").off();
      $("#rack .tile").off();

      $("#tiles").disableSelection();
      //Drag to Sort tiles on Rack
      $("#tiles").sortable({
        axis: "x",
        tolerance: "pointer",
        containment: "parent",
        distance: 3,
        start: function (event, ui) {
          $(ui.item).addClass("noclick");
        },
        stop: function (event, ui) {
          setTimeout(function () {
            $(ui.item).removeClass("noclick");
          }, 350);
        },
      });

      //Shuffle Rack
      $("#shuffle").on("click", function () {
        for (var i = $("#tiles").children.length; i >= 0; i--) {
          $("#tiles")[0].appendChild(
            $("#tiles")[0].childNodes[(Math.random() * i) | 0]
          );
        }
      });
      /* Click to popup more information on what the last move just was */
      for (let i = 1; i <= this.game.players.length; i++) {
        let handle = "#lastmove_" + i;
        $(handle).off();
        $(handle).on("click", function () {
          if (
            wordblocks_self.last_played_word[i - 1] &&
            wordblocks_self.last_played_word[i - 1].play
          ) {
            wordblocks_self.overlay.show(
              wordblocks_self.app,
              wordblocks_self,
              wordblocks_self.returnMath(
                wordblocks_self.last_played_word[i - 1].play
              )
            );
          }
        });
      }
    }
  }

  enableEvents() {
    if (this.browser_active == 1) {
      this.addEventsToBoard();
    }
  }

  /*
    Create event listeners for user interaction
    We have various modes, which when changed need to call this function again to refresh the event model
    hud-status-update-message
  */
  async addEventsToBoard() {

    if (this.browser_active == 0) {
      return;
    }
    let wordblocks_self = this;
    let tile = document.querySelector(".highlighttile");
    let interactiveMode =
      document.querySelector(".slot .tempplacement") ||
      document.querySelector("#tiles .highlighttile");

    try {
      /*
      Define a few helper functions because there are multiple ways to get to the same code
      */
      const revertToPlay = function () {
        //Unselect all double-clicked tiles
        $(".tiles .tile").removeClass("todelete");
        $("#tiles").sortable("enable");
        $("#deletectrl").addClass("hidden");
        $("#delete").off();
        $("#canceldelete").off();
        wordblocks_self.addEventsToBoard();
      };
      const selectTile = function (selection, e) {
        $(".highlighttile").removeClass("highlighttile");
        tile = selection;
        $(tile).addClass("highlighttile");
        let helper = tile.cloneNode(true);
        helper.id = "helper";
        $(document.body).append(helper);
        $("#helper").css({ top: e.clientY - 25, left: e.clientX - 25 });

        $("#status").on("click", function () {
          console.log("*** Click on rack ***");
          returnToRack(tile);
        });
      };
      const deselectTile = function () {
        $(".highlighttile").removeClass("highlighttile");
        tile = null;
        $("#helper").remove();
        $("#status").off();
      };
      const returnToRack = function (tile) {
        let slot = tile.parentElement.id;
        $("#tiles").append(tile);
        $(tile).removeClass("tempplacement");
        console.log("slot: " + slot);
        deselectTile();
        if (slot != "tiles") {
          wordblocks_self.game.board[slot].letter = "_";
          //Show bonus information if uncovered
          $(`#${slot}`).find(".bonus").css("display", "flex");
          checkBoard(); //Helper function to display submission button if deleting this tile gives us a "playable" word  
        }

        //if (!(document.querySelector(".slot .tempplacement") || document.querySelector("#tiles .highlighttile"))) {
        wordblocks_self.addEventsToBoard();
        //}
      }

      const checkBoard = function () {
        $(".tile-placement-controls").remove(); //Removes previous addition
        //Popup to commit word
        //Get the x,y, orientation and word from tiles
        let [word, orientation, y, x] = wordblocks_self.readWordFromBoard();
        if (word) {

          let html = `
            <div class="tile-placement-controls">
              <div class="playable ${(wordblocks_self.checkWord(word) ? "valid_word" : "invalid_word")}">${word}</div>
              <div class="action" id="submit"><i class="fa fa-paper-plane"></i> Submit</div>
              <div class="action" id="cancel"><i class="far fa-window-close"></i> Cancel</div>
            </div>`;

          $("#hud").append(html);

          /*Need to dynamically check for portrait mode...
          if (window.innerWidth > innerHeight){
            $(".tile-placement-controls").addClass("landscape-mode");  
          }else{
            $(".tile-placement-controls").addClass("portrait-mode");
          }*/


          $(".action").off();
          $(".action").on("click", function () {
            $(".action").off();
            $(".tile-placement-controls").remove();
            //Remove the temporary tiles
            wordblocks_self.clearBoard();
            if ($(this).attr("id") == "submit") {
              console.log(`Submitting ${word}, ${orientation} at column ${x}, row ${y}`);
              wordblocks_self.tryPlayingWord(x, y, orientation, word);
            } else { //reload events
              wordblocks_self.addEventsToBoard();
            }
          });
        }
      };

      //Float helper tile with mouse over board
      $(document).on("mousemove", function (e) {
        //$("#helper").css("transform",`translate(${e.clientX+5}px, ${e.clientY+5}px)`);
        $("#helper").css({ top: e.clientY - 25, left: e.clientX - 25 });
      });

      $("#shuffle").off(); //Don't want to shuffle when manually placing tiles or deleting
      $(".slot").off(); //Reset clicking on board

      $("#rack .tile").off();

      //Single click to select a tile and enter interactive placement mode
      $("#rack .tile").on("click", function (e) {
        if (!$(this).hasClass("noclick")) {
          //Wasn't just dragging this tile and triggering a click event
          if (tile == this) {
            deselectTile();
          } else {
            deselectTile();
            if (!$(this).hasClass("highlighttile")) {
              console.log("Selection: " + this);
              selectTile(this, e); //Helper function to create floating tile
            }
          }

          //Reload events if changing input model
          if (interactiveMode != (document.querySelector(".slot .tempplacement") ||
            document.querySelector("#tiles .highlighttile")))
            wordblocks_self.addEventsToBoard();

        }
        e.stopPropagation();
      });

      //Discard Tiles -- Method 2
      $("#rack .tile").on("dblclick", function () {
        //Toggle deleted on/off with each double click
        this.classList.toggle("todelete");

        //Do we have tiles selected for deletion?
        let deletedTiles = "";
        let tileRack = document.querySelectorAll(".tiles .tile");
        for (let i = 0; i < tileRack.length; i++) {
          if (tileRack[i].classList.contains("todelete"))
            deletedTiles += tileRack[i].textContent;
        }

        //If tiles selected for deletion enter deletemode
        if (deletedTiles.length > 0) {
          $(".hud-status-update-message").text(
            "Select the tiles you want to trash and click the trash icon to confirm (this will count as your turn)."
          );

          $("#tiles").sortable("disable");
          $(".tile").off("click"); //block clicking
          $("#deletectrl").removeClass("hidden");
          $("#delete").off();
          $("#delete").on("click", function () {
            wordblocks_self.discardAndDrawTiles(deletedTiles);
          });
          $("#canceldelete").off();
          $("#canceldelete").on("click", revertToPlay);
        } else {
          //Exit deletemode
          revertToPlay();
        }
      });

      /*
      Default/Original mode
      Allow shuffling of rack and click on board to launch text entry
      */
      if (!interactiveMode) {
        let xpos = 0;
        let ypos = 0;
        $("#helper").remove(); //clean up just in case
        $(".hud-status-update-message").html(wordblocks_self.defaultMsg); //update instructions to player
        //Click on game board to type a word

        $(".slot").on("mousedown", function (e) {
          xpos = e.clientX;
          ypos = e.clientY;
        });
        //Create as menu on the game board to input word from a tile in horizontal or vertical direction
        $(".slot").on("mouseup", function (e) {
          if (Math.abs(xpos - e.clientX) > 4) {
            return;
          }
          if (Math.abs(ypos - e.clientY) > 4) {
            return;
          }
          let divname = $(this).attr("id");
          let html = `
            <div class="tile-placement-controls">
              <div class="action" id="horizontal"><i class="fas fa-arrows-alt-h"></i> horizontally</div>
              <div class="action" id="vertical"><i class="fas fa-arrows-alt-v"></i> vertically</div>
              <div class="action" id="cancel"><i class="far fa-window-close"></i> cancel</div>
            </div>`;
          let tmpx = divname.split("_");
          let y = tmpx[0];
          let x = tmpx[1];
          let word = "";

          let offsetX = wordblocks_self.app.browser.isMobileBrowser(
            navigator.userAgent
          )
            ? 25
            : 55;
          let offsetY = wordblocks_self.app.browser.isMobileBrowser(
            navigator.userAgent
          )
            ? 25
            : 55;

          let greater_offsetX = wordblocks_self.app.browser.isMobileBrowser(
            navigator.userAgent
          )
            ? 135
            : 155;
          let greater_offsetY = wordblocks_self.app.browser.isMobileBrowser(
            navigator.userAgent
          )
            ? 135
            : 155;

          let left = $(this).offset().left + offsetX;
          let top = $(this).offset().top + offsetY;

          if (x > 8) {
            left -= greater_offsetX;
          }
          if (y > 8) {
            top -= greater_offsetY;
          }

          $(".tile-placement-controls").remove(); //Removes previous addition

          if (wordblocks_self.app.browser.isMobileBrowser(navigator.userAgent)) {
            let tile_html = "";
            for (let i = 0; i < wordblocks_self.game.deck[0].hand.length; i++) {
              tile_html += wordblocks_self.returnTileHTML(
                wordblocks_self.game.deck[0].cards[
                  wordblocks_self.game.deck[0].hand[i]
                ].name
              );
            }
            let updated_status = `
            <div class="rack" id="rack">
              <div class="tiles" id="tiles">
                ${tile_html}
              </div>
              <img id="shuffle" class="shuffle" src="/wordblocks/img/reload.png">
            </div>
            ${html}
            `;
            $(".status").html(updated_status); //may be a problem?
            wordblocks_self.enableEvents();
          } else {
            $("body").append(html);
            $(".tile-placement-controls").css({
              top: top,
              left: left,
              bottom: "unset",
              right: "unset",
            });
          }

          //Launch asynch prompt for typed word
          $(".action").off();
          $(".action").on("click", async function () {
            let orientation = $(this).attr("id"); //horizontal, vertical, cancel

            if (orientation == "cancel") {
              $(".action").off();
              $(".tile-placement-controls").remove();
              wordblocks_self.updateStatusWithTiles(wordblocks_self.defaultMsg);
              wordblocks_self.enableEvents();
              return;
            }

            word = await sprompt("Provide your word:");

            //Process Word
            if (word) {
              console.log(`Submitting ${word}, ${orientation} at col ${x}, row ${y}`);
              wordblocks_self.tryPlayingWord(x, y, orientation, word);
            }
          });
        });

        /* 
      Enable shuffling in this mode 
      */
        $("#shuffle").on("click", function () {
          for (var i = $("#tiles").children.length; i >= 0; i--) {
            $("#tiles")[0].appendChild(
              $("#tiles")[0].childNodes[(Math.random() * i) | 0]
            );
          }
        });
      } else {
        //Alternate tile manipulation event model:     interactive placement

        $(".hud-status-update-message").text(
          "Click a tile to select/deselect it, then click the board to place it. Double click to move it back to the rack"
        );
        $(".tile-placement-controls").remove();

        $("#rack .tile").off("dblclick"); //Turn off dbl click to delete

        //Double click to remove from board
        $(".slot").on("dblclick", function () {
          let clkTarget = this.querySelector(".tile");
          if (clkTarget && $(clkTarget).hasClass("tempplacement")) {
            returnToRack(clkTarget/*, $(this).attr("id")*/);
          } else {
            console.log(JSON.parse(JSON.stringify(wordblocks_self.game.board)));
          }
        });
        //Click rack when tile is selected to return it to rack

        //Click slot to move tile on board
        $(".slot").on("click", function (e) {

          //do we have a tile selected

          //Is there a tile to select? 
          if (this.querySelector(".tile")) {
            //Will select tile first
            let conflict = this.querySelector(".tile");
            if (conflict.classList.contains("tempplacement")) {
              if (!tile) {
                //If we don't have a currently selected tile
                console.log(`Select new at (${$(this).attr("id")}):`, tile, conflict);
                selectTile(conflict, e);
              } else if (conflict.classList.contains("highlighttile")) {
                //Toggle selection of tile
                console.log(`Deselect (${$(this).attr("id")}):`, tile, conflict);
                deselectTile();
              } else {
                console.log("Swap selection:", tile, conflict);
                deselectTile();
                selectTile(conflict, e);
              }
            }
          } else {
            //Slot is empty
            if (tile) {
              //Fill in board 
              wordblocks_self.game.board[$(this).attr("id")].letter = tile.textContent;
              //Remove from board (if necessary)
              let parentSlot = $(".slot .highlighttile").parent().attr("id");
              if (parentSlot) {
                wordblocks_self.game.board[parentSlot].letter = "_";
              }

              //Move tile if we have one selected
              //Hide bonus information if covered
              if (this.querySelector(".bonus")) {
                this.querySelector(".bonus").style.display = "none";
              } //Show bonus information if uncovered
              if (tile.parentElement.querySelector(".bonus")) {
                tile.parentElement.querySelector(".bonus").style.display = "flex";
              }
              //Move tile to board
              this.append(tile);
              $(tile).addClass("tempplacement");
              $(tile).off();
              deselectTile();
            }
          }
          checkBoard();
        });

        checkBoard();
      }

      //Discard Tiles -- Old Method
      //Must be added here because maybe refreshing the hud-status-message
      $(".tosstiles").off();
      $(".tosstiles").on("click", async function () {
        tiles = await sprompt("Which tiles do you want to discard?");
        if (tiles) {
          wordblocks_self.discardAndDrawTiles(tiles);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  /*
  Move all temporary tiles from board back to rack
*/
  clearBoard() {
    let playedTiles = document.querySelectorAll(".slot .tempplacement");
    for (let t of playedTiles) {
      this.game.board[t.parentElement.id].letter = "_";
      if (t.parentElement.querySelector(".bonus")) {
        t.parentElement.querySelector(".bonus").style.display = "flex";
      }
      $("#tiles").append(t);
    }
  }

  /*
  Scan for the board to find a consecutive arrangement of temporary tiles
  Returns: Word, orientation, x, y (of starting square)
*/
  readWordFromBoard() {
    let playedTiles = document.querySelectorAll(".slot .tempplacement");
    let minx = 16,
      miny = 16,
      maxx = 0,
      maxy = 0;
    let word = "";
    let orientation = "";
    let fail = false;

    if (playedTiles.length === 1) {
      let [r, c] = playedTiles[0].parentElement.id.split("_");
      minx = parseInt(r);
      miny = parseInt(c);
      console.log(`1 tile at ${r}_${c}`);
      ({ word, miny, minx } = this.expandWord(r, c, "horizontal"));
      if (word.length > 1) {
        orientation = "horizontal";
        return [word, orientation, miny, minx];
      }
      ({ word, miny, minx } = this.expandWord(r, c, "vertical"));
      if (word.length > 1) {
        orientation = "vertical";
        return [word, orientation, miny, minx];
      }
      return ["", "invalid", miny, minx];
    } else { //Have guaranteed orientation for main axis
      for (let t of playedTiles) {
        let [x, y] = t.parentElement.id.split("_");
        x = parseInt(x);
        y = parseInt(y);
        if (x > maxx) maxx = x;
        if (x < minx) minx = x;
        if (y > maxy) maxy = y;
        if (y < miny) miny = y;
      }
      //console.log(minx,miny,"---",maxx,maxy);
      if (maxx == minx) {
        orientation = "horizontal";
        for (let i = miny; i <= maxy; i++) {
          let slot = maxx + "_" + i;
          let div = document.getElementById(slot);
          if (div) {
            if (div.querySelector(".tile")) {
              word += div.querySelector(".tile").textContent;
            } else fail = true;
          } else fail = true;
        }
      } else if (maxy == miny) {
        orientation = "vertical";
        for (let i = minx; i <= maxx; i++) {
          let slot = i + "_" + maxy;
          let div = document.getElementById(slot);
          if (div) {
            if (div.querySelector(".tile")) {
              word += div.querySelector(".tile").textContent;
            } else fail = true;
          } else fail = true;
        }
      } else {
        //orientation  "invalid";
        fail = true;
      }
      if (fail) return ["", "invalid", miny, minx];
      console.log(`Expanding from temporary tiles (${orientation})`);
      ({ word, miny, minx } = this.expandWord(minx, miny, orientation));
      return [word, orientation, miny, minx];
    }

  }

  /*
  See if a word fits in the spot and score it if so...
*/
  tryPlayingWord(x, y, orientation, word) {
    word = word.toUpperCase();
    console.log(`Y:${y}_X:${x},  ${orientation}, ${word}`);
    // reset board
    $(".tile-placement-controls").html("");
    //$(".status").html("Processing your turn.");

    // if entry is valid (position and letters available)
    if (this.isEntryValid(word, orientation, x, y)) {
      let myscore = 0;
      this.addWordToBoard(word, orientation, x, y);

      //Orientation check for single tile plays...
      let fullword = this.expandWord(y, x, orientation).word;
      //console.log("Expanded word:",fullword);
      if (fullword.length == 1) {
        let newOrientation =
          orientation == "vertical" ? "horizontal" : "vertical";
        if (this.expandWord(y, x, newOrientation).word.length > 1) {
          this.removeWordFromBoard(word, orientation, x, y);
          this.tryPlayingWord(x, y, newOrientation, word);
          return;
        } //Otherwise just let it fail with normal logic
      }

      myscore = this.scorePlay(word, this.game.player, orientation, x, y);
      if (myscore <= 1) {
        //If not found in dictionary
        this.removeWordFromBoard(word, orientation, x, y);
        this.updateStatusWithTiles(
          `Not a valid word, try again! ${this.defaultMsg}`
        );
        this.enableEvents();
      } else {
        this.game.words_played[parseInt(this.game.player) - 1].push({
          word: fullword,
          score: myscore,
        });
        this.updateLog(`You played ${fullword} for ${myscore} points.`);
        this.addMove(
          `place\t${word}\t${this.game.player}\t${x}\t${y}\t${orientation}\t${fullword}`);
        //
        // discard tiles
        // (not really a discard, just changing flags on the board spaces to enable scoring??)
        //this.discardTiles(word, orientation, x, y);
        //Lock in Move in the DOM
        //this.setBoard(word, orientation, x, y);
        this.discardTiles(word, orientation, x, y); //remove Played tiles from Hand
        this.finalizeWord(word, orientation, x, y); //update board
        this.addScoreToPlayer(this.game.player, myscore);
        this.drawTiles();

        if (this.checkForEndGame() == 1) {
          return;
        }

        this.endTurn();
      }
    } else {
      //!isEntryValid
      this.updateStatusWithTiles(`Not a valid word, try again! ${this.defaultMsg}`);
      this.enableEvents();
    }
  }

  drawTiles() {
    let cards_needed = 7;
    cards_needed = cards_needed - this.game.deck[0].hand.length;

    if (cards_needed > this.game.deck[0].crypt.length) {
      cards_needed = this.game.deck[0].crypt.length;
    }

    if (cards_needed > 0) {
      this.addMove("DEAL\t1\t" + this.game.player + "\t" + cards_needed);
    }
  }

  /*
  Main call for deleting some tiles from the players rack, having them draw new tiles, and ending their turn
*/
  discardAndDrawTiles(tiles) {
    salert("Tossed: " + tiles);
    this.removeTilesFromHand(tiles);
    this.addMove("turn\t" + this.game.player + "\t" + tiles);
    this.drawTiles();
    this.endTurn();
  }

  removeTilesFromHand(word) {
    while (word.length > 0) {
      let tmpx = word[0];
      tmpx = tmpx.toUpperCase();

      for (let i = 0; i < this.game.deck[0].hand.length; i++) {
        if (this.game.deck[0].cards[this.game.deck[0].hand[i]].name == tmpx) {
          this.game.deck[0].hand.splice(i, 1);
          i = this.game.deck[0].hand.length;
        }
      }

      if (word.length > 1) {
        word = word.substring(1);
      } else {
        word = "";
      }
    }
  }

  isEntryValid(word, orientation, x, y) {
    let tmphand = JSON.parse(JSON.stringify(this.game.deck[0].hand));
    x = parseInt(x);
    y = parseInt(y);

    //
    // if this is the first word, it has to cross a critical star
    //
    if (this.firstmove == 1) {
      if (orientation == "vertical") {
        if (x != 6 && x != 10) {
          salert("First Word must be placed to cross a Star");
          return false;
        }

        let starting_point = y;
        let ending_point = y + word.length - 1;

        if (
          (starting_point <= 6 && ending_point >= 6) ||
          (starting_point <= 10 && ending_point >= 6)
        ) {
        } else {
          salert("First Word must be long enough to cross a Star");
          return false;
        }
      }

      if (orientation == "horizontal") {
        if (y != 6 && y != 10) {
          salert("First Word must be placed to cross a Star");
          return false;
        }

        let starting_point = x;
        let ending_point = x + word.length - 1;

        if (
          (starting_point <= 6 && ending_point >= 6) ||
          (starting_point <= 10 && ending_point >= 6)
        ) {
        } else {
          salert("First Word must be long enough to cross a Star");
          return false;
        }
      } //this.firstmove = 0;
    } else {
      //Check to make sure newly played word touches another word
      // let touchesWord = 0;
      let xStart = Math.max(1, x - 1);
      let yStart = Math.max(1, y - 1);
      let xEnd, yEnd;
      if (orientation == "horizontal") {
        xEnd = Math.min(15, x + word.length + 1);
        yEnd = Math.min(15, y + 1);
      } else {
        xEnd = Math.min(15, x + 1);
        yEnd = Math.min(15, y + word.length + 1);
      }
      //// old code
      // for (let i = xStart; i <= xEnd; i++)
      //   for (let j = yStart; j <= yEnd; j++) {
      //     let boardslot = j + "_" + i;
      //     console.log(boardslot)
      //     if (this.game.board[boardslot].fresh == 0) {
      //       touchesWord = 1;
      //       break;
      //     }
      //     console.log(touchesWord)
      //   }

      const touchesWord = []
      if (orientation == "horizontal") {
        yStart = parseInt(yStart) + 1;
        xStart = parseInt(xStart) + 1;
        let allBoardSlots = []
        for (let i = xStart; i < xEnd - 1; i++) {
          let left = `${yStart}_${i - 1}`;
          let top = `${yStart - 1}_${i}`;
          let right = `${yStart}_${i + 1}`;
          let bottom = `${yStart + 1}_${i}`;
          let neighbors = [left, top, right, bottom]
          allBoardSlots.push(neighbors)
        }
        console.log(allBoardSlots)

        allBoardSlots.forEach((neighbor) => {
          neighbor.forEach((slot) => {
            console.log(slot)
            if (this.game.board[slot].fresh == 0) {

              touchesWord.push({ touchesWord: true, slot, letter: this.game.board[slot] })
            }
          })
        })

      }

      if (orientation == "vertical") {
        yStart = parseInt(yStart) + 1;
        xStart = parseInt(xStart) + 1;
        let allBoardSlots = []
        for (let i = yStart; i < yEnd - 1; i++) {
          let left = `${i}_${xStart - 1}`;
          let top = `${i - 1}_${xStart}`;
          let right = `${i}_${xStart + 1}`;
          let bottom = `${i + 1}_${xStart}`;
          let neighbors = [left, top, right, bottom]
          allBoardSlots.push(neighbors)
        }
        console.log(allBoardSlots)

        allBoardSlots.forEach((neighbor) => {
          neighbor.forEach((plane) => {
            console.log(plane)
            if (this.game.board[plane].fresh == 0) {

              touchesWord.push({ touchesWord: true, plane, letter: this.game.board[plane] })
            }
          })
        })
        console.log(touchesWord)
      }

      if (!touchesWord.find(item => item.touchesWord == true)) {
        salert("Word does not cross or touch an existing word.");
        return false;
      }
    }

    //In all cases, must have the letters in hand or on board to spell word
    let letters_used = 0;
    for (let i = 0; i < word.length; i++) {
      let boardslot = "";
      let letter = word[i].toUpperCase();

      if (orientation == "horizontal") {
        boardslot = y + "_" + (x + i);
        if (x + i > 15) {
          salert("Word must fit on board!");
          return false;
        }
      }

      if (orientation == "vertical") {
        boardslot = y + i + "_" + x;
        if (y + i > 15) {
          salert("Word must fit on board!");
          return false;
        }
      }

      if (this.game.board[boardslot].letter != "_") {
        if (this.game.board[boardslot].letter != letter) {
          salert("Cannot overwrite existing words!");
          return false;
        }
      } else {
        let letter_found = 0;
        letters_used++;
        for (let k = 0; k < tmphand.length; k++) {
          if (this.game.deck[0].cards[tmphand[k]].name == letter) {
            tmphand.splice(k, 1);
            letter_found = 1;
            k = tmphand.length + 1;
          }
        }

        if (letter_found == 0) {
          salert("INVALID: letter not in hand: " + letter);
          return false;
        }
      }
    }

    if (!letters_used) {
      salert("Must place at least one new tile on board!");
      return false;
    }


    return true;
  }

  //Mark word as no longer new (.fresh is a flag used in scoring)
  //--AND-- remove newly used tiles from players hand
  //--AND-- update DOM classes
  finalizeWord(word, orientation, x, y) {
    x = parseInt(x);
    y = parseInt(y);

    for (let i = 0; i < word.length; i++) {
      let boardslot = "";
      let divname = "";
      let letter = word[i].toUpperCase();

      if (orientation == "horizontal") {
        boardslot = y + "_" + (x + i);
      }

      if (orientation == "vertical") {
        boardslot = y + i + "_" + x;
      }

      if (this.game.board[boardslot].fresh == 1) {
        this.game.board[boardslot].fresh = 0;
      }
      divname = "#" + boardslot;
      $(divname).addClass("set");
    }
  }

  /*Discard tiles used to create the given word*/
  discardTiles(word, orientation, x, y) {
    x = parseInt(x);
    y = parseInt(y);

    for (let i = 0; i < word.length; i++) {
      let boardslot = "";
      let letter = word[i].toUpperCase();

      if (orientation == "horizontal") {
        boardslot = y + "_" + (x + i);
      }

      if (orientation == "vertical") {
        boardslot = y + i + "_" + x;
      }

      if (this.game.board[boardslot].fresh == 1) {
        this.removeTilesFromHand(word[i]);
      }
    }
  }

  addLetterToBoard(letter, slot) {
    this.game.board[slot].letter = letter.toUpperCase();
  }
  removeLetterFromBoard(slot) {

  }
  /*
  Updates GUI and game.board with newly played word
  */
  addWordToBoard(word, orientation, x, y) {
    x = parseInt(x);
    y = parseInt(y);

    for (let i = 0; i < word.length; i++) {
      let boardslot = "";
      let divname = "";
      let letter = word[i].toUpperCase();

      if (orientation == "horizontal") {
        boardslot = y + "_" + (x + i);
      }

      if (orientation == "vertical") {
        boardslot = y + i + "_" + x;
      }

      divname = "#" + boardslot;

      if (this.game.board[boardslot].letter != "_") {
        if (this.game.board[boardslot].letter != letter) {
          //We can overwrite tiles??
          console.log("UNEXPECTED OUTCOME IN addWordToBoard ******");
          console.log(this.game.board[boardslot].letter, letter); //what is going on here?
          this.game.board[boardslot].letter = letter;
          this.addTile($(divname), letter);
        }
      } else {
        this.game.board[boardslot].letter = letter;
        this.addTile($(divname), letter);
      }
    }
  }

  /*
  Undoes addWordToBoard, updates GUI to remove newly played tiles (as defined by class:set)
  */
  removeWordFromBoard(word, orientation, x, y) {
    x = parseInt(x);
    y = parseInt(y);

    for (let i = 0; i < word.length; i++) {
      let boardslot = "";
      let divname = "";
      let letter = word[i].toUpperCase();

      if (orientation == "horizontal") {
        boardslot = y + "_" + (x + i);
      }

      if (orientation == "vertical") {
        boardslot = y + i + "_" + x;
      }

      divname = "#" + boardslot;

      if ($(divname).hasClass("set") != true) {
        this.game.board[boardslot].letter = "_";
        $(divname).find(".tile").remove();
        $(divname).find(".bonus").css("display", "flex");
      }
    }
  }

  /*
  Board is 1-indexed, 15 Rows and 15 Columns ( y_x)
  */
  returnBoard() {
    var board = {};

    for (let i = 1; i <= 15; i++) {
      for (let j = 1; j <= 15; j++) {
        let divname = i + "_" + j;
        board[divname] = {
          letter: "_",
          fresh: 1,
        };
      }
    }

    return board;
  }

  returnDeck() {
    var dictionary = this.game.options.dictionary;
    if (dictionary === "twl" || dictionary === "sowpods") {
      this.mydeck = {
        1: { name: "A" },
        2: { name: "A" },
        3: { name: "A" },
        4: { name: "A" },
        5: { name: "A" },
        6: { name: "A" },
        7: { name: "A" },
        8: { name: "A" },
        9: { name: "A" },
        10: { name: "B" },
        11: { name: "B" },
        12: { name: "C" },
        13: { name: "C" },
        14: { name: "D" },
        15: { name: "D" },
        16: { name: "D" },
        17: { name: "D" },
        18: { name: "E" },
        19: { name: "E" },
        20: { name: "E" },
        21: { name: "E" },
        22: { name: "E" },
        23: { name: "E" },
        24: { name: "E" },
        25: { name: "E" },
        26: { name: "E" },
        27: { name: "E" },
        28: { name: "E" },
        29: { name: "E" },
        30: { name: "F" },
        41: { name: "F" },
        42: { name: "G" },
        43: { name: "G" },
        44: { name: "G" },
        45: { name: "H" },
        46: { name: "H" },
        47: { name: "I" },
        48: { name: "I" },
        49: { name: "I" },
        50: { name: "I" },
        51: { name: "I" },
        52: { name: "I" },
        53: { name: "I" },
        54: { name: "I" },
        55: { name: "I" },
        56: { name: "J" },
        57: { name: "K" },
        58: { name: "L" },
        59: { name: "L" },
        60: { name: "L" },
        61: { name: "L" },
        62: { name: "M" },
        63: { name: "M" },
        64: { name: "N" },
        65: { name: "N" },
        66: { name: "N" },
        67: { name: "N" },
        68: { name: "N" },
        69: { name: "N" },
        70: { name: "O" },
        71: { name: "O" },
        72: { name: "O" },
        73: { name: "O" },
        74: { name: "O" },
        75: { name: "O" },
        76: { name: "O" },
        77: { name: "O" },
        78: { name: "P" },
        79: { name: "P" },
        80: { name: "Q" },
        81: { name: "R" },
        82: { name: "R" },
        83: { name: "R" },
        84: { name: "R" },
        85: { name: "R" },
        86: { name: "R" },
        87: { name: "S" },
        88: { name: "S" },
        89: { name: "S" },
        90: { name: "S" },
        91: { name: "T" },
        92: { name: "T" },
        93: { name: "T" },
        94: { name: "T" },
        95: { name: "T" },
        96: { name: "T" },
        97: { name: "U" },
        98: { name: "U" },
        99: { name: "U" },
        100: { name: "U" },
        101: { name: "V" },
        102: { name: "V" },
        103: { name: "W" },
        104: { name: "W" },
        105: { name: "X" },
        106: { name: "U" },
        107: { name: "Y" },
        108: { name: "Y" },
        109: { name: "Z" },
      };
    }
    if (dictionary === "fise" || dictionary === "tagalog") {
      this.mydeck = {
        1: { name: "A" },
        2: { name: "A" },
        3: { name: "A" },
        4: { name: "A" },
        5: { name: "A" },
        6: { name: "A" },
        7: { name: "A" },
        8: { name: "A" },
        9: { name: "A" },
        10: { name: "A" },
        11: { name: "A" },
        12: { name: "A" },
        13: { name: "B" },
        14: { name: "B" },
        15: { name: "C" },
        16: { name: "C" },
        17: { name: "C" },
        18: { name: "C" },
        19: { name: "C" },
        20: { name: "D" },
        21: { name: "D" },
        22: { name: "D" },
        23: { name: "D" },
        24: { name: "D" },
        25: { name: "E" },
        26: { name: "E" },
        27: { name: "E" },
        28: { name: "E" },
        29: { name: "E" },
        30: { name: "E" },
        31: { name: "E" },
        32: { name: "E" },
        33: { name: "E" },
        34: { name: "E" },
        35: { name: "E" },
        36: { name: "E" },
        37: { name: "E" },
        38: { name: "F" },
        39: { name: "G" },
        40: { name: "G" },
        41: { name: "H" },
        42: { name: "H" },
        43: { name: "H" },
        44: { name: "I" },
        45: { name: "I" },
        46: { name: "I" },
        47: { name: "I" },
        48: { name: "I" },
        49: { name: "I" },
        50: { name: "J" },
        51: { name: "L" },
        52: { name: "L" },
        53: { name: "L" },
        54: { name: "L" },
        55: { name: "L" },
        56: { name: "L" },
        57: { name: "M" },
        58: { name: "M" },
        59: { name: "N" },
        60: { name: "N" },
        61: { name: "N" },
        62: { name: "N" },
        63: { name: "N" },
        64: { name: "Ñ" },
        65: { name: "Ñ" },
        66: { name: "O" },
        67: { name: "O" },
        68: { name: "O" },
        69: { name: "O" },
        70: { name: "O" },
        71: { name: "O" },
        72: { name: "O" },
        73: { name: "O" },
        74: { name: "O" },
        75: { name: "O" },
        76: { name: "P" },
        77: { name: "P" },
        78: { name: "Q" },
        79: { name: "R" },
        80: { name: "R" },
        81: { name: "R" },
        82: { name: "R" },
        83: { name: "R" },
        84: { name: "R" },
        85: { name: "R" },
        86: { name: "S" },
        87: { name: "S" },
        88: { name: "S" },
        89: { name: "S" },
        90: { name: "S" },
        91: { name: "S" },
        92: { name: "S" },
        93: { name: "T" },
        94: { name: "T" },
        95: { name: "T" },
        96: { name: "T" },
        97: { name: "U" },
        98: { name: "U" },
        99: { name: "U" },
        100: { name: "U" },
        101: { name: "U" },
        102: { name: "V" },
        103: { name: "X" },
        104: { name: "Y" },
        105: { name: "Z" },
      };
    }
    /*if (dictionary === "sowpods") {
      this.mydeck = {"1":{"name":"A"},"2":{"name":"A"},"3":{"name":"A"},"4":{"name":"A"},"5":{"name":"A"},"6":{"name":"A"},"7":{"name":"A"},"8":{"name":"A"},"9":{"name":"A"},"10":{"name":"B"},"11":{"name":"B"},"12":{"name":"C"},"13":{"name":"C"},"14":{"name":"D"},"15":{"name":"D"},"16":{"name":"D"},"17":{"name":"D"},"18":{"name":"E"},"19":{"name":"E"},"20":{"name":"E"},"21":{"name":"E"},"22":{"name":"E"},"23":{"name":"E"},"24":{"name":"E"},"25":{"name":"E"},"26":{"name":"E"},"27":{"name":"E"},"28":{"name":"E"},"29":{"name":"E"},"30":{"name":"F"},"41":{"name":"F"},"42":{"name":"G"},"43":{"name":"G"},"44":{"name":"G"},"45":{"name":"H"},"46":{"name":"H"},"47":{"name":"I"},"48":{"name":"I"},"49":{"name":"I"},"50":{"name":"I"},"51":{"name":"I"},"52":{"name":"I"},"53":{"name":"I"},"54":{"name":"I"},"55":{"name":"I"},"56":{"name":"J"},"57":{"name":"K"},"58":{"name":"L"},"59":{"name":"L"},"60":{"name":"L"},"61":{"name":"L"},"62":{"name":"M"},"63":{"name":"M"},"64":{"name":"N"},"65":{"name":"N"},"66":{"name":"N"},"67":{"name":"N"},"68":{"name":"N"},"69":{"name":"N"},"70":{"name":"O"},"71":{"name":"O"},"72":{"name":"O"},"73":{"name":"O"},"74":{"name":"O"},"75":{"name":"O"},"76":{"name":"O"},"77":{"name":"O"},"78":{"name":"P"},"79":{"name":"P"},"80":{"name":"Q"},"81":{"name":"R"},"82":{"name":"R"},"83":{"name":"R"},"84":{"name":"R"},"85":{"name":"R"},"86":{"name":"R"},"87":{"name":"S"},"88":{"name":"S"},"89":{"name":"S"},"90":{"name":"S"},"91":{"name":"T"},"92":{"name":"T"},"93":{"name":"T"},"94":{"name":"T"},"95":{"name":"T"},"96":{"name":"T"},"97":{"name":"U"},"98":{"name":"U"},"99":{"name":"U"},"100":{"name":"U"},"101":{"name":"V"},"102":{"name":"V"},"103":{"name":"W"},"104":{"name":"W"},"105":{"name":"X"},"106":{"name":"U"},"107":{"name":"Y"},"108":{"name":"Y"},"109":{"name":"Z"}};
    }*/
    if (dictionary === "test") {
      let mydeck = {
        1: { name: "A" },
        2: { name: "A" },
        3: { name: "A" },
        4: { name: "A" },
        5: { name: "A" },
        6: { name: "A" },
        7: { name: "A" },
        8: { name: "A" },
        9: { name: "A" },
        10: { name: "C" },
        11: { name: "C" },
        12: { name: "C" },
        13: { name: "C" },
        14: { name: "T" },
        15: { name: "T" },
        16: { name: "T" },
        17: { name: "T" },
        18: { name: "T" },
        19: { name: "T" },
        20: { name: "T" },
      };
    }
    return this.mydeck;
  }

  returnLetters() {
    var dictionary = this.game.options.dictionary;
    if (dictionary === "twl" || dictionary === "sowpods") {
      this.letterset = {
        A: { score: 1 },
        B: { score: 3 },
        C: { score: 2 },
        D: { score: 2 },
        E: { score: 1 },
        F: { score: 2 },
        G: { score: 2 },
        H: { score: 1 },
        I: { score: 1 },
        J: { score: 8 },
        K: { score: 4 },
        L: { score: 2 },
        M: { score: 2 },
        N: { score: 1 },
        O: { score: 1 },
        P: { score: 2 },
        Q: { score: 10 },
        R: { score: 1 },
        S: { score: 1 },
        T: { score: 1 },
        U: { score: 2 },
        V: { score: 3 },
        W: { score: 2 },
        X: { score: 8 },
        Y: { score: 2 },
        Z: { score: 10 },
      };
    }
    if (dictionary === "fise" || dictionary === "tagalog") {
      this.letterset = {
        A: { score: 1 },
        B: { score: 2 },
        C: { score: 3 },
        D: { score: 2 },
        E: { score: 1 },
        F: { score: 4 },
        G: { score: 2 },
        H: { score: 4 },
        I: { score: 1 },
        J: { score: 8 },
        L: { score: 1 },
        M: { score: 3 },
        N: { score: 1 },
        Ñ: { score: 8 },
        O: { score: 1 },
        P: { score: 3 },
        Q: { score: 6 },
        R: { score: 2 },
        S: { score: 1 },
        T: { score: 1 },
        U: { score: 1 },
        V: { score: 4 },
        X: { score: 8 },
        Y: { score: 4 },
        Z: { score: 10 },
      };
    }
    /*if (dictionary === "sowpods") {
      this.letterset = {"A":{"score":1},"B":{"score":3},"C":{"score":2},"D":{"score":2},"E":{"score":1},"F":{"score":2},"G":{"score":2},"H":{"score":1},"I":{"score":1},"J":{"score":8},"K":{"score":4},"L":{"score":2},"M":{"score":2},"N":{"score":1},"O":{"score":1},"P":{"score":2},"Q":{"score":10},"R":{"score":1},"S":{"score":1},"T":{"score":1},"U":{"score":2},"V":{"score":3},"W":{"score":2},"X":{"score":8},"Y":{"score":2},"Z":{"score":10}};
    }*/
    if (dictionary === "test") {
      let letterset = { A: { score: 1 }, C: { score: 3 }, T: { score: 2 } };
    }
    return this.letterset;
  }

  checkWord(word) {
    if (word.length >= 1 && typeof this.wordlist != "undefined") {
      if (this.wordlist.indexOf(word.toLowerCase()) <= 0) {
        return false;
      } else {
        return true;
      }
    }
    console.error("Word length or dictionary issue -- " + word);
    return false;
  }

  returnBonus(pos) {
    let bonus = "";

    if (pos == "1_1") {
      return "3L";
    }
    if (pos == "1_15") {
      return "3L";
    }
    if (pos == "3_8") {
      return "3L";
    }
    if (pos == "8_3") {
      return "3L";
    }
    if (pos == "8_13") {
      return "3L";
    }
    if (pos == "13_8") {
      return "3L";
    }
    if (pos == "15_1") {
      return "3L";
    }
    if (pos == "15_15") {
      return "3L";
    }
    if (pos == "2_2") {
      return "3W";
    }
    if (pos == "2_14") {
      return "3W";
    }
    if (pos == "8_8") {
      return "3W";
    }
    if (pos == "14_2") {
      return "3W";
    }
    if (pos == "14_14") {
      return "3W";
    }
    if (pos == "1_5") {
      return "2L";
    }
    if (pos == "1_11") {
      return "2L";
    }
    if (pos == "3_4") {
      return "2L";
    }
    if (pos == "3_12") {
      return "2L";
    }
    if (pos == "4_3") {
      return "2L";
    }
    if (pos == "4_13") {
      return "2L";
    }
    if (pos == "5_8") {
      return "2L";
    }
    if (pos == "5_1") {
      return "2L";
    }
    if (pos == "5_15") {
      return "2L";
    }
    if (pos == "8_5") {
      return "2L";
    }
    if (pos == "8_11") {
      return "2L";
    }
    if (pos == "11_1") {
      return "2L";
    }
    if (pos == "11_8") {
      return "2L";
    }
    if (pos == "11_15") {
      return "2L";
    }
    if (pos == "12_3") {
      return "2L";
    }
    if (pos == "12_13") {
      return "2L";
    }
    if (pos === "13_4") {
      return "2L";
    }
    if (pos === "13_12") {
      return "2L";
    }
    if (pos == "15_5") {
      return "2L";
    }
    if (pos == "15_11") {
      return "2L";
    }
    if (pos == "1_8") {
      return "2W";
    }
    if (pos == "4_6") {
      return "2W";
    }
    if (pos == "4_10") {
      return "2W";
    }
    if (pos == "6_4") {
      return "2W";
    }
    if (pos == "6_12") {
      return "2W";
    }
    if (pos == "8_1") {
      return "2W";
    }
    if (pos == "8_15") {
      return "2W";
    }
    if (pos == "10_4") {
      return "2W";
    }
    if (pos == "10_12") {
      return "2W";
    }
    if (pos == "12_6") {
      return "2W";
    }
    if (pos == "12_10") {
      return "2W";
    }
    if (pos == "15_8") {
      return "2W";
    }
    return bonus;
  }

  /*
  For scoring words, I use cartesian coordinate templating to make the coding easier
  (x,y) is represented as "y_x". A slot template fixes one of the dimensions with a constant
  to traverse the (main) axis of the word, or, alternately examine the cross axis of an 
  intersecting word.  "#" is used as a variable, to be replaced by "i" in the for loops.  
  */

  getWordScope(head, slotPattern) {
    let boardslot;
    let wordStart = head;
    let wordEnd = head;
    for (let i = parseInt(head); i >= 1; i--) {
      boardslot = slotPattern.replace("#", i);
      if (this.game.board[boardslot].letter == "_") break;
      wordStart = i;
    }
    for (let i = parseInt(head); i <= 15; i++) {
      boardslot = slotPattern.replace("#", i);
      if (this.game.board[boardslot].letter == "_") break;
      wordEnd = i;
    }

    return { start: wordStart, end: wordEnd };
  }

  scoreWord(wordStart, wordEnd, boardSlotTemplate) {
    let tilesUsed = 0;
    let word_bonus = 1;
    let thisword = "";
    let score = 0;
    let html = "";
    for (let i = wordStart; i <= wordEnd; i++) {
      boardslot = boardSlotTemplate.replace("#", i);
      let letter_bonus = 1;

      if (this.game.board[boardslot].fresh == 1) {
        let tmpb = this.returnBonus(boardslot);
        switch (
        tmpb //Word_bonuses can be combined...maybe
        ) {
          case "3W":
            word_bonus = word_bonus * 3;
            break;
          case "2W":
            word_bonus = word_bonus * 2;
            break;
          case "3L":
            letter_bonus = 3;
            break;
          case "2L":
            letter_bonus = 2;
            break;
        }
        tilesUsed += 1;
      } else {
        touchesWord = 1;
      }

      let thisletter = this.game.board[boardslot].letter;
      //console.log(boardslot,thisletter);
      thisword += thisletter;
      score += this.letters[thisletter].score * letter_bonus;
      if (letter_bonus > 1) {
        html += ` + ${this.letters[thisletter].score} x ${letter_bonus}`;
      } else {
        html += " + " + this.letters[thisletter].score;
      }
    }

    if (!this.checkWord(thisword)) {
      salert(thisword + " is not in the dictionary.");
      return -1;
    }

    /*Technically only care for the main word, but not worth adding code to avoid 
      doing a couple extra additions and a comparison
    */
    if (tilesUsed == 7) {
      score += 10;
      word_bonus += 1;
      html += " +10(!)";
    }

    score *= word_bonus;
    html = html.substring(3);
    if (word_bonus > 1) {
      html = "(" + html + ") x " + word_bonus;
    }
    console.log("word:", thisword, "score:", score);
    return { word: thisword, score: score, math: html };
  }

  ////////////////
  // Score Word //
  // Returns -1 if not found in dictionary //
  ////////////////
  scorePlay(word, player, orientation, x, y) {
    let boardslot;
    //Orientation-dependent metadata/variables
    const mainAxis = orientation == "horizontal" ? x : y;
    const crossAxis = orientation == "horizontal" ? y : x;
    const boardSlotTemplate =
      orientation == "horizontal" ? crossAxis + "_#" : "#_" + crossAxis;

    console.log(mainAxis, crossAxis, boardSlotTemplate);
    //
    // find the start and end of the word
    //
    let wordBoundaries = this.getWordScope(mainAxis, boardSlotTemplate);

    //Score main-axis word
    let results = this.scoreWord(
      wordBoundaries.start,
      wordBoundaries.end,
      boardSlotTemplate
    );
    if (results == -1) return -1;
    console.log(orientation, wordBoundaries, results);
    let play = new Array(results);
    let totalscore = results.score;

    //For each letter in the main-axis word...

    for (let i = wordBoundaries.start; i <= wordBoundaries.end; i++) {
      boardslot = boardSlotTemplate.replace("#", i);

      //console.log(boardslot);
      if (this.game.board[boardslot].fresh == 1) {
        //...Is it newly placed...?
        let altTemplate = boardSlotTemplate
          .replace(crossAxis, "@")
          .replace("#", i)
          .replace("@", "#");
        //..and does it have a word along the cross axis
        let crossWord = this.getWordScope(crossAxis, altTemplate);
        if (crossWord.start != crossWord.end) {
          //Only score word if more than 1 letter
          //Make cross-axis variable
          console.log(crossAxis, altTemplate, crossWord);
          results = this.scoreWord(crossWord.start, crossWord.end, altTemplate);
          if (results == -1) return -1;

          play.push(results);
          totalscore += results.score;
        }
      }
    }

    this.firstmove = 0; //We have an acceptable move, so game has commenced. Repeat assignment simpler than adding conditional
    console.log(play);

    this.last_played_word[player - 1] = {
      word: play[0].word,
      totalscore,
      play,
    };
    //console.log(this.last_played_word);
    return totalscore;
  }

  expandWord(row, col, orientation) {
    const mainAxis = orientation == "horizontal" ? col : row;
    const crossAxis = orientation == "horizontal" ? row : col;
    const boardSlotTemplate =
      orientation == "horizontal" ? crossAxis + "_#" : "#_" + crossAxis;
    let wordBoundaries = this.getWordScope(mainAxis, boardSlotTemplate);

    let fullword = "";

    for (let i = wordBoundaries.start; i <= wordBoundaries.end; i++) {
      boardslot = boardSlotTemplate.replace("#", i);
      fullword += this.game.board[boardslot].letter; //Reading letter
    }
    console.log(`Found ${fullword} at row ${row}, col ${col} (${orientation})`, wordBoundaries);
    let newx, newy;
    if (orientation == "horizontal") {
      newy = row;
      newx = wordBoundaries.start;
    } else {
      newy = wordBoundaries.start;
      newx = col;
    }
    console.log(`${orientation}, new row: ${newy}, new col: ${newx}`);
    return {
      word: fullword,
      minx: newx,
      miny: newy
    };
  }

  //
  // Core Game Logic
  //
  handleGameLoop(msg = null) {
    let wordblocks_self = this;

    ///////////
    // QUEUE // Possibilities: gameover, endgame, place, turn
    ///////////

    if (this.game.queue.length > 0) {
      //
      // save before we start executing the game queue
      //
      wordblocks_self.saveGame(wordblocks_self.game.id);
      let qe = this.game.queue.length - 1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      //
      // game over conditions
      //

      if (mv[0] === "gameover") {
        //
        // pick the winner
        //
        let x = 0;
        let idx = 0;

        for (let i = 0; i < wordblocks_self.game.score.length; i++) {
          if (wordblocks_self.game.score[i] > x) {
            x = wordblocks_self.game.score[i];
            idx = i;
          }
        }

        for (let i = 0; i < wordblocks_self.game.score.length; i++) {
          if (
            i != idx &&
            wordblocks_self.game.score[i] == wordblocks_self.game.score[idx]
          ) {
            idx = -1;
          }
        }

        wordblocks_self.game.winner = idx + 1;
        //wordblocks_self.game.over = 1;
        wordblocks_self.saveGame(wordblocks_self.game.id);

        if (wordblocks_self.browser_active == 1) {
          var result = `Game Over -- Player ${wordblocks_self.game.winner} Wins!`;

          if (idx < 0) {
            result = "It's a tie! Well done everyone!";
          }

          wordblocks_self.updateStatusWithTiles(result);
          wordblocks_self.updateLog(result);

          if (this.game.winner == this.game.player) {
            //not resigning as game.winner is set.
            this.resignGame();
          }
        }

        this.game.queue.splice(this.game.queue.length - 1, 1);
        return 0;
      }

      if (mv[0] === "endgame") {
        this.game.queue.splice(this.game.queue.length - 1, 1);
        this.addMove("gameover");
        return 1;
      }

      //
      // place word player x y [horizontal/vertical]
      //
      if (mv[0] === "place") {
        let word = mv[1];
        let player = mv[2];
        let x = mv[3];
        let y = mv[4];
        let orient = mv[5];
        let expanded = mv[6];
        let score = 0;

        if (player != wordblocks_self.game.player) {
          this.addWordToBoard(word, orient, x, y);
          //this.setBoard(word, orient, x, y);
          score = this.scorePlay(word, player, orient, x, y);
          this.finalizeWord(word, orient, x, y);
          this.addScoreToPlayer(player, score);

          this.game.words_played[parseInt(player) - 1].push({
            word: expanded,
            score: score,
          });
          this.updateLog(`Player ${player} played ${expanded} for ${score} points`);
        } else {
          score = this.getLastMove(player).score;
        }

        //Update Specific Playerbox
        let html = `<div class="lastmove" id="lastmove_${player}"><span>Last:</span><span class="playedword">${expanded}</span> <span class="wordscore">${score}</span></div>`;
        this.playerbox.refreshLog(html, player);

        if (wordblocks_self.game.over == 1) {
          return;
        }

        if (
          wordblocks_self.game.player ==
          wordblocks_self.returnNextPlayer(player)
        ) {
          if (wordblocks_self.checkForEndGame() == 1) {
            return;
          }

          wordblocks_self.updateStatusWithTiles(
            "YOUR GO: " + wordblocks_self.defaultMsg
          );
          wordblocks_self.enableEvents();
        } else {
          wordblocks_self.updateStatusWithTiles(
            "Player " + wordblocks_self.returnNextPlayer(player) + "'s turn"
          );
        }
        $(".player-box").removeClass("active");
        this.playerbox.addClass(
          "active",
          wordblocks_self.returnNextPlayer(player)
        );
        this.playerbox.alertNextPlayer(wordblocks_self.returnNextPlayer(player), 'flash');
        this.game.queue.splice(this.game.queue.length - 1, 1);
        return 1; // remove word and wait for next
      }

      //Actually tile discarding action
      if (mv[0] === "turn") {
        //
        // observer mode
        //
        if (this.game.player == 0) {
          this.game.queue.push("OBSERVER_CHECKPOINT");
          this.game.queue.splice(this.game.queue.length - 1, 1);
          return 1;
        }

        if (wordblocks_self.checkForEndGame() == 1) {
          return;
        }

        let player = mv[1];
        let discardedTiles = mv[2];

        if (player != this.game.player) {
          //string - int comparison
          this.updateLog(`Player ${player} discarded some tiles.`);
        } else {
          this.updateLog(`You discarded some tiles.`);
        }

        //Update Specific Playerbox
        let html = `<div class="lastmove" id="lastmove_${player}"><span>Discarded:</span><span class="discardedtiles">[${discardedTiles
          .split("")
          .join()}]</span><span class="wordscore">0</span></div>`;
        this.playerbox.refreshLog(html, player);

        //Code to keep the discard and redraws in the game log history
        wordblocks_self.last_played_word[player - 1] = {
          word: discardedTiles,
          totalscore: 0,
        };
        wordblocks_self.game.words_played[parseInt(player) - 1].push({
          word: "---",
          score: 0,
        });

        if (wordblocks_self.game.player == wordblocks_self.returnNextPlayer(player)) {
          wordblocks_self.updateStatusWithTiles(
            "YOUR GO: " + wordblocks_self.defaultMsg
          );
          wordblocks_self.enableEvents();
        } else {
          wordblocks_self.updateStatusWithTiles(
            "Player " + wordblocks_self.returnNextPlayer(player) + "'s turn"
          );
        }
        $("player-box").removeClass("active");
        this.playerbox.addClass(
          "active",
          wordblocks_self.returnNextPlayer(player)
        );
        this.playerbox.alertNextPlayer(wordblocks_self.returnNextPlayer(player), 'flash');
        this.game.queue.splice(this.game.queue.length - 1, 1);
        return 1;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) {
        return 0;
      }
    }

    return 1;
  }

  checkForEndGame() {
    //
    // the game ends when one player has no cards left
    //
    if (
      this.game.deck[0].hand.length == 0 &&
      this.game.deck[0].crypt.length == 0
    ) {
      this.addMove("endgame");
      this.endTurn();
      return 1;
    }

    return 0;
  }

  addScoreToPlayer(player, score) {
    if (this.browser_active == 0) {
      return;
    }

    this.game.score[player - 1] = this.game.score[player - 1] + score;
    this.playerbox.refreshInfo(
      `<span>Player ${player}:</span> <span class="playerscore" id="score_${player}">${this.game.score[player - 1]
      }</span>`,
      player
    );
  }

  endTurn() {
    this.updateStatusWithTiles("Waiting for information from peers....");
    let extra = {};
    extra.target = this.returnNextPlayer(this.game.player);
    this.game.turn = this.moves;
    this.moves = [];
    this.sendMessage("game", extra);
  }

  returnGameOptionsHTML() {
    let testHtml = "";
    if (this.app.config && this.app.config.currentEnv == "DEV") {
      testHtml = `<option value="test">Test Dictionary</option>`;
    }
    return `
          <h1 class="overlay-title">Wordblocks Options</h1>
          <div class="overlay-input">
          <label for="dictionary">Dictionary:</label>
          <select name="dictionary">
            <option value="sowpods" title="A combination of the Official Scrabble Player Dictionary and Official Scrabble Words" selected>English: SOWPODS</option>
            <option value="twl" title="Scrabble Tournament Word List">English: TWL06</option>
            <option value="fise">Spanish: FISE</option>
            <option value="tagalog">Tagalog</option>
            ${testHtml}
          </select>
          </div>

          <div class="overlay-input">
          <label for="observer_mode">Observer Mode:</label>
          <select name="observer">
            <option value="enable" selected>enable</option>
            <option value="disable">disable</option>
          </select>
          </div>
          <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>

          `;
  }
}

module.exports = Wordblocks;

