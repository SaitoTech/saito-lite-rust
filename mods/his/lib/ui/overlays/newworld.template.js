module.exports = () => {
	let help = `Voyages to the New World`;

	let html = `
      <div class="new-world-overlay" id="new-world-overlay">
	<div class="help">${help}</div>
	<div class="content">
          <div class="conquests">
            <div class="title">conquests</div>
          </div>
          <div class="colonies">
            <div class="title">colonies</div>
          </div>
          <div class="explorations">
            <div class="title">explorations</div>
          </div>
        </div>
      </div>
  `;
	return html;
};
