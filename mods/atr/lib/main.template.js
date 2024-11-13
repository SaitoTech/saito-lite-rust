module.exports = (app, mod) => {

	return `
		<table class="blocktable">

			<tr class="header">
				<th></th>
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
	    		<tr>

			<tr class="total_fees">
				<td>total_fees</td>
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

	    		<tr class="total_fees_new">
				<td>total_fees_new</td>
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

	    		<tr class="total_fees_atr">
				<td>total_fees_atr</td>
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

	    		<tr class="avg_total_fees">
				<td>avg_total_fees</td>
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

	    		<tr class="avg_total_fees_new">
				<td>avg_total_fees_new</td>
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

	    		<tr class="avg_total_fees_atr">
				<td>avg_total_fees_atr</td>
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

	    		<tr class="total_payout_routing">
				<td>total_payout_routing</td>
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

	    		<tr class="total_payout_mining">
				<td>total_payout_mining</td>
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

	    		<tr class="total_payout_treasury">
				<td>total_payout_treasury</td>
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

	    		<tr class="total_payout_graveyard">
				<td>total_payout_graveyard</td>
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

	    		<tr class="total_payout_atr">
				<td>total_payout_atr</td>
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

	    		<tr class="avg_payout_routing">
				<td>avg_payout_routing</td>
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

	    		<tr class="avg_payout_mining">
				<td>avg_payout_mining</td>
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

	    		<tr class="avg_payout_treasury">
				<td>avg_payout_treasury</td>
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

	    		<tr class="avg_payout_graveyard">
				<td>avg_payout_graveyard</td>
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

	    		<tr class="avg_payout_atr">
				<td>avg_payout_atr</td>
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

	    		<tr class="avg_fee_per_byte">
				<td>avg_fee_per_byte</td>
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

	    		<tr class="fee_per_byte">
				<td>fee_per_byte</td>
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

	    		<tr class="avg_nolan_rebroadcast_per_block">
				<td>avg_nolan_rebroadcast_per_block</td>
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

	    		<tr class="burnfee">
				<td>burnfee</td>
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

	    		<tr class="difficulty">
				<td>difficulty</td>
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

	    		<tr class="previous_block_unpaid">
				<td>previous_block_unpaid</td>
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

		</table>

		<div class="atr-btns">
			<div class="saito-button-primary new_block_with_ticket">New Block (w/ golden ticket)</div>
			<div class="saito-button-primary new_block_no_ticket">New Block (w/o golden ticket)</div>
			<div class="saito-button-primary add_transaction_to_mempool">Add Transaction to Mempool</div>
		</div>

		<style>

			.atr-btns {
				display: flex;
				gap: 1rem;
			}

			.atr-btns .saito-button-primary {
				max-width: max-content;
			}
		</style>

		<script type="text/javascript" src="/saito/saito.js" id="saito"></script>

	`;

}
