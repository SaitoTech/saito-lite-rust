module.exports = SaitoModuleImageBoxTemplate = (mod_name="Saito Module", mod_image="/saito/img/dreamscape.png", mod_sig = "", mod_link = "") => {

  return `
    <div class="saito-module-imagebox">
      <div class="saito-module-imagebox-titlebar">
	<span class="saito-module-imagebox-title">${mod_name}</span>
	<div class="saito-module-imagebox-button saito-button-secondary small" data-id="${mod_sig}">${mod_link}</div>
      </div>
    </div>
  `;

}

