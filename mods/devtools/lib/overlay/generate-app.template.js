module.exports = InstallAppOverlayTemplate = (app, mod, this_self) => {

  console.log("template mod details:", this_self.mod_details);

	return `
  <style>
    .saito-app-install-overlay .saito-module-header {
      background-size: cover;
    }

    .saito-app-install-overlay .saito-module-titlebar {
      background: #000a;
      margin-bottom: 0rem;
    }

    #saito-app-generate-btn {
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
    <div class="saito-module-header" style="background-image: url(${this_self.mod_details.image});">
      <h1 class="saito-module-titlebar">${this_self.mod_details.name}</h1>
    </div>

      <div class="saito-module-details">
        <div class="detail-key">Version</div>
        <div class="detail-value">${this_self.mod_details.version}</div>

        <div class="detail-key">Publisher</div>
        <div class="detail-value" id="publisher">
          <div>${this_self.mod_details.publisher}</div>
        </div>

        <div class="detail-key">Categories</div>
        <div class="detail-value">${this_self.mod_details.categories}</div>

        <div class="detail-key">Description</div>
        <div class="detail-value">${this_self.mod_details.description}</div>
      </div>

      <button type="submit" class="withdraw-submit saito-button-primary fat saito-overlay-form-submit" id="saito-app-generate-btn">Generate App</button>
    </div>


    
  `;
};
