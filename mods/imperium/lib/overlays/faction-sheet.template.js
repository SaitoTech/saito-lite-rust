module.exports  = (
	imperium_self,
	player,
	faction_name
) => {
	return `

  <div style="" class="faction-sheet p${player} bc${player}">

    <div class="faction-sheet-main">

      <div class="faction-sheet-header">
        <div class="faction-sheet-title">${faction_name}</div>
        <div class="faction-sheet-tokenbar"></div>
      </div>

      <div class="faction-sheet-action-cards"></div>
      <div class="faction-sheet-tech-cards"></div>
      <div class="faction-sheet-planets"></div>

    </div>

    <div class="faction-sheet-sidebar">
      <div class="faction-sheet-faction-abilities"></div>
      <div class="faction-sheet-faction-tech"></div>
    </div>

  </div>

  `;
};
