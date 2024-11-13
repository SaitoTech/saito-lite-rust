module.exports  = (title) => {
	return `
    <div class="attack-overlay">
      <div class="h2">Attack! -- ${this.deck[card].name}</div>
      <div class="overlay-img">${this.returnCardImage(card)}</div>
      <div class="attack_details"></div>
    </div>
  `;
};
