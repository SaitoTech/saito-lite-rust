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

		</table>

		<input class="new_block_with_ticket" type="button" value="New Block (w/ golden ticket)" />
		<input class="new_block_no_ticket" type="button" value="New Block (w/o golden ticket)" />
		<input class="add_transaction_to_mempool" type="button" value="Add Transaction to Mempool" />

	`;

}
