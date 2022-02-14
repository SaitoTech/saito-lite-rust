module.exports = GameCreateMenuTemplate = () => {
  return `
    <div class="arcade-sidebar-active-games-header" style="display:flex; align-items:center;justify-content: space-between">
      <h2>Games</h2>
    </div>
    <div class="arcade-games-wrapper">
      <ul class="arcade-games" id="arcade-games"></ul>
    </div>
  `;
}
