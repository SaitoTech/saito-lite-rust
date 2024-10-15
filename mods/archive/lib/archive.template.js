module.exports = (app, row) => {
	if (row) {
		return `<div class="archive-row">
					<div>${row.id}</div>
					<div>${row.publicKey}</div>
					<div>${row.sig}</div>
					<div>${row.field1}</div>
					<div>${row.field2}</div>
					<div>${row.field3}</div>
					<div>${app.browser.saneDateTimeFromTimestamp(row.created_at, false)}</div>
					<div>${app.browser.saneDateTimeFromTimestamp(row.updated_at, false)}</div>
					<div class="number">${app.browser.formatNumberWithCommas(row.tx_size)}</div>
					<div class="archive-button" data-tx='${row.tx}'>TX</div>
					<div>${row.preserve}</div>
					<div class="saito-button-secondary delete-me" data-id="${row.sig}">delete</div>
				</div>`;
	} else {
		return `<div class="archive-header archive-row">
					<div>ID</div>
					<div>From</div>
					<div>sig</div>
					<div>field1</div>
					<div>field2</div>
					<div>field3</div>
					<div>created at</div>
					<div>updated at</div>
					<div>TX Size</div>
					<div>TX</div>
					<div>SAVE</div>
				</div>`;
	}
};
