module.exports = (app, mod) => {

	let html = `

		<div class="dashboard-container">
    <div class="header">
        <h2>SAITO ATR Explorer</h2>
    </div>

    <div class="metrics">
        <div class="metric balance">
            <h3><span class='metric-amount'>0.00</span> <span class='metric-amount'>SAITO</span></h3>
            <p class="positive">Balance</p>
        </div>
        <!--<div class="metric utxo">
            <h3><span class='metric-utxo'></span></h3>
            <p class="positive">Spendable UTXO</p>
        </div>-->
    </div>

    <div class="controls">
        <button class="saito-button-secondary control-button new_block_with_ticket">New Block (w/ golden ticket)</button>
        <button class="saito-button-secondary control-button new_block_no_ticket">New Block (w/o golden ticket)</button>
        <button class="saito-button-secondary control-button add_transaction_to_mempool" id="add_transaction_to_mempool">Add Transaction to Mempool</button>
        <button class="saito-button-secondary control-button add_nft" id="add_nft">Add NFT</button>
        <button class="saito-button-secondary control-button send_nft" id="send_nft">Send NFT</button>
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
            <tr class="treasury total_supply_value">
                <td>treasury</td>
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
            <tr class="graveyard total_supply_value">
                <td>graveyard</td>
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
            <tr class="previous_block_unpaid total_supply_value">
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
            <tr class="total_fees total_supply_value">
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
            <tr class="utxo total_supply_value">
                <td>utxo</td>
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
            <tr class="total_supply total_supply_value">
                <td>total_supply</td>
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
            <tr class="total_payout_routing payout_value">
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
            <tr class="total_payout_mining payout_value">
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
            <tr class="total_payout_treasury payout_value">
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
            <tr class="total_payout_graveyard payout_value">
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
            <tr class="total_payout_atr payout_value">
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
            <tr class="total_fees_cumulative">
                <td>total_fees_cumulative</td>
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
            <tr class="total_fees total_supply_value">
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
            <tr class="hasGoldenTicket">
                <td>hasGoldenTicket</td>
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
        </tbody>
    </table>
</div>
	`;

	return html;
}
