module.exports = MixinWithdrawTemplate = (app, deposit_ticker, withdraw_balance=0) => {

  let html = `

  <div class="email-appspace-withdraw-overlay" id="email-appspace-withdraw-overlay">
  
    <div id="withdrawl-form-cont" class="decision-cont">
      
      <div class="mixin-withdraw-token-wrapper">
        <div class="input-heading">Token</div>
        <p>${deposit_ticker}</p>
      </div>
        
        <form class="withdrawal-form" id="withdrawal-form" action="/" method="POST">
          <div class="mixin-withdraw-input">
            <div class="input-heading">Receiving Address</div>
            <input type="text" class="input-elem withdraw_address" value="" required>
          </div>

          <div class="mixin-withdraw-input">
            <div class="amount-cont">
              <div class="input-heading amount-item">Amount</div>
              <div class="amount-item" id="amount-avl" data-amount-avl="${withdraw_balance}">
                Available Balance &nbsp; ${withdraw_balance} ${deposit_ticker}
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




<style>

  .mixin-withdraw-token-wrapper {
    margin-bottom: 2rem;
  }

  .mixin-withdraw-token-wrapper p {
    color: #fff;
  }

  #withdrawl-confirm-cont, #withdrawl-sent-cont {
    display: none;
  }

  .decision-cont a {
    color: #fff;
    transition: all 0.1s ease-in-out;
  }

  .decision-cont a:hover {
    color: #333;
  }

  .email-appspace-withdraw-overlay {
    width: 38vw;
    padding: 2rem;
    background-image: linear-gradient(to bottom right, #EA4843, #f78754);
    color: #fff;
    background-image: url(/saito/img/dreamscape.png);
    background-position: 0em;
    background-size: 120% 100%;
    color: white;
    border-radius: 1rem;
  }

  .mixin-withdraw-token-wrapper {
    margin-bottom: 2rem;
  }

  .mixin-withdraw-token-wrapper p {
    color: #fff;
  }

  .mixin-withdraw-input {
    margin-bottom: 1rem;
    position: relative;
    padding-bottom: 20px;
  }

  .no-margin {
    margin: 0px;
  }

  .max-amount-error {
    display: none;
    color: #5d1919;
  }

  .input-heading{
    margin-bottom: 10px;
    font-weight: 700;
    font-size: 18px;
  }

  .input-elem {
    width: 100% !important;
    height: 45px;
    padding: 10px 10px !important;
    font-size: 16px !important;
  }

  .info-cont {
    display: flex;
    justify-content: space-between;
  }

  .info-item {
  }

  .info-item-title {
    font-size: 13px;
    font-weight: 700;
  }

  .info-item-detail {
    font-size: 12px;
  }

  .note {
    margin-top: 30px;
    font-size: 12px;
  }

  .note.withdrawl {
    font-size: 15px;
    margin-top: 25px;
    margin-bottom: 30px;
  }

  .add-cont {
    display: flex;
    justify-content: space-between;
  } 

  .add-input-box {
  }

  .withdraw_submit {
    cursor: pointer;
    background-color: #fff;
    color: var(--saito-primary);
    font-size: 1.5rem;
  }

  .amount-cont {
    display: flex;
    justify-content: space-between;
  }

  .max-amount-btn {
    display: inline-block;
    background-color: #fff;
    color: #222;
    position: absolute;
    right: 1rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    top: 50%;
    transform: translateY(-10%);
  }

</style>

  `;

  return html;

}
