module.exports = () => {
	let html = `
      <div class="zoom-overlay" id="zoom-overlay">
        <div class="status"></div>
        <div class="controls"></div>
        <div class="next"><i class="fa fa-caret-right" aria-hidden="true"></i></div>
        <div class="last"><i class="fa fa-caret-left" aria-hidden="true"></i></div>
      </div>
  `;
	return html;
};
