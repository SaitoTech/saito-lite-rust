module.exports = SaitoModuleTemplate = (payload = "", image = "", title = "", description = "") => {

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
