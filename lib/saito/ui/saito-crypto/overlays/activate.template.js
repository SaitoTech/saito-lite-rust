module.exports  = (ticker, address, confirmations) => {
	return `
    <div class="crypto-activation-overlay" id="crypto-activation-overlay">
      <div class="crypto-activation-title">${ticker} Activated</div>
      <div class="crypto-activation-message">
        <div>When ${ticker} is active your slide-in menu will show your ${ticker} QRCode and deposit address. Deposits require ${confirmations} confirmations.
        <div class="crypto-activation-wallet"></div>
        <div>New access keys have been added to your wallet. Please back-up afresh.</div>
      </div>
      <button class="crypto-activation-confirm crypto-activation-button button">Got It!</button>
     </div>
  `;
};
