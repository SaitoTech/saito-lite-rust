module.exports = (f) => {
	let html = `
    <div class="welcome welcome-${f}">
      <div class="welcome-title"></div>
      <div class="welcome-text"></div>
    </div>
  `;
	return html;
};
