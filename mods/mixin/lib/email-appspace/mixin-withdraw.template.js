module.exports = MixinWithdrawTemplate = (app, deposit_ticker, withdraw_balance=0) => {

  let html = `

  <div class="email-appspace-withdraw-overlay" id="email-appspace-withdraw-overlay">
  
    <div id="withdrawl-form-cont" class="decision-cont">
      
      <div class="no-margin">
        <div class="input-heading">Token</div>
        <p>${deposit_ticker}</p>
      </div>

        <div class="note withdrawl">
          Please enter an ${deposit_ticker} address and amount for withdrawal. You will next confirm the 
          network withdrawal fee, which will be deducted from the total withdrawn. Please note withdrawal 
          functionality is in BETA and cross-chain token deposits are not supported
        </div>
        
        <form class="withdrawal-form" id="withdrawal-form" action="/" method="POST">
          <div class="input-cont">
            <div class="input-heading">Receiving Address</div>
            <input type="text" class="input-elem withdraw_address" value="" required>
          </div>

          <div class="input-cont">
            <div class="amount-cont">
              <div class="input-heading amount-item">Amount</div>
              <div class="amount-item" id="amount-avl" data-amount-avl="${withdraw_balance}">
                Available Balance &nbsp; ${withdraw_balance} ${deposit_ticker}
              </div>
            </div>
            <div class="max-amount-error error-msg">Error: Amount shouldnt be greater than max amount (${withdraw_balance} ${deposit_ticker})</div>
            <input type="number" min="0" step="0.00000001" id="withdraw_amount" class="input-elem withdraw_amount" value="" required>
            <div class="max-amount-btn" id="max-amount-btn">MAX</div>
          </div>

           <div class="info-cont">
             <div class="info-item">
                <input type="submit" class="withdraw_submit" value="WITHDRAW">
             </div>
            </div>
        </form>
      
    </div>

    <div id="withdrawl-confirm-cont" class="decision-cont">
      <p class="check-fee-text">Check fee for withdrawing?</p>
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
    width: 45vw;
    padding: 50px 30px;
    background-image: linear-gradient(to bottom right, #EA4843, #f78754);
    color: #fff;
    text-shadow: 1px 1px 1px #444;
  }

  .input-cont {
    margin-bottom: 40px;
    postion: relative;
    border-bottom: 1px solid #fff;
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
    border: 1px solid #fff;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
     background-color: #fff;
    color: #000;
  }

  .amount-cont {
    display: flex;
    justify-content: space-between;
  }

  .max-amount-btn {
    padding: 9px 15px;
    border: 2px solid #333;
    display: inline-block;
    background-color: #fff;
    color: #222;
    position: absolute;
    right: 25px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .max-amount-btn:hover {
    background-color: #222;
    color: #fff;
  }
</style>

  `;

  return html;

}

