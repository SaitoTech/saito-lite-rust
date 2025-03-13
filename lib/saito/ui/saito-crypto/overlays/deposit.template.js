module.exports  = (app, mod, deposit_self) => {
	let html = `
        <div class="saito-crypto-deposit-container">
           <div class="saito-crypto-header">Top up wallet</div>`;

    if (deposit_self?.desired_amount){
        html += `<div>You need ${deposit_self.desired_amount} to continue</div>`;
    }

    html +=  `<div id="deposit_qrcode"></div>
           <div class="wallet-balance">
               <span class="balance-amount">0.0</span>
               <span class="deposit-ticker">${deposit_self.ticker}</span>
           </div>
           <div class="pubkey-containter">
               <div class="profile-public-key" id="profile-public-key">
                    <div>${deposit_self.address.slice(0, -6)}</div>
                    <div>${deposit_self.address.slice(-6)}</div>
                </div>
               <i class="fas fa-copy"></i>
           </div>

           <div class="network-confirmations">
                <span class="network-confirmations-count">0</span> network confirmations
           </div>
        </div>

    `;

	return html;
};
