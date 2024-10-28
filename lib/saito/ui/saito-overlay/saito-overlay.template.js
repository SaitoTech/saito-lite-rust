module.exports  = (component) => {
	return `  
      <div id="saito-overlay${component.ordinal}" class="${component.class} center-overlay" style="z-index: ${component.zIndex};"></div>
      <div id="saito-overlay-backdrop${component.ordinal}" class="saito-overlay-backdrop ${component.class}-backdrop" style="z-index: ${component.zIndex - 1};"></div>
    `;
};
