module.exports = MixinAppspaceTemplate = (app) => {

  let mixin_mod = app.modules.returnModule("Mixin");

  let html = `

  <div class="saito-page-header">
    <div class="saito-button-secondary small" style="float: right;">Backup Wallet</div>
    <div class="saito-page-header-title">CRYPTO WALLET</div>
    <div class="saito-page-header-text">
      Saito supports third-party crypto balances. Send and receive tokens to your Saito wallet, or transfer them using applications on the Saito network. Please note this service is in BETA. And be sure to backup your entire wallet to avoid losing access to your funds.
    </div>
  </div>

  <div class="email-appspace-mixin">
  `;

  html += `

    <h5 class="transaction-header transaction-item">Balances</h5>
    <div class="history_container transaction-item" id="mixin-balance-container">
        <div class='item item-header'>Token</div>
        <div class='item item-header'>Balance</div>
        <div class='item item-header'></div>
        <div class='item item-header'></div>
    `;



 for (let i = 0; i < mixin_mod.mods.length; i++) {

    let xmod = mixin_mod.mods[i];

    html += `
        <div class='item'>${xmod.ticker}</div>
        <div class='item'>${xmod.balance}</div>
        <div class='item'>
            <a href="#" class="balances_deposit" data-assetid="${xmod.asset_id}" 
                data-confs="${xmod.confirmations}" data-address="${xmod.returnAddress()}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}">
                Deposit
            </a>
        </div>
        <div class='item'>
            <a href="#" class="balances_withdraw" data-assetid="${xmod.asset_id}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}" data-sender="${xmod.returnAddress()}">
            Withdraw
            </a>
        </div>
    `;
  }


html += `
    </div>
      

    <h5 class="transaction-header transaction-item">Transaction History</h5>
    <div class="mixin-txn-his-container">
        <div class="history_container transaction-item" id="mixin-txn-his-container">
            <div class='item item-header'>Time</div>
             <div class='item item-header'>Type</div>
             <div class='item item-header'>Asset</div>
             <div class='item item-header'>Amount</div>
             <div class='item item-header'>Status</div>
        </div>
      <div class="saito-button-secondary small activity_button" id="activity_button" >Load Account History</div>
    </div>

  </div>

  <style>

  #mixin-txn-his-container {
   display: none;
}

  .hide-btn {
    display: none;
}

.transaction-header {
    margin-top: 40px;
}

.history_container {
  border-radius: 8px;
  position: relative;
  border: 1px solid #e7ebed;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  line-height: 50px;
  flex-wrap: wrap; 
  font-size: 1.4rem;
}

.item {
  height: 50px;
  width: calc(100% * (1/5));
  flex-grow: 1;
}

.item-header {
  background-color: #e7ebed;
  font-weight: 700;
}

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

.deposit {
    color: #14b214;
}

.withdrawal {
    color: #e34927;
}

#mixin-balance-container .item {
    width: calc(100% * (1/4));
}

.mixin-his-created-at {
    font-size: 1.15rem;
}

  </style>
  `;

  return html;

}

