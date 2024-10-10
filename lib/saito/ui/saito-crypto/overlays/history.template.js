module.exports  = (app, mod, this_history) => {
	let html = `
    <div class="mixin-overlay-history">
        <h5 class="transaction-header">Transaction History</h5>
        <div class="mixin-txn-his-container saito-table">
            <div class="saito-table-header">
                <div>Time (UTC)</div>
                 <div>Type</div>
                 <div>Amount</div>
                 <div>Balance</div>
                 <div>To/From</div>
            </div>
            <div id="saito-history-loader"></div>
            <div class="saito-table-body">

                <p>Loading history...</p>
            </div
        </div>

          <nav class="pagination-container">
            <div class="pagination-button" id="prev-button" aria-label="Previous page" title="Previous page">
              &lt;
            </div>

            <div id="pagination-numbers">

            </div>

            <div class="pagination-button" id="next-button" aria-label="Next page" title="Next page">
              &gt;
            </div>
          </nav>
    </div>
  `;

	return html;
};
