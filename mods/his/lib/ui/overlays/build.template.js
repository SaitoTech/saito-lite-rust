module.exports = () => {
	let html = `
          <div class="build-overlay hide-scrollbar">
	    <div class="build-controls">
              <div class="fewer-units"><i class="fa fa-caret-left"></i></div>
              <div class="unit-details">1</div>
              <div class="more-units"><i class="fa fa-caret-right"></i></div>
            </div>
	    <div class="build-submit">confirm and build</div>
          </div>
  `;
	return html;
};
