module.exports = SaitoModuleTemplate = (title = "", description = "", image = "/saito/img/dreamscape.png", payload = "") => {

  return `
    <div class="saito-module" data-payload="${payload}">
      <div class="saito-module-image-box">
         <div class="saito-module-image" style="background: url('${image}')"></div>
      </div>
      <div class="saito-module-details-box">
        <div class="saito-module-title">${title}</div>
        <div class="saito-module-description">${description}</div>
      </div>
    </div>
  `;

}

