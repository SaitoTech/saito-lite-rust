module.exports  = (app, mod, deposit_self) => {
	let html = `
        <div class="saito-crypto-deposit-container">
           <div class="saito-crypto-header">Top up wallet</div>
           <div class="saito-crypto-wallet-state">
               <div class="wallet-balance">
                   <div class="balance-amount">0</div>
                   <div class="deposit-ticker">${deposit_self.ticker}</div>
               </div>
               <div id="deposit-qrcode" class="qrcode"></div>
               <div class="pubkey-containter">
                   <div class="profile-public-key" id="profile-public-key">
                        ${deposit_self.address.slice(0, 8)}...${deposit_self.address.slice(-8)}
                    </div>
                   <i class="fas fa-copy"></i>
               </div>
           </div>

           `;

    if (deposit_self?.desired_amount){
        html += `<div class="call-to-action">deposit ${deposit_self.desired_amount} to continue</div>`;
    }

    html +=  `
           <div class="network-confirmations">
                <span class="network-confirmations-count">0</span> network confirmations
           </div>
        </div>

    `;

	return html;
};
