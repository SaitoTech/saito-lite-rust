module.exports = MixinWithdrawTemplate = (app, deposit_ticker, withdraw_balance=0) => {

  let html = `

  <div class="email-appspace-withdraw-overlay" id="email-appspace-withdraw-overlay">
  
    <div class="no-margin">
      <div class="input-heading">Token</div>
      <p>${deposit_ticker}</p>
    </div>

      <div class="note withdrawl">
      Please enter an ${deposit_ticker} address and amount for withdrawal. You will next confirm the 
      network withdrawal fee, which will be deducted from the total withdrawn. Please note withdrawal 
      functionality is in BETA and cross-chain token deposits are not supported
    </div>
    
    <div class="input-cont">
      <div class="input-heading">Receiving Address</div>
      <input type="text" class="input-elem withdraw_address" value="">
    </div>

    <div class="input-cont">
      <div class="amount-cont">
        <div class="input-heading amount-item">Amount</div>
        <div class="amount-item" id="amount-avl" data-amount-avl="${withdraw_balance}">
          Available Balance &nbsp; ${withdraw_balance} ${deposit_ticker}
        </div>
      </div>
      <input type="text" id="withdraw_amount" class="input-elem withdraw_amount" value="0.00">
      <div class="max-amount-btn" id="max-amount-btn">MAX</div>
    </div>

     <div class="info-cont">
       <div class="info-item">
          <div class="withdraw_submit">WITHDRAW</div>
       </div>
       </div>
    </div>
    
  </div>




<style>
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

