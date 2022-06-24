
module.exports = SaitoSidebarTemplate = (app, mod, align) => {

  let html = `
    <div class="saito-sidebar ${align}">
  `;
  if (align === "left") {
    html += `
     <div class="hamburger">
        <i id="icon" class="fas fa-bars"></i>
      </div>
    `;
  }
  html += `
    </div>
  `;

  return html;

}

