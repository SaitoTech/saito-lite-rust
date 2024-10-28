module.exports = (app) => {

	let html = `<div class="archive-summary">
					<div class="archive-summary-title">TX COUNT: </div>
					<div id="tx-ct" class="archive-summary-value"></div>
					<div class="archive-summary-title">MEM USAGE: </div>
					<div id="db-size" class="archive-summary-value"></div>
					</div>`;

	return html;
}