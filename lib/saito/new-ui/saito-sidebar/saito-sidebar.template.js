
module.exports = SaitoSidebarTemplate = (app, mod, align) => {

  return `
    <div class="saito-sidebar ${align}">
      <div class="saito-left-sidebar-hamburger">
        <i id="icon" class="fas fa-bars"></i>
      </div>
    </div>
  `;

}

