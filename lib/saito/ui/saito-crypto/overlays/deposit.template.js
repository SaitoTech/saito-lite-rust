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
               <p class="profile-public-key" id="profile-public-key">${deposit_self.address}</p>
               <i class="fas fa-copy"></i>
           </div>

           <div class="network-confirmations">
                <span class="network-confirmations-count">0</span> network confirmations
           </div>
        </div>

    `;

	return html;
};
