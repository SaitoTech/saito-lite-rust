module.exports = SaitoModuleImageBoxTemplate = (mod_name="Saito Module", mod_image="/saito/img/dreamscape.png", payload = "", mod_link = "") => {

  let b = '';
  if (mod_link != "") {
    b = `<div class="saito-module-imagebox-button saito-button-secondary small" data-id="${payload}">${mod_link}</div>`; 
  }

  return `
    <div class="saito-module-imagebox" style="background-image: url('${mod_image}');">
      <div class="saito-module-imagebox-titlebar">
	       <span class="saito-module-imagebox-title">${mod_name}</span>
	       ${b}
      </div>
    </div>
  `;

}

