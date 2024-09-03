module.exports = (f) => {
	let html = `
    <div class="cardover cardover-${f}">
      <div class="cardover-title"></div>
      <div class="cardover-text"></div>
    </div>
  `;
	return html;
};
