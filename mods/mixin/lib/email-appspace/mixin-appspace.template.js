module.exports = MixinAppspaceTemplate = (app) => {

  let mixin_mod = app.modules.returnModule("Mixin");

  let html = `

  <div class="email-appspace-mixin">

    <div class="balances_container" id="balances_container">

  `;

  html += `

      <div class="balances_header" id="balances_header">
	<div class="balances_header_title">Balances</div>
	<div class="balances_header_icons">
          <svg class="balances_header_icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path fill="none" d="M0 0h24v24H0z"></path><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"></path></svg>
        </div>
      </div>

      <div class="balances_body" id="balances_body">
        <div class="balances_table" id="balances_table">
	  <div class="balances_tablehead" id="balances_tablehead"></div>
  `;

  for (let i = 0; i < mixin_mod.mods.length; i++) {

    let xmod = mixin_mod.mods[i];

    html += `

	  <div class="balances_tablerow" id="balances_tablerow">
	    <div class="balances_tablecell" id="balances_tablecell">
	      ${xmod.ticker}
	    </div>
	    <div class="balances_tablecell" id="balances_tablecell">
	      ${xmod.balance}
	    </div>
	    <div class="balances_tablecell balances_link balances_deposit" data-assetid="${xmod.asset_id}" data-confs="${xmod.confirmations}" data-address="${xmod.returnAddress()}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance} id="balances_tablecell">
	      DEPOSIT
	    </div>
	    <div class="balances_tablecell balances_link balances_withdraw" data-assetid="${xmod.asset_id}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}" data-sender="${xmod.returnAddress()}" id="balances_tablecell">
	      WITHDRAW
	    </div>
	  </div>
    `;
  }

  html += `

	</div>
      </div>
    </div>

    <h5 class="transaction-header transaction-item">Transaction History</h5>
    <div class="activity_container" id="activity_container">
        <div class="history_container transaction-item">
            <div class='item item-header'>Time</div>
             <div class='item item-header'>Type</div>
             <div class='item item-header'>Asset</div>
             <div class='item item-header'>Amount</div>
             <div class='item item-header'>Status</div>
        </div>
      <div class="activity_button button" id="activity_button">load account history</div>
    </div>

  </div>

  `;

  return html;

}

