module.exports = GameCryptoTransferManagerReceive = (app, mod, sobj) => {
	
  let to_split = sobj.to[0].split('-');
  let to_publicKey =  (to_split)[0];
  let to_address = (typeof (to_split)[1] != 'undefined') ?
                    to_split[1].split('|')[0] : '';

  let to_identicon = app.keychain.returnIdenticon(to_publicKey);
  let to_username = app.keychain.returnUsername(to_publicKey);

  let from_split = sobj.from[0].split('-');
  let from_publicKey =  (from_split)[0];
  let from_address = (typeof (from_split)[1] != 'undefined') ?
                    from_split[1].split('|')[0] : '';
  let from_identicon = app.keychain.returnIdenticon(from_publicKey);
  let from_username = app.keychain.returnUsername(from_publicKey);

  let html = `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Waiting for Transfer</h2>

    <div class="amount">${sobj.amount} ${sobj.ticker}</div>

    <img class="spinner" src="/saito/img/spinner.svg" />
    <div class="amount hidden" id="cryptoManagerFeedback"></div>

    <div class="transfer-details">
      <div class="send_from">from</div>

      <div class="saito-identicon-box">
        <img class="saito-identicon" src="${from_identicon}">  
        <div class="transfer-address">
          <div class="to-publickey">${from_username}</div>
          ${(from_address != '') ? `<div class="to-address">${from_address}</div>` : ``}
        </div>
      </div>

      <div class="send_to">to</div>

      <div class="saito-identicon-box">
        <img class="saito-identicon" src="${to_identicon}">  
        <div class="transfer-address">
          <div class="to-publickey">${to_username}</div>
          ${(to_address != '') ? `<div class="to-address">${to_address}</div>` : ``}
        </div>
      </div>
    </div>

    <div class="button hidden saito-button-primary crypto_transfer_btn" id="crypto_receipt_btn">confirm</div>`;

	//If this is a game over transfer, don't show the checkbox...
	if (mod?.game?.over == 0) {
		html += `<div class="ignore"><input type="checkbox" id="ignore_checkbox" class="ignore_checkbox" /> do not ask again</div>`;
	}

	html += '</div>';
	return html;
};
