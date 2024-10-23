module.exports = (app, mod) => {

	console.log("New block: ", mod.block_data);

	let variable = ``;
	let total_fees = ``;
	let total_fees_new = ``;
	let total_fees_atr = ``;
	let avg_total_fees = ``;
	let burn_fee = ``;
	for (let i=0; i < mod.block_data.length; i++) {
		let block = mod.block_data;

		console.log("block.cv.total_fees: ", block.cv.total_fees);
		variable += `<th>${block.id}</th>`;
		total_fees += `<td>${block.cv.total_fees}</td>`;
		total_fees_new += `<td>${block.cv.total_fees_new}</td>`;
		total_fees_atr += `<td>${block.cv.total_fees_atr}</td>`;
		avg_total_fees += `<td>${block.cv.avg_total_fees}</td>`;
		burnfee += `<td>${block.cv.burnfee}</td>`;
	}

	let html = `
			<table>
	      <tr>
	        <th>Variable</th>
	        ${variable}
	      </tr>

	      <tr>
					<td>total_fees</td>      
					${total_fees} 
	      </tr>

	      <tr>
					<td>total_fees_new</td>      
					${total_fees_new}   
	      </tr>

	      <tr>
					<td>total_fees_atr</td>      
					${total_fees_atr}     
	      </tr>

	      <tr>
					<td>avg_total_fees</td>      
					${avg_total_fees}      
	      </tr>
	      <tr>
					<td>burn_fee</td>      
					${burn_fee}    
	      </tr>
	    </table>

	    <input type="button" value="New Block (w/ golden ticket)" />
	    <input type="button" value="New Block (w/o golden ticket)" />
	    <input type="button" value="Add Transaction to Mempool" />
		`;


		return html;
}
