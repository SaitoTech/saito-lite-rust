module.exports = (game_mod) => {
  let step = game_mod.game?.step?.game || 0;

  let html = `
    <div id="game-observer-hud" class="game-observer-hud">
      <div class="game-observer-hud-header">
        <div class="game-observer-header-table-button">${game_mod.game?.live ? `<div class="join-game">JOIN</div>` : ''}</div>
        <div id="game-observer-status" class="game-observer-status">Game Step: ${step}</div>
        <div class="game-observer-header-control">${game_mod.game?.live ? `<div id="game-observer-play-btn" class="game-observer-btn pause-state"><i class="fas fa-pause" title="Stop execution and queue all incoming game moves"></i></div>`: ''}</div>
      </div>`;
  
  if (!game_mod.game?.live){
    html +=  `<div id="game-observer-controls" class="game-observer-controls">
        <div id="game-observer-first-btn" class="game-observer-btn${
          step == 0 ? ' unavailable' : ''
        }"><i class="fas fa-fast-backward" title="Reset game to beginning state"></i></div>
        <div id="game-observer-last-btn" class="game-observer-btn${
          step == 0 ? ' unavailable' : ''
        }"><i class="fas fa-step-backward" title="Rewind one game move"></i></div>
        <div id="game-observer-play-btn" class="game-observer-btn play-state"><i class="fas fa-play" title="Play moves continually"></i><i class="fas fa-pause" title="Stop execution and queue all incoming game moves"></i></div>
        <div id="game-observer-next-btn" class="game-observer-btn play-state"><i class="fas fa-forward" title="Fast forward"></i><i class="fas fa-step-forward" title="Move forward one game step"></i></div>
      </div>`;
  }   
  
  html += `<div id="obstatus" class="status"></div>
    </div>
  `;

  return html;
};
