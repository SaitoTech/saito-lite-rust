module.exports = MixinDepositTemplate = (app, deposit_address, deposit_confirmations, deposit_ticker) => {

  let html = `

  <div class="email-appspace-deposit-overlay">
  
  <div class="add-cont">
    <div class="add-item-cont add-input-box">
      <div class="input-cont">
        <div class="input-heading">Token</div>
        <p>${deposit_ticker}</p>
      </div>

      <div class="input-cont">
        <div class="input-heading">Deposit Address</div>
        <input class="input-elem public-address" value="${deposit_address}">
        <i class="fas fa-copy fa-regular" id="copy-deposit-add"></i>
      </div>
    </div>
    
    <div class="add-item-cont qrcode" id="qrcode">
      
    </div>
    
  </div>
  
   <div class="info-cont">
     <div class="info-item">
        <div class="info-item-title">
          Minimum Deposit
       </div>
       <div class="info-item-detail">
          0.01 ${deposit_ticker}   
       </div>
     </div>

      <div class="info-item">
        <div class="info-item-title">
          Maximum Deposit
       </div>
       <div class="info-item-detail">
          10.00 ${deposit_ticker}   
       </div>
     </div>

      <div class="info-item">
        <div class="info-item-title">
          Expected Arrival
       </div>
       <div class="info-item-detail">
          ${deposit_confirmations} network confirmations   
       </div>
     </div>
  </div>
  
  <div class="note">
    * Please do not deposit large amounts while Saito is under development due to risk of wallet compromise. <br >
    * To see your deposit address, please <b>activate ${deposit_ticker}</b> on the sidebar and refresh the page.
  </div>
  
</div>

<style>
  
  .email-appspace-deposit-overlay {
    width: 40vw;
    padding: 60px 30px;
    background-image: linear-gradient(to bottom right, #EA4843, #ED6B30);
    color: #fff;
    text-shadow: 1px 1px 1px #444;
    postion: relative;
  }

  .email-appspace-deposit-overlay p {
    font-size: 17px;
  }

  .input-cont {
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 10px;
  }

  .input-heading{
    margin-bottom: 10px;
    font-weight: 700;
    font-size: 18px;
  }

  .input-elem {
    width: 99%;
    height: 35px;
    padding: 7px 10px;
    position:relative;
  }

  #copy-deposit-add {
    position: absolute;
    top: 54%;
    right: 4%;
    color: #444;
    cursor: pointer;
  }

  .copy-check::before {
    content:  "\f00c";
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
    font-size: 13px;
  }

  .add-cont {
    display: flex;
    justify-content: space-between;
  }

  .add-item-cont {
  }

  #qrcode img {
    height: 17vh;
  }

  .add-input-box {
    width: 70%;
  }

  .email-appspace-deposit-overlay {
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

