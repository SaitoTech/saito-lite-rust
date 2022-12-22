module.exports = ListSelectionModalTemplate = (app, mod, modal) => {
  return `
    <div class="game-selection-list-overlay">
      <div class="overlay-title">${modal.title}</div>
      <div class="text-prompt">${modal.prompt}</div>
      <ul class="selection-list" id="selection-list">${modal.list}</ul>
    </div>
  `;
}
