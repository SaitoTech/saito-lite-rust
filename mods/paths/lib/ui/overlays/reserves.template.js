module.exports = (faction="allies") => {
	let html = `
      <div class="reserves-overlay ${faction}" id="reserves-overlay">
        <div class="units"></div>
        <div class="status"></div>
        <div class="controls"></div>
      </div>
  `;
	return html;
};
