module.exports = InstallAppOverlayTemplate = (app, mod) => {

	return `
  <style>
    .saito-app-install-overlay .saito-module-header {
      background-size: cover;
    }

    .saito-app-install-overlay .saito-module-titlebar {
      background: #000a;
      margin-bottom: 0rem;
    }

    #saito-app-install-btn {
      max-width: 30rem;
      align-items: flex-end;
      align-self: end;
      background: #029b02;
      margin-right: 1rem;
      margin-bottom: 1rem;
    }
  </style>

  <div class="saito-module-overlay saito-app-install-overlay">
    <div class="saito-module-header" style="background-image: url(https://images.nintendolife.com/5c5f499d4a78d/mk7-banner.large.jpg);">
      <h1 class="saito-module-titlebar">Mario Kart</h1>
    </div>

      <div class="saito-module-details">
        <div class="detail-key">Version</div>
        <div class="detail-value">1.00</div>

        <div class="detail-key">Publisher</div>
        <div class="detail-value">Saito</div>

        <div class="detail-key">Categories</div>
        <div class="detail-value">Entertainment</div>

        <div class="detail-key">Description</div>
        <div class="detail-value">Mario kart game on saito blockchain</div>
      </div>

      <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-app-install-btn">Install</button>
    </div>


    
  `;
};
