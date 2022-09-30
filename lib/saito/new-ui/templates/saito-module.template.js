module.exports = SaitoModuleTemplate = (title = "", description = "", image = "/saito/img/dreamscape.png", payload = "", extra_columns = "") => {

  let html = `
    <div class="saito-module-alt" data-payload="${payload}">
      <div class="saito-module-alt-image-box">
         <div class="saito-module-alt-image" style="background-image: url('${image}')"></div>
      </div>
      <div class="saito-module-alt-details-box">
        <div class="saito-module-alt-title">${title}</div>
        <div class="saito-module-alt-description">${description}</div>
      </div>
      ${extra_columns}
    </div>
  `;


  return html;
}

