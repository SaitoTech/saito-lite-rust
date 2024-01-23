module.exports = DepositTemplate = (app, mod, deposit_self) => {
	let address = deposit_self.address;

	let html = `

        <div class="saito-crypto-deposit-container">
           <div class="qrcode" id="qrcode"></div>
           <div class="wallet-balance">
               <span class="balance-amount">0.0</span>
           </div>
           <div class="pubkey-containter">
               <p class="profile-public-key" id="profile-public-key">${address}</p>
               <i class="fas fa-copy"></i>
           </div>

           <div class="network-confirmations">
                <span class="network-confirmations-count">0</span> network confirmations
           </div>
        </div>

    `;

	return html;
};
