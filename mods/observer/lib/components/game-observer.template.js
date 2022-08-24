module.exports = GameObserverTemplate = (step) => {
  return `
    <div id="game-observer-hud" class="game-observer-hud">
      <div>
        <div id="game-observer-status" class="game-observer-status">Game Step: ${step}</div>
        <div id="game-observer-help"><i class="far fa-question-circle"></i></div>
        <div id="game-observer-help2"><i class="fas fa-book"></i></div>
      </div>
      <div id="game-observer-controls" class="game-observer-controls">
        <div id="game-observer-first-btn" class="game-observer-btn"><i class="fas fa-fast-backward"></i></div>
        <div id="game-observer-last-btn" class="game-observer-btn"><i class="fas fa-backward"></i></div>
        <div id="game-observer-play-btn" class="game-observer-btn play-state"><i class="fas fa-play"></i><i class="fas fa-pause"></i></div>
        <div id="game-observer-next-btn" class="game-observer-btn" ><i class="fas fa-forward"></i></div>
      </div>
      <div id="obstatus" class="status"></div>
      
    </div>
  `;
}

