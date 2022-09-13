
module.exports = ObserverLoader = {
  render(app, mod, slug = "", game_status = false) {

    let arcade = app.modules.returnModule("Arcade");
    if (!arcade.browser_active){ return;}
    
    if (!slug){
      document.getElementById("arcade-main").innerHTML = `  
      <div id="arcade-initialize-game-container" class="arcade-initialize-game-container">
        <center><div id="game-loader-title" class="game-loader-title">Loading Game Moves</div></center>
        <div class="game-loader-spinner loader" id="game-loader-spinner"></div>
      </div>
    `;
    }else{
      document.getElementById("arcade-main").innerHTML =` 
        <div class="arcade-initialize-game-container">
          <center>You are ready to ${(game_status)?"follow":"watch"} the game!</center>
          <button class="start-game-btn">enter game</button>
        </div>
      `;
      this.attachEvents(app, mod, slug);
    }


  },

  attachEvents(app, mod, slug) {
    try {
      if (document.querySelector(".start-game-btn")){
        document.querySelector(".start-game-btn").addEventListener("click", (e) => {
          window.location = "/" + slug;
        });  
      }
    } catch (err) {
      console.log("error in attach events! "+err);
    }
  },
};
