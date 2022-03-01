module.exports = GameLoadedTemplate = (game_id = -1) => {

  if (game_id === -1) {
    return ` 
      <div class="arcade-initialize-game-container">
        <center>Game Creator is Preparing Cryptographic Invitation...!</center>
      </div>
    `;  

  }

  return ` 
      <div class="arcade-initialize-game-container">
        <center>Your game is ready to start!</center>
        <button class="start-game-btn" id="${game_id}">start game</button>
      </div>
  `;  
  
}

