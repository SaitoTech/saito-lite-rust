
module.exports = SaitoModuleTemplate = (app, mod, mod_title = "Module" , mod_image_link = "", include_controls = 0) => {

  let ctls = '<div class="saito-module-controls"><i class="fas fa-solid fa-ellipsis-v"></i></div>';
  if (include_controls == 0) { ctls = '<div></div>'; }

  return `
    
    <div class="saito-module-image" style="background: url(${mod_image_link}); background-size: cover;">
      ${ctls}
      <div></div>
      <div class="saito-module-title">${mod_title}</div>
    </div>
  `;

}

