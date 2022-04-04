module.exports = MixinWithdrawTemplate = (app, deposit_ticker, withdraw_balance=0) => {

  let html = `

  <div id="email-appspace-withdraw-overlay" class="email-appspace-withdraw-overlay">
    <div class="withdraw_title">Withdraw ${deposit_ticker}</div>
    <div class="withdraw_desc">Please enter an ${deposit_ticker} address and amount for withdrawal. You will next confirm the network withdrawal fee, which will be deducted from the total withdrawn. Please note withdrawal functionality is in BETA and cross-chain token deposits are not supported:</div>
    <div class="withdraw_container">
	<div class="withdraw_label">amount: </div>
	<div><input type="text" id="withdraw_amount" class="withdraw_amount" value="${withdraw_balance}" /></div>
	<div class="withdraw_label">address: </div>
        <div><input type="text" id="withdraw_amount" class="withdraw_address" value="" /></div>
    </div>
    <div class="withdraw_submit button">withdraw</div>
  </div>

<style>
.withdraw_container {
  display: grid;
  grid-template-columns: 120px auto;
  grid-template-rows: 1fr 1fr;
}
.email-appspace-withdraw-overlay {
  padding: 50px;
  border: 1px solid #efefef;
  background-color: white;
  max-width: 80vw;
}
.withdraw_title {
  font-size: 2em;
}
.withdraw_desc {
  font-size: 1.2em;
  line-height: 1.6em;
  padding-top: 10px;
  padding-bottom: 10px;
}
.withdraw_label {
  display: flex;
  align-items: center;
}
.withdraw_address {
  font-size: 1.2em;
  letter-spacing: 0.05em;
  width: 90%;
}
.withdraw_submit {
  clear: both;
  font-size: 1.2em;
  font-weight: bold;
  letter-spacing: 0.05em;
  max-width: 120px;
  text-align: center;
  margin-top: 20px;
}

  `;

  return html;

}

