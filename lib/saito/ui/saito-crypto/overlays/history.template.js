module.exports = HistoryTemplate = (app, mod, this_history) => {

  let html = `
    <div class="mixin-overlay-history">
        <h5 class="transaction-header">Transaction History (<span class="ticker-placeholder">${this_history.ticker}</span>)</h5>
        <div class="mixin-txn-his-container saito-table">
            <div class="saito-table-header">
                <div>Time</div>
                 <div>Type</div>
                 <div>Amount</div>
                 <div>Status</div>
            </div>
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
}