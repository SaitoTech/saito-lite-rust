module.exports = MixinWithdrawTemplate = (app, mod, withdraw_this) => {

  let html = `

  <div class="email-appspace-withdraw-overlay" id="email-appspace-withdraw-overlay">
  
    <div id="withdrawl-form-cont" class="decision-cont">
      
        
        <form class="withdrawal-form" id="withdrawal-form" action="/" method="POST">
          <div class="mixin-withdraw-input">
            <div class="input-heading">Receiving Address (${withdraw_this.deposit_ticker})</div>
            <input type="text" class="input-elem withdraw_address" value="" required>
          </div>

          <div class="mixin-withdraw-input">
            <div class="amount-cont">
              <div class="input-heading amount-item">Amount</div>
              <div class="amount-item" id="amount-avl" data-amount-avl="${withdraw_this.withdraw_balance}">
                Available Balance &nbsp; ${withdraw_this.withdraw_balance} ${withdraw_this.deposit_ticker}
              </div>
            </div>
            <div class="max-amount-error error-msg"></div>
            <input type="number" min="0" step="0.00000001" id="withdraw_amount" class="input-elem withdraw_amount" value="" required>
            <div class="max-amount-btn" id="max-amount-btn">MAX</div>
          </div>

           <div class="info-cont">
             <div class="info-item">
                <button type="submit" class="withdraw_submit">WITHDRAW</button>
             </div>
            </div>
        </form>
      
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

  `;

  return html;

}
