module.exports = MixinAppspaceTemplate = (app) => {

  let mixin_mod = app.modules.returnModule("Crypto Wallet");

  let account_created = (mixin_mod.mixin.publickey !== "") ? true : false;

  let html = `

  <div class="redsquare-page-header">
`;

    if (account_created) {
        html += ` <div class="saito-button-secondary small" style="float: right;" id="mixin-backup-btn">Backup Wallet</div>`;
    }

    html += `    <div class="redsquare-page-header-title">CRYPTO WALLET</div>
  </div>

  <div class="mixin-appspace">
  `;

if (!account_created) {
    html += `
        
        <p id="mixin-warning-note">Third-party cryptocurrency support in Saito is experimental. If your browser wallet is compromised you may lose all crypto you upload.
        Please be sensible and do not put more than 25 USD worth of crypto in your live wallet while our network is under development.
        </p>
        <div class="saito-button-primary small" id="mixin-create-wallet" >Enable Third Party Cryptos</div>

        `;
} else {

  html += `

    <div class="mixin-items-container saito-table" id="mixin-balance-container">

        <div class="saito-table-header">
            <div>Token</div>
            <div>Balance</div>
        </div>
        <div class="saito-table-body">
    `;


 for (let i = 0; i < mixin_mod.mods.length; i++) {

    let xmod = mixin_mod.mods[i];

    html += `
        <div class="saito-table-row">
            <div>${xmod.ticker}</div>
            <div>${xmod.balance}</div>
            <div>
                <a href="#" class="mixin-balances_deposit" data-assetid="${xmod.asset_id}" 
                    data-confs="${xmod.confirmations}" data-address="${xmod.returnAddress()}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}">
                    Deposit
                </a>
            </div>
            <div>
                <a href="#" class="mixin-balances_withdraw" data-assetid="${xmod.asset_id}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}" data-sender="${xmod.returnAddress()}">
                Withdraw
                </a>
            </div>
            <div>
                <a href="#" class="mixin-balance-history" data-assetid="${xmod.asset_id}" data-ticker="${xmod.ticker}" data-balance="${xmod.balance}" data-sender="${xmod.returnAddress()}">
                    History
                </a>
            </div>
        </div>
    `;
  }


html += `
        </div>
    </div>
      `;

}


html +=`

  </div>
  `;

  return html;

}

