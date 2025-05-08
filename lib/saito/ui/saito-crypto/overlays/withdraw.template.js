module.exports = (app, mod, publickey = "", address = "") => {

  let identicon = null;

  if (publickey && app.wallet.isValidPublicKey(publickey)) {
    identicon = app.keychain.returnIdenticon(publickey);
  }

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
                  <div id="withdraw-logo-cont"></div>
                  <select class="withdraw-select-crypto" id="withdraw-select-crypto"></select>
                </div>
            </div>

            <div class="withdraw-info-cont">
              <span class="withdraw-info-title">balance</span> 
              <div class="withdraw-info-value balance">--</div>
            </div>


            <div class="withdraw-info-cont">
              <span class="withdraw-info-title">network fee</span> 
              <div class="withdraw-info-value fee">--</div>
            </div>
          </div>

          <div class="saito-overlay-form-input">
            <div class="withdraw-input-cont" id="withdraw-address-cont">
              <div class="withdraw-identicon-container">
          `;

  if (identicon != null) {
    html += `<img class="saito-identicon" src="${identicon}">`;
  }

  html += `
                <input type="text" autocomplete="off" class="input-elem withdraw_address" ${publickey ? "disabled" : ""} value="${address}"
                id="withdraw-input-address" required="" placeholder="receiving address">
          <div class="withdraw-error" id="withdraw-address-error"></div>
                </div>
            </div>
          </div>


          <div class="input-elements-container">
            <div class="saito-overlay-form-input">
              <div class="withdraw-input-cont" id="withdraw-amount-cont">
                <input type="number" autocomplete="off" min="0" max="9999999999.99999999" step="0.00000001" 
                class="input-elem withdraw-input-amount" id="withdraw-input-amount" value="" required="" placeholder="amount to send">
                <div class="withdraw-options-cont">
                  <span id="withdraw-max-btn">MAX</span>
                </div>
                <div class="withdraw-error" id="withdraw-amount-error"></div>
                <div class="withdraw-error" id="withdraw-fee-error"></div>
              </div>
            </div>  
          </div>


          <div class="saito-overlay-form-submitline form-submit-container">
            <button type="submit" class="saito-button-secondary" id="reset-form">Clear</button> 
            <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Send</button>
          </div>

          <div class="withdraw-fee-cont"></div>

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
