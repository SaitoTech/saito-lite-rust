
module.exports = ObserverLoader = {
  render(app, mod, slug = "") {

    if (!slug){
      document.getElementById("arcade-main").innerHTML = `  
      <div id="arcade-initialize-game-container" class="arcade-initialize-game-container">
        <center><div id="game-loader-title" class="game-loader-title">Your Game is Initializing</div></center>
        <div class="game-loader-spinner loader" id="game-loader-spinner"></div>
      </div>
    `;
    }else{
      document.getElementById("arcade-main").innerHTML =` 
        <div class="arcade-initialize-game-container">
          <center>You are ready to watch the game!</center>
          <button class="start-game-btn">watch game</button>
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
