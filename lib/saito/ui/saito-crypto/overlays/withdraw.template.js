module.exports  = (app, mod, obj) => {

  let amount = Number(obj.amount);
  let balance = Number(obj.balance);

  let html = `
  
  <form class="withdrawal-form" id="withdrawal-form" action="/" method="POST">

    <div class="saito-overlay-form" id="saito-withdraw-overlay">
        <div class="saito-overlay-form-header">
          <div class="saito-overlay-form-header-title">Send Token</div>
        </div>

        <div id="withdraw-step-one">
          <div class="dropdown-cont">
            <div class="saito-overlay-form-input">
                <div class="token-dropdown">

                  <div id="withdraw-logo-cont"> 
                    <img src="https://saito.io/saito/img/touch/pwa-192x192.png">
                  </div>
                  <select class="withdraw-select-crypto" id="withdraw-select-crypto">
                   
                  </select>
                </div>
            </div>

            <div class="withdraw-info-cont">
              <span class="withdraw-info-title">balance</span> 
              <div class="withdraw-info-value balance">${amount} ${obj.ticker}</div>
            </div>


            <div class="withdraw-info-cont">
`;
              if (obj.dynamicFee != true) {
  html +=       `<span class="withdraw-info-title">network fee</span>`;
              }
  html += `
              <div class="withdraw-info-value fee">
  `;              
              if (obj.dynamicFee == true) {
                html += `<input type="text" id="network-fee" placeholder="network fee" value="">`;
              } else {
                html += `--`;
              }
  html +=`            
              </div>
            </div>
          </div>

          <div class="saito-overlay-form-input">
            <div class="withdraw-address-cont" id="withdraw-address-cont">
              <div class="withdraw-identicon-container">
          `;

          if (obj.identicon != null) {
            html +=   `<img class="saito-identicon" src="${obj.identicon}" data-id="${obj.address}">`;
          }

          html +=  `
                <input type="text" autocomplete="off" class="input-elem withdraw_address" value="${obj.address}"
                id="withdraw-input-address" required="" placeholder="receiving address">
              </div>
            </div>
          </div>

          <div class="withdraw-error" id="withdraw-address-error"></div>

          <div class="input-elements-container">
            <div class="saito-overlay-form-input">
              <div class="withdraw-address-cont">
                <input data-amount-avl="${balance}" type="number" autocomplete="off" min="0" max="9999999999.99999999" step="0.00000001" 
                class="input-elem withdraw-input-amount" id="withdraw-input-amount" value="" required="" placeholder="amount to send">
                <div class="withdraw-options-cont">
                  <span id="withdraw-max-btn">MAX</span>
                </div>
              </div>
            </div>  
          </div>

          <div class="withdraw-error" id="withdraw-amount-error"></div>
          <div class="withdraw-error" id="withdraw-fee-error"></div>

          <input type="hidden" id="withdraw-ticker"  value="SAITO">
          <input type="hidden" id="withdraw-balance"  value="0">
          <input type="hidden" id="withdraw-asset-id"  value="">
          <input type="hidden" id="withdraw-sender"  value="">
          <input type="hidden" id="withdraw-fee"  value="">


          <div class="saito-overlay-form-submitline form-submit-container">
            <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Send</button>
          </div>

          <div class="withdraw-fee-cont ${(obj.ticker).toLowerCase()}">
            *Transfer fee on Saito network: <span id="withdraw-internal-fee-info">--</span> <br >
            <span id="withdraw-external-fee-span">External network fee: <span id="withdraw-external-fee-info">--</span></span>
          </div>

        </div>


        <div id="withdraw-step-two" class="hide-element">
          <div class="confirm-msg-container">
            <i class="withdraw-msg-icon fa-solid fa-circle-exclamation"></i>
            <img class="spinner" src="/saito/img/spinner.svg">
            <div class="confirm-msg">
              <span class="withdraw-msg-text">Send</span> <b><span class="withdraw-confirm-amount">0 SAITO</span></b> to address <b><span class="withdraw-confirm-address">wcyj2qSvmPsNcbEx9PnjXtNzsDoCf1Xtv9SqWH6wYxnk</span></b><span class="withdraw-msg-question">?</span> <br>
              <span class="withdraw-confirm-fee">(fee: 0 SAITO)</span>      
            </div>
          </div>

          <div class="saito-overlay-form-submitline confirm-submit">
            <button type="submit" class="saito-button-secondary" id="withdraw-cancel">Cancel</button> 
            <button type="submit" class="saito-button-primary" id="withdraw-confirm">Confirm</button>
          </div>
        </div>

    </div>


  </form>

  `;

	return html;
};
