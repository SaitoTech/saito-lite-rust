module.exports = MixinAppspaceTemplate = (app) => {

  let mixin_mod = app.modules.returnModule("Mixin");

  let html = `

  <div class="email-appspace-mixin">

    <div class="balances_container" id="balances_container">

  `;

  if (mixin_mod.mixin.user_id == "") { html += `<div class="create_account button" id="create_account">Create Account</div>`; }

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

    <div class="activity_container" id="activity_container">
      <div class="activity_button button" id="activity_button">load account history</div>
    </div>

  </div>

  <style>
.activity_button {
  margin-top: 20px;
  max-width: 200px;
  text-align: center;
}
.balances_container {
    box-shadow: 0px 1px 3px 0px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 2px 1px -1px rgb(0 0 0 / 12%);
    border-radius: 4px;
    color: rgba(0, 0, 0, 0.87);
    font-size: 1.5rem;
    font-weight: 400;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    line-height: 1.35417em;
    padding: 15px;
}
.balances_header {
    display: flex;
}
.balances_header_title {
    flex: 1 1 auto;
}
.balances_header_icons {
}
.balances_header_icon {
    fill: currentColor;
    width: 1em;
    height: 1em;
    display: inline-block;
    font-size: 24px;
    transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    user-select: none;
    flex-shrink: 0;
    display: none;
}
.balances_table {
    width: 100%;
    display: table;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    border-spacing: 0;
    border-collapse: collapse;
}
.balances_tablehead {
    display: table-header-group;
}
.balances_tablerow {
    color: inherit;
    height: 48px;
    display: table-row;
    outline: none;
    vertical-align: middle;
    box-sizing: inherit;
}
.balances_tablerow:hover {
    background-color: #e7e7e7;
}
.balances_tablecell {
    cursor: pointer;
    color: rgba(0, 0, 0, 0.87);
    font-size: 1.2rem;
    font-weight: 400;
    display: table-cell;
    padding: 4px 56px 4px 24px;
    text-align: left;
    border-bottom: 1px solid rgba(224, 224, 224, 1);
    vertical-align: inherit;
}
.balances_link {
    font-size: 1.2rem;
    font-weight: 400;
}
.balances_withdraw {
}
.balances_deposit {
}
  </style>

  `;

  return html;

}

