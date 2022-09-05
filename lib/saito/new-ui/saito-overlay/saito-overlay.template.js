module.exports = SaitoOverlayTemplate = (ordinal="") => {
    return `  
      <div id="saito-overlay${ordinal}" class="saito-overlay saito-overlay${ordinal}"></div>
      <div id="saito-overlay-backdrop${ordinal}" class="saito-overlay-backdrop saito-overlay-backdrop${ordinal}"></div>
    `;

}

