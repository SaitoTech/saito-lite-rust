module.exports  = (round, turn) => {
	return `
    <div class="turns" id="turns">
      <div class="round" id="round">${round}</div>
      <div class="turn" id="turn">${turn}</div>
      <div class="round-label">Round</div>
      <div class="turn-label">Turn</div>
    </div>
  `;
};
