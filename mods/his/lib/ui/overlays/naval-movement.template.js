module.exports = () => {
	let html = `
      <div class="naval-movement-overlay" id="naval-movement-overlay">
	<div class="origin">
          <div class="status"></div>
          <div class="controls"></div>
	</div>
	<div class="destination">
          <div class="dcontrols"></div>
        </div>
      </div>
  `;
	return html;
};
