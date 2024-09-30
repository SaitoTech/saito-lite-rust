module.exports = InstallAppOverlayTemplate = (app, mod, this_self) => {

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

    #publisher {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
  </style>

  <div class="saito-module-overlay saito-app-install-overlay">
    <div class="saito-module-header" style="background-image: url(${this_self.image});">
      <h1 class="saito-module-titlebar">${this_self.name}</h1>
    </div>

      <div class="saito-module-details">
        <div class="detail-key">Version</div>
        <div class="detail-value">${this_self.version}</div>

        <div class="detail-key">Publisher</div>
        <div class="detail-value" id="publisher">
          <div>${this_self.publisher}</div>
        </div>

        <div class="detail-key">Categories</div>
        <div class="detail-value">${this_self.categories}</div>

        <div class="detail-key">Description</div>
        <div class="detail-value">${this_self.description}</div>
      </div>

      <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-app-install-btn">Install</button>
    </div>


    
  `;
};
