module.exports = ListSelectionModalTemplate = (header, prompt, list) => {
  return `
    <div class="game-selection-list-overlay">
      <div class="overlay-title">${header}</div>
      <div class="text-prompt">${prompt}</div>
      <ul class="selection-list" id="selection-list">${list}</ul>
    </div>
  `;
}
