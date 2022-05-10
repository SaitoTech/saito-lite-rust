module.exports = MixinWithdrawTemplate = (app, deposit_ticker, withdraw_balance=0) => {

  let html = `

  <div class="email-appspace-withdraw-overlay" id="email-appspace-withdraw-overlay">
  
    <div class="input-cont no-margin">
      <div class="input-heading">Token</div>
      <p>${deposit_ticker}</p>
    </div>

      <div class="note withdrawl">
      Please enter an ${deposit_ticker} address and amount for withdrawal. You will next confirm the 
      network withdrawal fee, which will be deducted from the total withdrawn. Please note withdrawal 
      functionality is in BETA and cross-chain token deposits are not supported
    </div>
    
        <div class="input-cont">
          <div class="input-heading">Amount</div>
          <input type="text" id="withdraw_amount" class="input-elem withdraw_amount" value="${withdraw_balance}">
        </div>
    
        <div class="input-cont">
          <div class="input-heading">Recieving Address</div>
          <input type="text" class="input-elem withdraw_address" value="">
        </div>
    
     <div class="info-cont">
       <div class="info-item">
          <div class="withdraw_submit">Withdraw</div>
       </div>
       </div>
    </div>
    
  </div>




<style>
  .email-appspace-withdraw-overlay {
    width: 40vw;
    padding: 50px 30px;
    background-image: linear-gradient(to bottom right, #EA4843, #f78754);
    color: #fff;
    text-shadow: 1px 1px 1px #444;
  }

  .input-cont {
    margin-bottom: 20px;
    postion: relative;
    padding-bottom: 10px;
  }

  .no-margin {
    margin: 0px;
  }

  .input-heading{
    margin-bottom: 10px;
    font-weight: 700;
  }

  .input-elem {
    height: 35px;
    padding: 7px 10px;
    position:relative;
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
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .add-cont {
    display: flex;
    justify-content: space-between;
  } 

  .add-input-box {
    width: 70%;
  }

  .withdraw_submit {
    border: 1px solid #fff;
    padding: 10px 15px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .withdraw_submit:hover {
    background-color: #fff;
    color: #000;
    text-shadow: none;
  }
</style>

  `;

  return html;

}

