module.exports  = () => {
	return `
        <div class="game-overlay-menu" id="game-overlay-menu">
          <div>Game Rules:</div>
            <ul style="font-family: 'orbitron-medium', helvetica">
              <li class="menu-item" id="basic">Basic Rules</li>
              <li class="menu-item" id="movement">Moving Units</li>
              <li class="menu-item" id="production">Producing Units</li>
              <li class="menu-item" id="combat">Combat</li>
              <li class="menu-item" id="factions">Factions</li>
            </ul>
          </div>
  `;
};
