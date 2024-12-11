module.exports = (app, mod) => {

	let html = `

		<style>
    /* Reset and general body styling */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
    	overflow-y: scroll;
    }

    body {
        font-family: Arial, sans-serif;
        background-color: #F5F6FA; /* Light background */
        color: #333333;
        display: flex;
        justify-content: center;
        padding: 2rem;
        overflow-y: scroll;
    }

    .dashboard-container {
        width: 100%;
        max-width: 1200px;
        background-color: #FFFFFF;
        border-radius: 8px;
        padding: 1.2rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        height: max-content;
    }

    /* Header and metrics section */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .header h2 {
        font-size: 2.2rem;
        font-weight: bold;
        color: #333333;
    }

    .metrics {
        display: flex;
        gap: 40px;
        margin-top: 8px;
    }

    .metric {
        text-align: center;
        font-size: 1rem;
    }

    .metric h3 {
        font-size: 1.8rem;
        font-weight: bold;
        color: #333333;
        margin-bottom: 4px;
    }

    .metric p {
        font-size: 1.5rem;
        color: #6c6464;
    }


    /* Tabs */
    .tabs {
        display: flex;
        gap: 16px;
        border-bottom: 1px solid #E0E0E0;
        margin-top: 0.5rem;
    }

    .tab {
        font-weight: bold;
        color: #333333;
        cursor: pointer;
        padding: 8px 0;
        position: relative;
    }

    .tab.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #007BFF; /* Active tab indicator color */
    }

    /* Search and filter buttons */
    .controls {
        display: flex;
        gap: 8px;
        margin-top: 0px;
        justify-content: flex-end;
    }

    .control-button {
        font-size: 1.2rem;
	    border-radius: 6px;
	    cursor: pointer;
    }

    /* Table styling */
    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th, .data-table td {
        padding: 6px 16px;
        text-align: left;
        font-size: 1.5rem;
    }

    .data-table th {
        color: #555555;
        background-color: #F9FAFB;
        font-weight: bold;
    }

    .data-table tr {
        border-bottom: 1px solid #E0E0E0;
    }

    .data-table td {
        color: #333333;
    }

    /* Visibility Score Bar */
    .visibility-score {
        display: flex;
        align-items: center;
    }

    .visibility-bar {
        width: 100px;
        height: 6px;
        background-color: #E0E0E0;
        border-radius: 3px;
        margin-left: 8px;
        position: relative;
    }

    .visibility-bar-fill {
        height: 6px;
        background-color: #007BFF;
        border-radius: 3px;
    }
</style>

		<div class="dashboard-container">
    <div class="header">
        <h2>SAITO ATR Explorer</h2>
    </div>

    <!--
    <div class="metrics">
        <div class="metric">
            <h3>5 secs</h3>
            <p class="positive">Heartbeat</p>
        </div>
        <div class="metric">
            <h3>100</h3>
            <p class="positive">Genesis Period</p>
        </div>
    </div>
    -->

    <div class="controls">
        <button class="saito-button-secondary control-button new_block_with_ticket">New Block (w/ golden ticket)</button>
        <button class="saito-button-secondary control-button new_block_no_ticket">New Block (w/o golden ticket)</button>
        <button class="saito-button-secondary control-button add_transaction_to_mempool" id="add_transaction_to_mempool">Add Transaction to Mempool</button>
    </div>

    <div class="tabs">
        <div class="tab active">Block data</div>
    </div>

    <table class="data-table blocktable">
        <thead>
            <tr class="table-header">
                <th>id</th>
                <th class="blockslot1"></th>
                <th class="blockslot2"></th>
                <th class="blockslot3"></th>
                <th class="blockslot4"></th>
                <th class="blockslot5"></th>
                <th class="blockslot6"></th>
                <th class="blockslot7"></th>
                <th class="blockslot8"></th>
                <th class="blockslot9"></th>
                <th class="blockslot10"></th>
            </tr>
        </thead>
        <tbody>
            <tr class="total_fees">
                <td>total_fees</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_fees_new">
                <td>total_fees_new</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_fees_atr">
                <td>total_fees_atr</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_total_fees">
                <td>avg_total_fees</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_total_fees_new">
                <td>avg_total_fees_new</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_total_fees_atr">
                <td>avg_total_fees_atr</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_payout_routing">
                <td>total_payout_routing</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_payout_mining">
                <td>total_payout_mining</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_payout_treasury">
                <td>total_payout_treasury</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_payout_graveyard">
                <td>total_payout_graveyard</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="total_payout_atr">
                <td>total_payout_atr</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_payout_routing">
                <td>avg_payout_routing</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_payout_mining">
                <td>avg_payout_mining</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_payout_treasury">
                <td>avg_payout_treasury</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_payout_graveyard">
                <td>avg_payout_graveyard</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_payout_atr">
                <td>avg_payout_atr</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_fee_per_byte">
                <td>avg_fee_per_byte</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="fee_per_byte">
                <td>fee_per_byte</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="avg_nolan_rebroadcast_per_block">
                <td>avg_nolan_rebroadcast_per_block</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="burn_fee">
                <td>burn_fee</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="difficulty">
                <td>difficulty</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="previous_block_unpaid">
                <td>previous_block_unpaid</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>
            <tr class="gtNum">
                <td>gtNum</td>
                <td class="blockslot1"></td>
                <td class="blockslot2"></td>
                <td class="blockslot3"></td>
                <td class="blockslot4"></td>
                <td class="blockslot5"></td>
                <td class="blockslot6"></td>
                <td class="blockslot7"></td>
                <td class="blockslot8"></td>
                <td class="blockslot9"></td>
                <td class="blockslot10"></td>
            </tr>

        </tbody>
    </table>
</div>
	`;

	return html;
}
