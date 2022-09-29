module.exports = SaitoModuleTemplate = (title = "", description = "", image = "/saito/img/dreamscape.png", payload = "", size = "") => {

  let html = `
    <div class="saito-module ${size}" data-id="${payload}">
      <div class="saito-module-image-box">
         <div class="saito-module-image" style="background-image: url('${image}')"></div>
      </div>
      <div class="saito-module-details-box">
        <div class="saito-module-title">${title}</div>
        <div class="saito-module-description">${description}</div>
      </div>
    </div>
  `;


  return html;
}

