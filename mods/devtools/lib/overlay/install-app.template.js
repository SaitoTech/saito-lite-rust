module.exports = InstallAppOverlayTemplate = (app, mod, this_self) => {

	return `
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
