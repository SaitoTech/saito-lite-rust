module.exports = SaitoOverlayTemplate = (component) => {
    return `  
      <div id="saito-overlay${component.ordinal}" class="${component.class}" style="z-index: ${100 + 2 * component.ordinal + 1};"></div>
      <div id="saito-overlay-backdrop${component.ordinal}" class="saito-overlay-backdrop ${component.class}-backdrop" style="z-index: ${100 + 2 * component.ordinal};"></div>
    `;

}

