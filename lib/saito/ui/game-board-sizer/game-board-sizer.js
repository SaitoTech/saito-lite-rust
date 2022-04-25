const GameBoardSizerTemplate = require("./game-board-sizer.template");

/**
 * TODO - remove JQUERY
 * Adds a slider to screen to allow players to magnify or shrink the game board
 * Included by default in gameTemplate as "sizer", must call render/attachEvents in individual game module to display and use it (preferably in initializeHTML function) 
 */
class GameBoardSizer {
  /**
   * @constructor
   * @param app - the Saito application
   */
  constructor(app) {
    this.app = app;
    this.maxZoom = 200;
  }

  /**
   * Creates the gameBoardSizer if it does not already exist
   * @param app - the Saito app
   * @param game_mod - game module
   * @param attachTo - DOM reference for where to attach the gameBoardSizer, default = body
   */
  render(app, game_mod, attachTo = "body") {
    try{
      if (!document.getElementById("game_board_sizer")) {
        const object = document.querySelector(attachTo);
        object.append(app.browser.htmlToElement(GameBoardSizerTemplate(this.maxZoom)));
      }  
    }catch(err){console.error(err);}
  }

  /**
   * Adds event listener to slider and makes target draggable (via JQuery). Changes to the board size and position are saved for subsequent game loads
   * @param app - the Saito app
   * @param game_mod - game module
   * @param target - DOM reference to object to be scaled in size
   *
   */
  attachEvents(app, game_mod, target = ".gameboard") {
    const sizer_self = this;
    const targetObject = document.querySelector(target);

    if (!targetObject) {
      console.error(target + " not found");
      return;
    }

    let centerBoard = function(input){
      //Requery screen size
        let boardWidth = parseInt(window.getComputedStyle(targetObject).width);
        let boardHeight = parseInt(window.getComputedStyle(targetObject).height);
        if (window.getComputedStyle(targetObject).boxSizing == "content-box"){
          boardWidth += parseInt(window.getComputedStyle(targetObject).paddingLeft) + parseInt(window.getComputedStyle(targetObject).paddingRight);
          boardHeight += parseInt(window.getComputedStyle(targetObject).paddingTop) + parseInt(window.getComputedStyle(targetObject).paddingBottom);
        }
        let screenRatio = Math.min(window.innerWidth / boardWidth, window.innerHeight / boardHeight);

        console.log("***INIT BOARD SIZING***","board width:"+boardWidth,"board height: "+boardHeight, screenRatio);
        input.value = Math.floor(100*screenRatio);
        targetObject.style.transformOrigin = "top left";
        targetObject.style.transform = `scale(${input.value / 100})`;
        targetObject.style.left = "";
        targetObject.style.top = "";            
        
        //I want to somewhat center the board, at least add space for menu (if possible) and center left-right (if necessary)
        if (targetObject.getBoundingClientRect().width < window.innerWidth){
          console.log(`Window width: ${window.innerWidth}, board width: ${targetObject.getBoundingClientRect().width}`);
          let offset = Math.round((window.innerWidth - targetObject.getBoundingClientRect().width)/2) - 5;
          targetObject.style.left = offset+"px";
        }
        
        if (targetObject.getBoundingClientRect().height < window.innerHeight){
          let offset = 0;
          if (window.innerHeight-targetObject.getBoundingClientRect().height >= 40){
            offset = Math.min(50, window.innerHeight-targetObject.getBoundingClientRect().height);
          }else{
            offset = Math.round((window.innerHeight - targetObject.getBoundingClientRect().height)/2) + 5;
          }
          offset = Math.max(0, offset-parseInt(window.getComputedStyle(targetObject).paddingTop));
          targetObject.style.top = offset+"px";    
        }
    }
   
    // adjust scale
    let boardScaler = document.querySelector("#game_board_sizer input"); 
    if (boardScaler){
      try {
      if (game_mod.loadGamePreference(game_mod.returnSlug() + "-board-scale")){
          //console.log("BOARD PREFERENCE:",game_mod.loadGamePreference(game_mod.returnSlug() + "-board-scale"));
          boardScaler.value =
            game_mod.loadGamePreference(game_mod.returnSlug() + "-board-scale");
          this.scaleBoard(game_mod, targetObject);
      }else{
        centerBoard(boardScaler);
      }
      } catch (err) {
          console.error(err);
      }
    
       boardScaler.addEventListener("change", () => {
        sizer_self.scaleBoard(game_mod, targetObject);
      });

    }

    $("#game_board_sizer i").off();
    $("#game_board_sizer i").on("click",function(){
      centerBoard(document.querySelector("#game_board_sizer input"));
      game_mod.saveGamePreference(game_mod.returnSlug() + "-board-scale",
               document.querySelector("#game_board_sizer input").value);  
    });
    
    // and adjust positioning
    let boardoffset = game_mod.loadGamePreference(game_mod.returnSlug() + "-board-offset");
    if (boardoffset) {
      $(target).offset(boardoffset);
    }

    // and make draggable
    $(target).draggable({
      stop: function (event, ui) {
        game_mod.saveGamePreference(
          game_mod.returnSlug() + "-board-offset",
          ui.offset
        );
      },
    });
  }

  /**
   * Internal function to scale targetObject based on slider
   * @param game_mod - the game module
   * @param targetObject - by default, the ".gameboard" DOM object
   *
   */
  scaleBoard(game_mod, targetObject) {
    targetObject.style.transform = `scale(${
      document.querySelector("#game_board_sizer input").value / 100
    })`;
    game_mod.saveGamePreference(
      game_mod.returnSlug() + "-board-scale",
      document.querySelector("#game_board_sizer input").value
    );
  }
}

module.exports = GameBoardSizer;