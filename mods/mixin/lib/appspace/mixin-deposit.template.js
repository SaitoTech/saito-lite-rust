module.exports = MixinDepositTemplate = (app, deposit_self) => {

  let html = `

  <div class="email-appspace-deposit-overlay">
  
  <div class="add-cont">
    <div class="add-item-cont add-input-box">
      <div class="input-cont">
        <div class="input-heading">Token</div>
        <p>${deposit_self.deposit_ticker}</p>
      </div>

      <div class="input-cont">
        <div class="input-heading">Deposit Address</div>
        <input class="input-elem public-address" value="${deposit_self.deposit_address}">
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
          0.01 ${deposit_self.deposit_ticker}   
       </div>
     </div>

      <div class="info-item">
        <div class="info-item-title">
          Maximum Deposit
       </div>
       <div class="info-item-detail">
          10.00 ${deposit_self.deposit_ticker}   
       </div>
     </div>

      <div class="info-item">
        <div class="info-item-title">
          Expected Arrival
       </div>
       <div class="info-item-detail">
          ${deposit_self.deposit_confirmations} network confirmations   
       </div>
     </div>
  </div>
  
  <div class="note">
    * Please do not deposit large amounts while Saito is under development due to risk of wallet compromise. <br >
    * To see your deposit address, please <b>activate ${deposit_self.deposit_ticker}</b> on the sidebar and refresh the page.
  </div>
  
</div>
  `;

  return html;

}

