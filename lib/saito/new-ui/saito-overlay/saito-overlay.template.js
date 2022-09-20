module.exports = SaitoOverlayTemplate = (ordinal) => {
    return `  
      <div id="saito-overlay${ordinal}" class="saito-overlay" style="z-index: ${100 + 2 * ordinal + 1};"></div>
      <div id="saito-overlay-backdrop${ordinal}" class="saito-overlay-backdrop" style="z-index: ${100 + 2 * ordinal};"></div>
    `;

}

