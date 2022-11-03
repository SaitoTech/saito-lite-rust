module.exports = GameCreateMenuTemplate = (games = "") => {
  return `
    <div class="game-selection-list-overlay">
      <h2>Games</h2>
    </div>
    <div class="arcade-games-wrapper">
      <ul class="arcade-games" id="arcade-games">${games}</ul>
    </div>
  `;
}
