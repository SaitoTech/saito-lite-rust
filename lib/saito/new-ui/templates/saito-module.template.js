
module.exports = SaitoModuleTemplate = (app, mod, mod_title = "Module" , mod_slug = "", include_controls = 0) => {

  let ctls = '<div class="saito-module-controls"><i class="fas fa-solid fa-ellipsis-v"></i></div>';
  if (include_controls == 0) { ctls = '<div></div>'; }

  return `
    
    <div class="saito-module-image" style="background: url(/${mod_slug}/img/arcade/arcade.jpg); background-size: cover;">
      ${ctls}
      <div></div>
      <div class="saito-module-title">${mod_title}</div>
    </div>
  `;

}

