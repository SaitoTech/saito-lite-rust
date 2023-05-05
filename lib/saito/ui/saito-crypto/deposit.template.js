module.exports = DepositTemplate = (app, mod, deposit_self) => {

    let publickey = app.wallet.returnPublicKey();

    let html = `

        <div class="saito-crypto-deposit-container">
           <div id="deposit-qrcode"></div>
           <div class="wallet-balance">
               <span class="balance-amount">0.0</span>
           </div>
           <div class="pubkey-containter">
               <p class="profile-public-key" id="profile-public-key">${publickey}</p>
               <i class="fas fa-copy"></i>
           </div>

           <div class="network-confirmations">
                <span class="network-confirmations-count">20</span> network confirmations
           </div>
        </div>

    `;

    return html;

}