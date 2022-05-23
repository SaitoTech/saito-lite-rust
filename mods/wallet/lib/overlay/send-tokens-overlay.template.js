module.exports = SendTokensOverlayTemplate = () => {

  let e = document.getElementById("header-token-select");
  let preferred_crypto = (e.options[e.selectedIndex].text).split(" ");

  let balance = preferred_crypto[0];
  let ticker = preferred_crypto[1];

  return `

    <div id="withdrawl-form-cont" class="decision-cont">
      
      <div class="no-margin">
        <div class="input-heading">Token</div>
        <p><b>${ticker}</b></p>
      </div>

        <div class="note withdrawl">
          Please enter an <b>${ticker}</b> address and amount for withdrawal. You will next confirm the 
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
              <div class="amount-item" id="amount-avl" data-amount-avl="${balance}">
                Available Balance &nbsp; ${balance} ${ticker}
              </div>
            </div>
            <div class="max-amount-error error-msg"></div>
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

    <div id="withdrawl-sent-cont" class="decision-cont">
      <p id="confirm-fee-text"></p>
      <a href="#" id="withdraw-fee-accept"> Yes </a> &nbsp;&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;&nbsp;
      <a href="#" id="withdraw-fee-reject"> Cancel withdraw</a>
    </div>



<style>
  .saito-overlay {
    background-color: whitesmoke;
    padding: 30px 40px;
    color: #222;
  }

  #withdrawl-confirm-cont, #withdrawl-sent-cont {
    display: none;
  }

  .decision-cont a {
    color: #222;
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
    margin-bottom: 25px;
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

  #confirm-fee-text {
    margin-bottom: 10px;
  }

  .withdraw_submit {
    border: 1px solid #fff;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    background-color: #2F213D;
    color: #fff;
  }

  .amount-cont {
    display: flex;
    justify-content: space-between;
  }

  .max-amount-btn {
    padding: 13px 15px;
    border: 2px solid #333;
    display: inline-block;
    position: absolute;
    right: 25px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    background-color: #2F213D;
    color: #fff;
  }

</style>

  `;
}
