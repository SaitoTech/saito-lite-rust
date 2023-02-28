module.exports = MixinWithdrawTemplate = (app, mod, withdraw_this) => {

  let html = `

  <form class="withdrawal-form" id="withdrawal-form" action="/" method="POST">
  <div class="saito-overlay-form" id="saito-withdraw-overlay">

  <div class="saito-overlay-form-header">
    <div class="saito-overlay-form-header-title">Send ${withdraw_this.deposit_ticker}</div>
  </div>
      
        
          <div class="saito-overlay-form-input">
            <div class="">Receiving Address (${withdraw_this.deposit_ticker})</div>
            <input type="text" class="input-elem withdraw_address" value="" required>
          </div>

          <div class="saito-overlay-form-input">
            <div class="amount-cont">
              <div class="amount-item-amount">Amount</div>
              <div class="amount-item-balance" id="amount-avl" data-amount-avl="${withdraw_this.withdraw_balance}">
                Available Balance &nbsp; ${withdraw_this.withdraw_balance} ${withdraw_this.deposit_ticker}
              </div>
              <div class="max-amount-btn" id="max-amount-btn">MAX</div>
            </div>
            <div class="max-amount-error error-msg"></div>
            <input type="number" min="0" step="0.00000001" id="withdraw_amount" class="input-elem withdraw_amount" value="" required>

          </div>

          <div class="saito-overlay-form-submitline">
            <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Send</button>
          </div>

      
    </div>

    <div id="withdrawl-confirm-cont" class="decision-cont">
      <p id="check-fee-text">Check fee for withdrawing?</p>
      <a href="#" id="withdraw-accept"> Yes </a> &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;
      <a href="#" id="withdraw-reject"> Cancel withdraw</a>
    </div>

    <div id="withdrawl-sent-cont" class="decision-cont">
      <p id="confirm-fee-text">Fee is 23, confirm withdraw?</p>
      <a href="#" id="withdraw-fee-accept"> Yes </a> &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;
      <a href="#" id="withdraw-fee-reject"> Cancel withdraw</a>
    </div>
    
  </div>
  </form>

  `;

  return html;

}
