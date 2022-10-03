module.exports = SaitoModuleTemplate = (title = "", description = "", image = "/saito/img/dreamscape.png", payload = "", size = "", extra_column = "") => {

  if (image === "") { image = "/saito/img/dreamscape.png"; }

  let html = `
    <div class="saito-module ${size}" data-payload="${payload}">
      <div class="saito-module-image-box">
         <div class="saito-module-image" style="background-image: url('${image}')"></div>
      </div>
      <div class="saito-module-details-box">
        <div class="saito-module-title">${title}</div>
        <div class="saito-module-description">${description}</div>
      </div>
      ${extra_column}
    </div>
  `;

  return html;
}

