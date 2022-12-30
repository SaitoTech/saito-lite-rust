
module.exports = ThemeSwitcherOverlayTemplate = (app, mod) => {

  let html = `
    <div class="saito-modal saito-modal-menu" id="saito-user-menu">
      <div class="saito-modal-content">
          <div id="user_menu_item_0" data-theme="lite" class="saito-modal-menu-option">
            <i class="fa-solid fa-sun"></i>
            <div>Lite</div>
          </div>  
         
          <div id="user_menu_item_1" data-theme="dark" class="saito-modal-menu-option">
            <i class="fa-solid fa-moon"></i>
            <div>Dark</div>
          </div>
      </div>
   </div>
  `;

  return html;

}