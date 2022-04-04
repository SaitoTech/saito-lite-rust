module.exports = MixinDepositTemplate = (app, deposit_address, deposit_confirmations, deposit_ticker) => {

  let html = `

  <div class="email-appspace-deposit-overlay">
    <div class="deposit_title">Deposit ${deposit_ticker}</div>
    <div class="deposit_desc">Only ${deposit_ticker} should be sent to this address. Deposits require ${deposit_confirmations} confirmations. Please do not deposit large amounts while Saito is under development due to risk of wallet compromise.</div>
    <div id="deposit_qrcode" class="deposit_qrcode"></div>
    <div class="deposit_address">${deposit_address}</div>
  </div>

<style>
.email-appspace-deposit-overlay {
  padding: 50px;
  border: 1px solid #efefef;
  background-color: white;
  max-width: 80vw;
}
.deposit_title {
  font-size: 2em;
}
.deposit_desc {
  font-size: 1.2em;
  line-height: 1.6em;
  padding-top: 10px;
  padding-bottom: 10px;
}
.deposit_qrcode {
  clear:both;
  margin-top: 10px;
  margin-bottom: 20px;
}
.deposit_address {
  font-size: 1.2em;
  font-weight: bold;
  letter-spacing: 0.05em;
}
  </style>

  `;

  return html;

}

