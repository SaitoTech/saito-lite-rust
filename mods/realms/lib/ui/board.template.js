module.exports = BoardTemplate = () => {
	return `
    <div class="opponent">
      <div class="mana"></div>
      <div class="artifacts"></div>
      <div class="creatures"></div>

    </div>
    <div class="me">
      <div class="mana"></div>
      <div class="creatures"></div>
      <div class="artifacts"></div>
    </div>
  `;
};
